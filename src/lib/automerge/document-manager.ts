/* eslint-disable @typescript-eslint/no-unused-vars */
import { DEFAULT_ORDER, DEFAULT_VISIBILITY, type ResumeSchema } from '@/lib/schema'
import supabase from '@/lib/supabase/client'
import { next as Automerge } from '@automerge/automerge'
import { DocHandle, Repo } from '@automerge/automerge-repo'
import { getAutomergeRepo } from './repo'
import type { AutomergeResumeDocument, ChangeFn } from './schema'
import { SupabaseNetworkAdapter, type CollaborationCallbacks } from './supabase-network-adapter'

/**
 * 生成确定性的 actor ID，用于确保所有协作者使用相同的文档 URL
 */
function generateDeterministicActor(resumeId: string): Uint8Array {
  const hash = simpleHash(resumeId)
  const arr = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    arr[i] = (hash >> (i * 8)) & 0xff
  }
  return arr
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash
}

/**
 * 文档管理器
 * 负责文档的创建、加载、保存
 */
export class DocumentManager {
  private handle: DocHandle<AutomergeResumeDocument> | null = null
  private resumeId: string
  private userId: string
  private isInitializing: boolean = false
  private repo: Repo | null = null
  private networkAdapter: SupabaseNetworkAdapter | null = null
  private currentSessionId: string | null = null
  private saveListeners = new Set<(result: { success: boolean; error?: unknown }) => void>()
  private canPersistToSupabase = true
  private sharedDocumentUrl?: string

  constructor(resumeId: string, userId: string, options?: { sharedDocumentUrl?: string }) {
    this.resumeId = resumeId
    this.userId = userId
    this.sharedDocumentUrl = options?.sharedDocumentUrl
    if (this.sharedDocumentUrl) {
      this.canPersistToSupabase = false
    }
  }

