import type { SupabaseUser } from '../types'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { isOfflineResumeId } from '@/lib/offline-resume-manager'
import { subscribeToResumeConfigUpdates } from '@/lib/supabase/resume'
import { getCurrentUser } from '@/lib/supabase/user'
import useCollaborationStore from '@/store/collaboration'
import useCurrentResumeStore from '@/store/resume/current'
import useResumeStore from '@/store/resume/form'

export function useResumeLoader() {
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUserState] = useState<SupabaseUser>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const resumeId = useCurrentResumeStore(state => state.resumeId)
  const { setCurrentResume } = useCurrentResumeStore()
  const { loadResumeData } = useResumeStore()

  const queryResumeId = searchParams.get('resumeId')
  const sharedDocUrl = searchParams.get('docUrl')
  const collabSessionParam = searchParams.get('collabSession')
  const activeResumeId = resumeId ?? queryResumeId ?? undefined

  // 获取当前用户
  useEffect(() => {
    let mounted = true
    getCurrentUser().then((user) => {
      if (mounted) {
        setCurrentUserState(user)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  // 清理函数
  useEffect(() => {
    return () => {
      useResumeStore.getState().cleanup()
      useCollaborationStore.getState().stopSharing({ silent: true })
    }
  }, [])

  // 处理 URL 参数切换简历
  useEffect(() => {
    if (queryResumeId && collabSessionParam) {
      // 如果有协作会话参数，强制切换到链接中的简历
      setCurrentResume(queryResumeId, 'default')
    }
    else if (!resumeId && queryResumeId) {
      setCurrentResume(queryResumeId, 'default')
    }
  }, [resumeId, queryResumeId, collabSessionParam, setCurrentResume])

  // 加载简历数据
  useEffect(() => {
    if (!activeResumeId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    loadResumeData(activeResumeId, sharedDocUrl ? { documentUrl: sharedDocUrl } : undefined)
      .catch((error: any) => {
        if (cancelled)
          return
        toast.error(`加载简历失败, ${error.message || '未知错误'}`)
        navigate('/resume')
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeResumeId, loadResumeData, navigate, sharedDocUrl])

  // 监听简历删除
  useEffect(() => {
    if (!activeResumeId || isOfflineResumeId(activeResumeId) || !currentUser)
      return

    let unSubscribe: (() => void) | undefined
    let cancelled = false

    subscribeToResumeUpdates()

    async function subscribeToResumeUpdates() {
      try {
        unSubscribe = await subscribeToResumeConfigUpdates((payload) => {
          if (cancelled)
            return
          if (payload.eventType !== 'DELETE')
            return

          const deletedResumeId = payload.old.resume_id
          if (deletedResumeId !== activeResumeId)
            return

          const resumeName = payload.old.display_name || '简历'
          toast.error(`简历 "${resumeName}" 已在其他窗口被删除`, {
            duration: 5000,
          })

          navigate('/resume')
        })
      }
      catch (error: any) {
        toast.error(`监听简历更新失败, ${error.message || '未知错误'}`)
      }
    }

    return () => {
      cancelled = true
      unSubscribe?.()
    }
  }, [activeResumeId, currentUser, navigate])

  return {
    loading,
    currentUser,
    activeResumeId,
  }
}
