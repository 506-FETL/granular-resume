import type { RepoConfig } from '@automerge/automerge-repo'
import { Repo } from '@automerge/automerge-repo'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'

let repoInstance: Repo | null = null
let currentResumeId: string | null = null

/**
 * 获取或创建 Automerge Repo 单例
 */
export function getAutomergeRepo(resumeId: string) {
  // 如果 resumeId 变化，需要重新创建 repo（因为网络适配器绑定到特定简历）
  if (repoInstance && resumeId && resumeId !== currentResumeId) {
    destroyAutomergeRepo()
  }

  if (!repoInstance) {
    repoInstance = createResumeRepo()
  }

  currentResumeId = resumeId ?? currentResumeId ?? null
  return repoInstance
}

/**
 * 创建 Automerge Repo
 */
function createResumeRepo(): Repo {
  const config: RepoConfig = {
    // 本地存储适配器
    storage: new IndexedDBStorageAdapter('resume-automerge-v1'),

    // 共享策略（允许多标签页共享）
    sharePolicy: async () => true,
  }

  const repo = new Repo(config)

  return repo
}

/**
 * 销毁 Repo 实例（用于登出或切换简历）
 */
export function destroyAutomergeRepo() {
  if (repoInstance) {
    try {
      repoInstance.networkSubsystem.disconnect()
    }
    catch (error) {
      console.warn('⚠️ 断开 Automerge 网络适配器时出错', error)
    }

    // Repo 没有明确的销毁方法，设为 null
    repoInstance = null
    currentResumeId = null
  }
}