  /**
   * 初始化文档
   * 1. 尝试从 Supabase 加载现有文档（优先使用 metadata 中的 documentUrl，其次使用二进制数据）
   * 2. 如果不存在，创建新文档并保存 URL
   */
  async initialize() {
    this.isInitializing = true
    const repo = getAutomergeRepo(this.userId, this.resumeId)
    this.repo = repo

    if (this.sharedDocumentUrl) {
      const sharedHandle = await this.loadFromDocumentUrl(repo, this.sharedDocumentUrl)
      if (sharedHandle) {
        this.handle = sharedHandle
        this.isInitializing = false
        this.networkAdapter?.setLocalDocumentInfo({
          documentUrl: this.getDocumentUrl(),
          documentId: this.getDocumentId(),
        })
        return sharedHandle
      }
    }

    // 尝试从 Supabase 加载现有的 Automerge 文档
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
    // repo.create() 会生成正确格式的 Automerge DocumentId
    const handle = repo.create<any>({ actor: generateDeterministicActor(this.resumeId) })

    handle.change((doc) => {
      // 初始化元数据
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
        doc.order = [...DEFAULT_ORDER] as any
      }
      if (!doc.visibility) {
        doc.visibility = { ...DEFAULT_VISIBILITY } as any
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
        // 如果是找不到记录的错误，这是正常的
        if (error.code === 'PGRST116') {
          return null
        }
        // eslint-disable-next-line no-console
        console.error('❌ 查询 Automerge 文档失败', error)
        return null
      }

      if (!data) {
        return null
      }

      const metadata = (data.metadata as Record<string, any> | null) || {}
      const documentUrl = typeof metadata.documentUrl === 'string' ? metadata.documentUrl : undefined

      // 优先尝试使用 documentUrl 通过 repo.find 加载
      // 这样如果文档已经在 IndexedDB 中，可以直接使用，保持同一个 handle 实例
      if (documentUrl) {
        try {
          // 先尝试 find（可能已经在 IndexedDB 中）
          const handle = await repo.find<AutomergeResumeDocument>(documentUrl as any)

          if (handle) {
            await handle.whenReady()
            return handle
          } else {
            // eslint-disable-next-line no-console
            console.log('📥 documentUrl 未找到，需要导入二进制数据')
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ 通过 documentUrl 加载失败，尝试导入二进制数据', err)
        }
      }

      // 使用二进制数据导入
      if (!data.document_data) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ 数据库中没有 document_data，无法加载')
        return null
      }

      // 将 BYTEA 转换为 Uint8Array
      let uint8Array: Uint8Array

      if (data.document_data instanceof Uint8Array) {
        // 已经是 Uint8Array
        uint8Array = data.document_data
      } else if (Array.isArray(data.document_data)) {
        // 如果是数字数组（某些情况下 Supabase 会返回这种格式）
        uint8Array = new Uint8Array(data.document_data)
      } else if (typeof data.document_data === 'string') {
        // PostgreSQL BYTEA 的 hex 格式：\x后跟16进制字符串
        if (data.document_data.startsWith('\\x')) {
          // 移除 \x 前缀
          const hexString = data.document_data.slice(2)

          // 将 hex 转换为字符串（因为我们存储的是 Base64 字符串的 hex 编码）
          let decodedString = ''
          for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.slice(i, i + 2), 16)
            decodedString += String.fromCharCode(byte)
          }

          // 现在将 Base64 字符串解码为 Uint8Array
          try {
            const binaryString = atob(decodedString)
            uint8Array = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i)
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('❌ Base64 解码失败', err)
            return null
          }
        } else {
          // 直接作为 Base64 解码
          try {
            const binaryString = atob(data.document_data)
            uint8Array = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i)
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('❌ Base64 解码失败', err)
            return null
          }
        }
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ 未知的数据格式', data.document_data)
        return null
      }

      // 使用 repo.import 导入已有的 Automerge 文档
      // 这样不会触发 create 导致的循环保存
      const handle = repo.import<AutomergeResumeDocument>(uint8Array)

      // 等待文档就绪
      await handle.whenReady()

      return handle
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ 从 Supabase 加载 Automerge 文档失败', err)
      return null
    }
  }

  private async loadFromDocumentUrl(
    repo: Repo,
    documentUrl: string,
  ): Promise<DocHandle<AutomergeResumeDocument> | null> {
    try {
      const handle = await repo.find<AutomergeResumeDocument>(documentUrl as any)
      if (handle) {
        await handle.whenReady()
        // eslint-disable-next-line no-console
        console.log('🔁 通过共享链接加载 Automerge 文档', { documentUrl })
        return handle
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ 通过共享链接加载文档失败', err)
    }
    return null
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
        // 没有权限读取该简历或不存在，进入只读模式（依赖实时协作拉取数据）
        this.canPersistToSupabase = false
        // eslint-disable-next-line no-console
        console.warn('⚠️ 当前用户无法读取 resume_config，进入只读协作模式', {
          resumeId: this.resumeId,
          code: error.code,
        })
        return null
      }
      // eslint-disable-next-line no-console
      console.error('❌ 从 Supabase resume_config 加载失败', error)
      return null
    }

    if (!data) {
      this.canPersistToSupabase = false
      // eslint-disable-next-line no-console
      console.warn('⚠️ 未找到 resume_config 记录，进入只读协作模式', { resumeId: this.resumeId })
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

  /**
   * 保存文档快照到 Supabase
   */
  async saveToSupabase(handle: DocHandle<AutomergeResumeDocument>) {
    const doc = handle.doc()
    if (!doc) return

    const binary = Automerge.save(doc)
    const heads = Automerge.getHeads(doc)

    // 将 Uint8Array 转换为 Base64，因为 Supabase 的 BYTEA 处理有问题
    const base64 = btoa(String.fromCharCode(...Array.from(binary)))

    // 获取文档 URL（用于协作）
    const documentUrl = handle.url

    if (!this.canPersistToSupabase) {
      this.notifySaveListeners({ success: true })
      return
    }

    const { error } = await supabase.from('automerge_documents').upsert(
      {
        resume_id: this.resumeId,
        user_id: this.userId,
        document_data: base64, // 保存为 Base64 字符串
        heads: heads,
        document_version: doc._metadata.version,
        change_count: 0,
        updated_at: new Date().toISOString(),
        metadata: {
          ...(doc._metadata ? { docMetadata: doc._metadata } : {}),
          documentUrl,
        },
      },
      {
        onConflict: 'resume_id', // 指定冲突字段
      },
    )

    if (error) {
      // 如果是 RLS/权限问题（例如 42501），切换到只读协作模式以避免以后重复失败
      if ((error as any)?.code === '42501' || (error as any)?.status === 403) {
        this.canPersistToSupabase = false
        // eslint-disable-next-line no-console
        console.warn('⚠️ 当前用户无权写入 automerge_documents，切换到只读协作模式', { resumeId: this.resumeId, error })
      } else {
        // eslint-disable-next-line no-console
        console.error('❌ 保存到 Supabase 失败', error)
      }
      this.notifySaveListeners({ success: false, error })
    } else {
      this.notifySaveListeners({ success: true })
    }
  }

  onSaveResult(listener: (result: { success: boolean; error?: unknown }) => void): () => void {
    this.saveListeners.add(listener)
    return () => {
      this.saveListeners.delete(listener)
    }
  }

  private notifySaveListeners(result: { success: boolean; error?: unknown }) {
    this.saveListeners.forEach((listener) => {
      try {
        listener(result)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('⚠️ 保存回调执行失败', err)
      }
    })
  }

  enableCollaboration(sessionId: string, callbacks: CollaborationCallbacks = {}) {
    if (!this.repo) {
      throw new Error('Automerge repo 尚未初始化')
    }

    if (this.networkAdapter && this.currentSessionId === sessionId) {
      return this.networkAdapter
    }

    // 如果已有其他会话，先清理
    if (this.networkAdapter) {
      this.disableCollaboration()
    }

    // 准备开启协作：优先从 Supabase automerge_documents 表加载已有的二进制快照与 metadata
    // 以 resumeId 为唯一键，确保不同协作者基于相同快照开始协作，避免各自新建本地文档
    // eslint-disable-next-line no-console
    console.log('🔗 开始准备协作（确保导入/映射文档）', { sessionId, resumeId: this.resumeId })

    // repo 已经在 initialize 中创建过，断言其存在以便在后面的异步任务中使用
    const repo = this.repo as Repo

    // 先创建 adapter 并注册，但本地文档信息由下面的异步任务补充（如果数据库里有内容）
    const adapter = new SupabaseNetworkAdapter(this.resumeId, sessionId, callbacks)
    // 先使用现有的本地 document 信息（如果已经有 handle）
    adapter.setLocalDocumentInfo({
      documentUrl: this.getDocumentUrl(),
      documentId: this.getDocumentId(),
    })
    this.repo.networkSubsystem.addNetworkAdapter(adapter)
    this.networkAdapter = adapter
    this.currentSessionId = sessionId

    // 异步尝试从 Supabase 加载 automerge 文档快照并在可用时导入/映射
    // 注意：如果已经有 handle（例如发起者），不要导入数据库快照，让网络同步处理
    ;(async () => {
      try {
        // 如果已经有 handle，跳过导入，让网络同步处理
        if (this.handle) {
          // 直接同步本地文档信息
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
          // eslint-disable-next-line no-console
          console.warn('⚠️ 查询 automerge_documents 时出错，继续使用本地文档（如有）', error)
          return
        }

        if (!data) return

        const metadata = (data.metadata as Record<string, any> | null) || {}
        const metadataDocumentUrl = typeof metadata.documentUrl === 'string' ? metadata.documentUrl : undefined

        // 如果数据库包含二进制数据，尝试导入为本地 handle（这会在本地生成可用的 handle.url）
        if (data.document_data) {
          try {
            let uint8Array: Uint8Array

            if (data.document_data instanceof Uint8Array) {
              uint8Array = data.document_data
            } else if (Array.isArray(data.document_data)) {
              uint8Array = new Uint8Array(data.document_data)
            } else if (typeof data.document_data === 'string') {
              if (data.document_data.startsWith('\\x')) {
                const hexString = data.document_data.slice(2)
                let decodedString = ''
                for (let i = 0; i < hexString.length; i += 2) {
                  const byte = parseInt(hexString.slice(i, i + 2), 16)
                  decodedString += String.fromCharCode(byte)
                }
                const binaryString = atob(decodedString)
                uint8Array = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  uint8Array[i] = binaryString.charCodeAt(i)
                }
              } else {
                const binaryString = atob(data.document_data)
                uint8Array = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                  uint8Array[i] = binaryString.charCodeAt(i)
                }
              }
            } else {
              uint8Array = new Uint8Array()
            }

            if (uint8Array && uint8Array.length > 0) {
              try {
                const imported = repo.import<AutomergeResumeDocument>(uint8Array)
                await imported.whenReady()
                if (!this.handle) {
                  this.handle = imported
                }
                // eslint-disable-next-line no-console
                console.log('🔁 成功从 Supabase 导入 Automerge 文档快照', { resumeId: this.resumeId })
              } catch (err) {
                // eslint-disable-next-line no-console
                console.warn('⚠️ 导入 Automerge 二进制失败，继续流程', err)
              }
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('⚠️ 解析数据库中的 document_data 失败', err)
          }
        }

        // 最终确定适配器的本地文档信息（优先使用当前 handle.url，再用 metadata 中的 documentUrl）
        const finalLocalUrl = this.getDocumentUrl() || metadataDocumentUrl || null
        adapter.setLocalDocumentInfo({
          documentUrl: finalLocalUrl,
          documentId: this.getDocumentId(),
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ 异步加载 automerge_documents 失败', err)
      }
    })()

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
    return this.handle?.url ?? this.sharedDocumentUrl ?? null
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

  /**
   * 更新文档
   */
  change(changeFn: ChangeFn<AutomergeResumeDocument>) {
    if (!this.handle) {
      // eslint-disable-next-line no-console
      console.error('❌ 文档未初始化')
      return
    }

    // eslint-disable-next-line no-console
    console.log('✏️ 正在修改文档', { resumeId: this.resumeId })

    this.handle.change((doc) => {
      changeFn(doc)
      // 更新元数据
      doc._metadata.updatedAt = new Date().toISOString()
      doc._metadata.version += 1
    })

    // eslint-disable-next-line no-console
    console.log('✅ 文档修改完成，Automerge 将自动同步')

    // 防抖保存到 Supabase（后续实现）
    this.debouncedSave()
  }

  /**
   * 防抖保存（简单实现）
   */
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private debouncedSave() {
    // 初始化期间不触发自动保存，避免循环
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
    }, 3000) // 3秒后保存
  }

  /**
   * 销毁文档管理器
   */
  destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    this.disableCollaboration()
    this.repo = null
    this.handle = null
    this.saveListeners.clear()
  }
}
