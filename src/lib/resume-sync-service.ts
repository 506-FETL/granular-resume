/**
 * 简历同步服务
 * 处理登录后本地简历与云端的合并
 */

import { toast } from 'sonner'
import { getAllOfflineResumes, migrateOfflineResumesToCloud } from './offline-resume-manager'
import { updateResumeConfig } from './supabase/resume'
import { createNewResume } from './supabase/resume/form'
import { getCurrentUser } from './supabase/user'

/**
 * 检查是否有待合并的本地简历
 */
export async function hasOfflineResumesToSync() {
  try {
    const offlineResumes = await getAllOfflineResumes()
    return offlineResumes.length > 0
  }
  catch {
    toast.error('检查本地简历失败，请稍后重试')
    return false
  }
}

/**
 * 同步本地简历到云端
 * 在用户登录后调用
 */
export async function syncOfflineResumesToCloud(selectedIds?: string[]) {
  // 检查用户是否已登录
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('用户未登录，无法同步简历')
  }

  // 执行迁移
  const result = await migrateOfflineResumesToCloud(async (resume) => {
    // 创建新的云端简历
    const newResume = await createNewResume(
      {
        display_name: resume.display_name,
        description: resume.description,
      },
      resume.type,
    )

    // 如果有简历数据，更新到云端
    if (resume.data && Object.keys(resume.data).length > 0) {
      const data = resume.data

      await updateResumeConfig(newResume.resume_id, data)
    }

    return newResume.resume_id
  }, selectedIds)

  return result
}

/**
 * 在登录后自动执行同步
 * 可以在登录成功的回调中调用此函数
 */
export async function autoSyncOnLogin(): Promise<void> {
  try {
    const hasOfflineResumes = await hasOfflineResumesToSync()

    if (!hasOfflineResumes) {
      console.log('📭 没有需要同步的本地简历')
      return
    }

    // 显示同步提示
    const syncPromise = syncOfflineResumesToCloud()

    toast.promise(syncPromise, {
      loading: '正在同步本地简历到云端...',
      success: (result) => {
        if (result.failed > 0) {
          return `同步完成：成功 ${result.success} 个，失败 ${result.failed} 个`
        }
        return `成功同步 ${result.success} 个本地简历到云端`
      },
      error: '同步失败，请稍后重试',
    })

    const result = await syncPromise

    // 如果有失败的，显示详细错误
    if (result.failed > 0 && result.errors.length > 0) {
      console.error('同步失败的简历:', result.errors)
      toast.error(`部分简历同步失败，详情请查看控制台`)
    }
  }
  catch (error) {
    console.error('自动同步失败:', error)
    toast.error('同步本地简历失败，请稍后重试')
  }
}
