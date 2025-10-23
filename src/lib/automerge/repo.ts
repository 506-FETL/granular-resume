import { Repo, type RepoConfig } from '@automerge/automerge-repo'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import { SupabaseNetworkAdapter } from './supabase-network-adapter'

let repoInstance: Repo | null = null
let currentResumeId: string | null = null

/**
 * 获取或创建 Automerge Repo 单例
 */
export function getAutomergeRepo(userId: string, resumeId?: string): Repo {
  // 如果 resumeId 变化，需要重新创建 repo（因为网络适配器绑定到特定简历）
  if (repoInstance && resumeId && resumeId !== currentResumeId) {
    destroyAutomergeRepo()
  }

  if (!repoInstance) {
    repoInstance = createResumeRepo(userId, resumeId)
    currentResumeId = resumeId || null
  }
  return repoInstance
}

/**
 * 创建 Automerge Repo
 */
function createResumeRepo(userId: string, resumeId?: string): Repo {
  const config: RepoConfig = {
    // 本地存储适配器
    storage: new IndexedDBStorageAdapter('resume-automerge-v1'),

    // 共享策略（允许多标签页共享）
    sharePolicy: async () => true,
  }

  // 如果提供了 resumeId，启用实时协作
  if (resumeId) {
    config.network = [new SupabaseNetworkAdapter(resumeId)]
  }

  const repo = new Repo(config)

  // 监听 Repo 的各种事件（调试用）
  repo.on('document', ({ handle }) => {
    // eslint-disable-next-line no-console
    console.log('📄 Repo 收到文档事件', {
      documentUrl: handle.url,
      isReady: handle.isReady(),
    })
  })

  // 监听文档删除事件
  repo.on('delete-document', ({ documentId }) => {
    // eslint-disable-next-line no-console
    console.log('🗑️ Repo 文档被删除', { documentId })
  })

  // 监听网络适配器事件
  if (config.network && config.network.length > 0) {
    config.network.forEach((adapter: any) => {
      adapter.on('peer-candidate', (peer: any) => {
        // eslint-disable-next-line no-console
        console.log('🌐 Repo: 发现新 peer', peer)
      })

      adapter.on('message', (message: any) => {
        // eslint-disable-next-line no-console
        console.log('🌐 Repo: 收到网络消息', {
          type: message.type,
          senderId: message.senderId,
          dataLength: message.data?.length || 0,
        })
      })
    })
  }

  // eslint-disable-next-line no-console
  console.log('✅ Automerge Repo 已创建', {
    userId,
    resumeId,
    hasNetwork: !!resumeId,
    networkAdapters: config.network?.length || 0,
  })

  return repo
}

/**
 * 销毁 Repo 实例（用于登出或切换简历）
 */
export function destroyAutomergeRepo() {
  if (repoInstance) {
    // Repo 没有明确的销毁方法，设为 null 即可
    repoInstance = null
    currentResumeId = null
    // eslint-disable-next-line no-console
    console.log('🗑️  Automerge Repo 已销毁')
  }
}
