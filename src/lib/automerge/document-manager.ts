/*
 * @Author: lll 347552878@qq.com
 * @Date: 2025-10-28 18:57:34
 * @LastEditors: lll 347552878@qq.com
 * @LastEditTime: 2025-11-08 14:32:00
 * @FilePath: /resume/src/lib/automerge/document-manager.ts
 * @Description: 文档管理器,负责文档的创建、加载、保存
 */
import type { DocHandle, Repo } from '@automerge/automerge-repo'
import type { AutomergeResumeDocument, ChangeFn } from './schema'
import type { CollaborationCallbacks } from './supabase-network-adapter'
import type { ResumeSchema } from '@/lib/schema'
import { next as Automerge } from '@automerge/automerge'
import { logger } from '@/lib/logger'
import { DEFAULT_ORDER, DEFAULT_VISIBILITY } from '@/lib/schema'
import supabase from '@/lib/supabase/client'
import { byteaToUint8Array, uint8ArrayToBase64 } from './binary-utils'
import { getAutomergeRepo } from './repo'
import { SupabaseNetworkAdapter } from './supabase-network-adapter'

export class DocumentManager {
  private handle: DocHandle<AutomergeResumeDocument> | null = null
  private resumeId: string
  private userId: string
  private isInitializing: boolean = false
  private repo: Repo | null = null
  private networkAdapter: SupabaseNetworkAdapter | null = null
  private currentSessionId: string | null = null
  private saveListeners = new Set<(result: { success: boolean, error?: unknown }) => void>()
  private saveStartListeners = new Set<() => void>()
  private canPersistToSupabase = true

  constructor(resumeId: string, userId: string) {
    this.resumeId = resumeId
    this.userId = userId
  }

  /**
   * 初始化文档
   * 从 Supabase 加载现有文档，如果不存在，创建新文档并保存 URL
   */
  async initialize() {
    this.isInitializing = true

    const repo = getAutomergeRepo(this.resumeId)
    this.repo = repo

    // 从 Supabase AutoMergeDoc 加载
    const existingHandle = await this.loadFromSupabaseAutomerge(repo)
    if (existingHandle) {
      this.handle = existingHandle
      this.isInitializing = false
      this.networkAdapter?.setLocalDocumentInfo({
        documentUrl: this.getDocumentUrl(),
        documentId: this.getDocumentId(),
      })
      return existingHandle
    }

    // 从 Supabase resume_config 表加载数据
    const supabaseData = await this.loadFromSupabaseConfig()

    // 创建新的 Automerge 文档
    const handle = repo.create<AutomergeResumeDocument>()

    handle.change((doc) => {
      doc._metadata = {
        resumeId: this.resumeId,
        userId: this.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }

      // 复制 Supabase 数据到 Automerge 文档
      if (supabaseData) {
        Object.assign(doc, supabaseData)
      }

      // 确保 order 和 visibility 有默认值
      if (!doc.order || doc.order.length === 0) {
        doc.order = [...DEFAULT_ORDER]
      }
      if (!doc.visibility) {
        doc.visibility = { ...DEFAULT_VISIBILITY }
      }
    })

    this.handle = handle

    // 等待文档就绪
    await handle.whenReady()

    this.networkAdapter?.setLocalDocumentInfo({
      documentUrl: this.getDocumentUrl(),
      documentId: this.getDocumentId(),
    })

    // 立即保存到 Supabase（将 documentUrl 写入 metadata），确保其他窗口能加载到相同的文档
    if (this.canPersistToSupabase) {
      await this.saveToSupabase(handle)
    }

    this.isInitializing = false
    return handle
  }

