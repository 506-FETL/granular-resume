/* eslint-disable @typescript-eslint/no-unused-vars */
import { DocHandle, Repo } from '@automerge/automerge-repo'
import { next as Automerge } from '@automerge/automerge'
import type { AutomergeResumeDocument, ChangeFn } from './schema'
import type { ResumeSchema } from '@/lib/schema'
import { getAutomergeRepo } from './repo'
import supabase from '@/lib/supabase/client'

/**
 * 文档管理器
 * 负责文档的创建、加载、保存
 */
export class DocumentManager {
  private handle: DocHandle<AutomergeResumeDocument> | null = null
  private resumeId: string
  private userId: string
  private isInitializing: boolean = false

  constructor(resumeId: string, userId: string) {
    this.resumeId = resumeId
    this.userId = userId
  }

  /**
   * 初始化文档
   * 1. 尝试从 Supabase 加载现有文档（通过 document_url 或二进制数据）
   * 2. 如果不存在，创建新文档并保存 URL
   */
  async initialize(): Promise<DocHandle<AutomergeResumeDocument>> {
    this.isInitializing = true
    const repo = getAutomergeRepo(this.userId, this.resumeId)

    // 尝试从 Supabase 加载现有的 Automerge 文档
    const existingHandle = await this.loadFromSupabaseAutomerge(repo)
    if (existingHandle) {
      // eslint-disable-next-line no-console
      console.log('📂 从 Supabase 加载 Automerge 文档', {
        resumeId: this.resumeId,
        documentUrl: existingHandle.url,
      })
      this.handle = existingHandle
      this.isInitializing = false
      return existingHandle
    }

    // 从 Supabase resume_config 表加载数据
    const supabaseData = await this.loadFromSupabaseConfig()

    // 创建新的 Automerge 文档
    // repo.create() 会生成正确格式的 Automerge DocumentId
    const handle = repo.create<AutomergeResumeDocument>()

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
      if (!doc.order) {
        doc.order = [] as any
      }
      if (!doc.visibility) {
        doc.visibility = {} as any
      }
    })

    // eslint-disable-next-line no-console
    console.log('✨ 创建新的 Automerge 文档', {
      resumeId: this.resumeId,
      documentUrl: handle.url,
      isReady: handle.isReady(),
    })
    this.handle = handle

    // 等待文档就绪
    await handle.whenReady()

    // eslint-disable-next-line no-console
    console.log('✅ 新文档已就绪')

    // 立即保存到 Supabase（保存 document_url），确保其他窗口能加载到相同的文档
    await this.saveToSupabase(handle)

    // eslint-disable-next-line no-console
    console.log('💾 新文档已保存到 Supabase，其他窗口将使用相同的 documentUrl')

    this.isInitializing = false
    return handle
  }

  /**
   * 从 Supabase automerge_documents 表加载文档
   */
  private async loadFromSupabaseAutomerge(repo: Repo): Promise<DocHandle<AutomergeResumeDocument> | null> {
    try {
      // eslint-disable-next-line no-console
      console.log('🔍 正在从 Supabase 查询文档...', { resumeId: this.resumeId })

      // 注意：Supabase 会自动将 BYTEA 转换为合适的格式
      // 使用 maybeSingle() 而不是 single() 来避免 PGRST116 错误的特殊处理
      const { data, error } = await supabase
        .from('automerge_documents')
        .select('document_data, document_url')
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

      // 优先尝试使用 document_url 通过 repo.find 加载
      // 这样如果文档已经在 IndexedDB 中，可以直接使用，保持同一个 handle 实例
      if (data.document_url) {
        try {
          // eslint-disable-next-line no-console
          console.log('🔗 尝试使用 document_url 加载:', data.document_url)

          // 先尝试 find（可能已经在 IndexedDB 中）
          const handle = await repo.find<AutomergeResumeDocument>(data.document_url as any)

          if (handle) {
            // eslint-disable-next-line no-console
            console.log('✅ 通过 document_url 找到本地文档')
            await handle.whenReady()
            return handle
          } else {
            // eslint-disable-next-line no-console
            console.log('📥 document_url 未找到，需要导入二进制数据')
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ 通过 document_url 加载失败，尝试导入二进制数据', err)
        }
      }

      // 使用二进制数据导入
      if (!data.document_data) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ 数据库中没有 document_data，无法加载')
        return null
      }

      // eslint-disable-next-line no-console
      console.log(
        '📦 原始数据类型:',
        typeof data.document_data,
        Array.isArray(data.document_data) ? '数组' : typeof data.document_data,
      )

      // 将 BYTEA 转换为 Uint8Array
      let uint8Array: Uint8Array

      if (data.document_data instanceof Uint8Array) {
        // 已经是 Uint8Array
        uint8Array = data.document_data
        // eslint-disable-next-line no-console
        console.log('📦 数据已经是 Uint8Array')
      } else if (Array.isArray(data.document_data)) {
        // 如果是数字数组（某些情况下 Supabase 会返回这种格式）
        uint8Array = new Uint8Array(data.document_data)
        // eslint-disable-next-line no-console
        console.log('📦 从数组转换为 Uint8Array')
      } else if (typeof data.document_data === 'string') {
        // PostgreSQL BYTEA 的 hex 格式：\x后跟16进制字符串
        if (data.document_data.startsWith('\\x')) {
          // 移除 \x 前缀
          const hexString = data.document_data.slice(2)
          // eslint-disable-next-line no-console
          console.log('📦 Hex 字符串长度:', hexString.length, '前 20 字符:', hexString.slice(0, 20))

          // 将 hex 转换为字符串（因为我们存储的是 Base64 字符串的 hex 编码）
          let decodedString = ''
          for (let i = 0; i < hexString.length; i += 2) {
            const byte = parseInt(hexString.substr(i, 2), 16)
            decodedString += String.fromCharCode(byte)
          }

          // eslint-disable-next-line no-console
          console.log('📦 解码后的字符串前 20 字符:', decodedString.slice(0, 20))

          // 现在将 Base64 字符串解码为 Uint8Array
          try {
            const binaryString = atob(decodedString)
            uint8Array = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i)
            }
            // eslint-disable-next-line no-console
            console.log('✅ 从 hex → Base64 → Uint8Array 转换成功')
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
            // eslint-disable-next-line no-console
            console.log('✅ 从 Base64 → Uint8Array 转换成功')
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

      // eslint-disable-next-line no-console
      console.log('📦 转换后的 Uint8Array:', uint8Array.length, 'bytes')

      // 使用 repo.import 导入已有的 Automerge 文档
      // 这样不会触发 create 导致的循环保存
      const handle = repo.import<AutomergeResumeDocument>(uint8Array)

      // eslint-disable-next-line no-console
      console.log('✅ 成功从 Supabase 导入文档', {
        documentUrl: handle.url,
        resumeId: this.resumeId,
        dataSize: uint8Array.length,
        isReady: handle.isReady(),
      })

      // 等待文档就绪
      await handle.whenReady()

      // eslint-disable-next-line no-console
      console.log('✅ 文档已就绪，可以同步', {
        documentUrl: handle.url,
        docContent: handle.doc(),
      })

      // 确保文档已经注册到 repo 的网络层进行同步
      // Automerge repo 应该自动处理这个，但我们显式等待一下
      await new Promise((resolve) => setTimeout(resolve, 100))

      return handle
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ 从 Supabase 加载 Automerge 文档失败', err)
      return null
    }
  }

  /**
   * 从 Supabase resume_config 表加载简历数据
   */
  private async loadFromSupabaseConfig(): Promise<Partial<ResumeSchema> | null> {
    const { data, error } = await supabase.from('resume_config').select('*').eq('resume_id', this.resumeId).single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('❌ 从 Supabase resume_config 加载失败', error)
      return null
    }

    // 移除数据库特有字段
    const {
      id: _id,
      created_at: _created_at,
      updated_at: _updated_at,
      resume_id: _resume_id,
      user_id: _user_id,
      automerge_enabled: _automerge_enabled,
      document_version: _document_version,
      total_changes_count: _total_changes_count,
      last_automerge_sync: _last_automerge_sync,
      sync_status: _sync_status,
      ...resumeData
    } = data

    return resumeData as Partial<ResumeSchema>
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

    // eslint-disable-next-line no-console
    console.log('💾 准备保存到 Supabase', {
      resumeId: this.resumeId,
      documentUrl,
      binarySize: binary.length,
      base64Length: base64.length,
    })

    const { error } = await supabase.from('automerge_documents').upsert(
      {
        resume_id: this.resumeId,
        user_id: this.userId,
        document_url: documentUrl, // 保存文档 URL 用于协作
        document_data: base64, // 保存为 Base64 字符串
        heads: heads,
        document_version: doc._metadata.version,
        change_count: 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'resume_id', // 指定冲突字段
      },
    )

    if (error) {
      // eslint-disable-next-line no-console
      console.error('❌ 保存到 Supabase 失败', error)
    } else {
      // eslint-disable-next-line no-console
      console.log('💾 已保存到 Supabase', { resumeId: this.resumeId })
    }
  }

  /**
   * 获取当前文档句柄
   */
  getHandle(): DocHandle<AutomergeResumeDocument> | null {
    return this.handle
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
    this.handle = null
  }
}