  /**
   * 从 Supabase automerge_documents 表加载文档
   */
  private async loadFromSupabaseAutomerge(repo: Repo): Promise<DocHandle<AutomergeResumeDocument> | null> {
    try {
      // 注意：Supabase 会自动将 BYTEA 转换为合适的格式
      // 使用 maybeSingle() 而不是 single() 来避免 PGRST116 错误的特殊处理
      const { data, error } = await supabase
        .from('automerge_documents')
        .select('document_data, metadata')
        .eq('resume_id', this.resumeId)
        .maybeSingle()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        logger.error('查询 Automerge 文档失败', error as any)
        return null
      }

      if (!data) {
        return null
      }

      const metadata = data.metadata || {}
      const documentUrl = typeof metadata.documentUrl === 'string' ? metadata.documentUrl : void 0

      // 优先尝试使用 documentUrl 通过 repo.find 加载
      // 这样如果文档已经在 IndexedDB 中，可以直接使用，保持同一个 handle 实例
      if (documentUrl) {
        try {
          const handle = await repo.find<AutomergeResumeDocument>(documentUrl as any)

          if (handle) {
            await handle.whenReady()
            return handle
          }
          else {
            logger.debug('documentUrl 未找到，需要导入二进制数据')
          }
        }
        catch (err) {
          logger.warn('通过 documentUrl 加载失败，尝试导入二进制数据', err as any)
        }
      }

      // 使用二进制数据导入
      if (!data.document_data) {
        logger.warn('数据库中没有 document_data，无法加载')
        return null
      }

      const uint8Array = byteaToUint8Array(data.document_data)
      if (!uint8Array) {
        logger.error('无法解析 document_data')
        return null
      }

      const handle = repo.import<AutomergeResumeDocument>(uint8Array)
      await handle.whenReady()
      return handle
    }
    catch (err) {
      logger.error('从 Supabase 加载 Automerge 文档失败', err as any)
      return null
    }
  }

  /**
   * 从 Supabase resume_config 表加载简历数据
   */
  private async loadFromSupabaseConfig(): Promise<Partial<ResumeSchema> | null> {
    const { data, error } = await supabase
      .from('resume_config')
      .select('*')
      .eq('resume_id', this.resumeId)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42501') {
        this.canPersistToSupabase = false
        logger.warn('当前用户无法读取 resume_config，进入只读协作模式', { resumeId: this.resumeId, code: error.code })
        return null
      }

      logger.error('从 Supabase resume_config 加载失败', error as any)
      return null
    }

    if (!data) {
      this.canPersistToSupabase = false
      logger.warn('未找到 resume_config 记录，进入只读协作模式', { resumeId: this.resumeId })
      return null
    }

    // 移除数据库特有字段
    const {
      id,
      created_at,
      updated_at,
      resume_id,
      user_id,
      automerge_enabled,
      document_version,
      total_changes_count,
      last_automerge_sync,
      sync_status,
      ...resumeData
    } = data

    return resumeData
  }

  async saveToSupabase(handle: DocHandle<AutomergeResumeDocument>) {
    const doc = handle.doc()
    if (!doc)
      return

    const binary = Automerge.save(doc)
    const heads = Automerge.getHeads(doc)
    const base64 = uint8ArrayToBase64(binary)
    const documentUrl = handle.url

    if (!this.canPersistToSupabase) {
      this.notifySaveListeners({ success: true })
      return
    }

    this.notifySaveStart()

    const { error } = await supabase.from('automerge_documents').upsert(
      {
        resume_id: this.resumeId,
        user_id: this.userId,
        document_data: base64,
        heads,
        document_version: doc._metadata.version,
        change_count: 0,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(doc._metadata ? { docMetadata: doc._metadata } : {}),
          documentUrl,
        },
      },
      { onConflict: 'resume_id' },
    )

    if (error) {
      if (error?.code === '42501') {
        this.canPersistToSupabase = false
        logger.warn('当前用户无权写入 automerge_documents，切换到只读协作模式', { resumeId: this.resumeId })
      }
      else {
        logger.error('保存到 Supabase 失败', error)
      }
      this.notifySaveListeners({ success: false, error })
    }
    else {
      this.notifySaveListeners({ success: true })
    }
  }

  onSaveResult(listener: (result: { success: boolean, error?: unknown }) => void): () => void {
    this.saveListeners.add(listener)
    return () => {
      this.saveListeners.delete(listener)
    }
  }

  onSaveStart(listener: () => void): () => void {
    this.saveStartListeners.add(listener)
    return () => {
      this.saveStartListeners.delete(listener)
    }
  }

  private notifySaveListeners(result: { success: boolean, error?: unknown }) {
    this.saveListeners.forEach((listener) => {
      try {
        listener(result)
      }
      catch (err) {
        console.error('⚠️ 保存回调执行失败', err)
      }
    })
  }

  private notifySaveStart() {
    this.saveStartListeners.forEach((listener) => {
      try {
        listener()
      }
      catch (err) {
        console.error('⚠️ 保存开始回调执行失败', err)
      }
    })
  }

  async enableCollaboration(sessionId: string, callbacks: CollaborationCallbacks = {}) {
    if (!this.repo) {
      throw new Error('Automerge repo 尚未初始化')
    }

    if (this.networkAdapter && this.currentSessionId === sessionId) {
      return this.networkAdapter
    }

    if (this.networkAdapter) {
      this.disableCollaboration()
    }

    logger.automerge.collab('开始准备协作', { sessionId, resumeId: this.resumeId })

    const repo = this.repo as Repo
    const adapter = new SupabaseNetworkAdapter(this.resumeId, sessionId, callbacks)
    adapter.setLocalDocumentInfo({
      documentUrl: this.getDocumentUrl(),
      documentId: this.getDocumentId(),
    })
    this.repo.networkSubsystem.addNetworkAdapter(adapter)
    this.networkAdapter = adapter
    this.currentSessionId = sessionId

    // 异步尝试从 Supabase 加载 automerge 文档快照
    const tryLoadRemoteSnapshot = async () => {
      try {
        if (this.handle) {
          adapter.setLocalDocumentInfo({
            documentUrl: this.getDocumentUrl(),
            documentId: this.getDocumentId(),
          })
          return
        }

        const { data, error } = await supabase
          .from('automerge_documents')
          .select('document_data, metadata')
          .eq('resume_id', this.resumeId)
          .maybeSingle()

        if (error) {
          logger.warn('查询 automerge_documents 时出错', error)
          return
        }

        if (!data)
          return

        const metadata = (data.metadata as Record<string, any> | null) || {}
        const metadataDocumentUrl = typeof metadata.documentUrl === 'string' ? metadata.documentUrl : undefined

        // 从二进制数据导入文档
        if (data.document_data) {
          const uint8Array = byteaToUint8Array(data.document_data)
          if (uint8Array && uint8Array.length > 0) {
            try {
              const imported = repo.import<AutomergeResumeDocument>(uint8Array)
              await imported.whenReady()
              if (!this.handle) {
                this.handle = imported
              }
              logger.automerge.sync('成功从 Supabase 导入 Automerge 文档快照', { resumeId: this.resumeId })
            }
            catch (err) {
              logger.warn('导入 Automerge 二进制失败', err as any)
            }
          }
        }

        // 设置最终的本地文档信息
        const finalLocalUrl = this.getDocumentUrl() || metadataDocumentUrl || null
        adapter.setLocalDocumentInfo({
          documentUrl: finalLocalUrl,
          documentId: this.getDocumentId(),
        })
      }
      catch (err) {
        logger.warn('异步加载 automerge_documents 失败', err as any)
      }
    }

    await tryLoadRemoteSnapshot()

    return adapter
  }

  disableCollaboration() {
    if (this.repo && this.networkAdapter) {
      this.repo.networkSubsystem.removeNetworkAdapter(this.networkAdapter)
      this.networkAdapter = null
    }
    this.currentSessionId = null
  }

  getCollaborationChannelName(): string | null {
    return this.networkAdapter?.getChannelName() ?? null
  }

  getCollaborationSessionId(): string | null {
    return this.currentSessionId
  }

  broadcastCollaborationEvent(type: string, data: Record<string, any> = {}) {
    this.networkAdapter?.broadcastControlMessage(type, data)
  }

  /**
   * 获取当前文档句柄
   */
  getHandle(): DocHandle<AutomergeResumeDocument> | null {
    return this.handle
  }

  getDocumentUrl(): string | null {
    return this.handle?.url ?? null
  }

  getDocumentId(): string | null {
    return this.handle?.documentId ?? null
  }

  /**
   * 获取当前文档快照
   */
  getDoc(): AutomergeResumeDocument | null {
    return this.handle?.doc() || null
  }

  change(changeFn: ChangeFn<AutomergeResumeDocument>) {
    if (!this.handle) {
      logger.error('文档未初始化')
      return
    }

    this.handle.change((doc) => {
      changeFn(doc)
      doc._metadata.updatedAt = new Date().toISOString()
      doc._metadata.version += 1
    })

    this.debouncedSave()
  }

  /**
   * 防抖保存
   */
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private debouncedSave() {
    if (this.isInitializing) {
      return
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveTimeout = setTimeout(() => {
      if (this.handle) {
        this.saveToSupabase(this.handle)
      }
    }, 3000)
  }

  /**
   * 销毁文档管理器
   */
  destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    this.saveListeners.clear()
    this.saveStartListeners.clear()
    this.disableCollaboration()
    this.repo = null
    this.handle = null
    this.saveListeners.clear()
  }
}
