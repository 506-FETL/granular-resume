import { useIsMobile } from '@/hooks/use-mobile'
import { getStoredSessionRole } from '@/lib/collaboration/session-storage'
import type { SupabaseUser } from '@/pages/editor/types'
import useCollaborationStore from '@/store/collaboration'
import useResumeStore from '@/store/resume/form'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { CollaborationPanelContextValue } from '../components/collaboration-types'

interface UseCollaborationPanelValueParams {
  currentUser: SupabaseUser
  activeResumeId?: string
  userDisplayName: string
}

export function useCollaborationPanelValue({
  currentUser,
  activeResumeId,
  userDisplayName,
}: UseCollaborationPanelValueParams): CollaborationPanelContextValue {
  const isMobile = useIsMobile()
  const [collabDialogOpen, setCollabDialogOpen] = useState(false)
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null)
  const [lastStoppedSessionId, setLastStoppedSessionId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const collabSessionParam = searchParams.get('collabSession')

  const {
    manualSync,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    mode,
    isInitialized: isDocumentInitialized,
  } = useResumeStore()

  const {
    participants,
    isSharing,
    isConnecting: isCollabConnecting,
    shareUrl,
    role: collaborationRole,
    startSharing,
    stopSharing,
    joinSession,
    resumeHosting,
    error: collaborationError,
    sessionId,
    shareEndedByRemote,
    acknowledgeRemoteShareEnd,
  } = useCollaborationStore()

  const participantCount = useMemo(() => Object.keys(participants).length, [participants])

  const collabDisabledReason = useMemo(() => {
    if (mode !== 'online') return '离线简历暂不支持实时协作'
    if (!currentUser) return '请先登录以启用实时协作'
    if (!isDocumentInitialized) return '数据加载中，请稍候'
    return null
  }, [mode, currentUser, isDocumentInitialized])

  const shareButtonTooltip = collabDisabledReason ?? (isSharing ? '查看协作信息' : '开启实时协作')
  const canCopyLink = typeof navigator !== 'undefined' && !!navigator.clipboard

  const handleManualSync = useCallback(() => manualSync(), [manualSync])

  const handleStartSharing = useCallback(async () => {
    if (!activeResumeId || !currentUser) return
    try {
      await startSharing({
        resumeId: activeResumeId,
        userId: currentUser.id,
        userName: userDisplayName || `用户-${currentUser.id.slice(0, 6)}`,
      })
      const newSessionId = useCollaborationStore.getState().sessionId
      if (newSessionId) {
        const params = new URLSearchParams(window.location.search)
        params.set('resumeId', activeResumeId)
        params.set('collabSession', newSessionId)
        setSearchParams(params, { replace: true })
        setJoinedSessionId(newSessionId)
        setLastStoppedSessionId(null)
      }
    } catch (error: any) {
      toast.error('开启实时协作失败，请稍后重试', error?.message)
    }
  }, [activeResumeId, currentUser, setSearchParams, startSharing, userDisplayName])

  const handleStopSharing = useCallback(() => {
    const activeSessionId = sessionId ?? useCollaborationStore.getState().sessionId
    if (activeSessionId) {
      setLastStoppedSessionId(activeSessionId)
    }
    stopSharing()

    const params = new URLSearchParams(window.location.search)
    params.delete('collabSession')
    params.delete('resumeId')
    params.delete('docUrl')
    setSearchParams(params, { replace: true })
    setCollabDialogOpen(false)
  }, [sessionId, setSearchParams, stopSharing])

  const handleCopyShareLink = useCallback(() => {
    if (!shareUrl) return
    if (!canCopyLink) {
      toast.info('请手动复制链接')
      return
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success('已复制分享链接'))
      .catch(() => toast.error('复制失败，请手动复制'))
  }, [canCopyLink, shareUrl])

  const canStartSharing = Boolean(activeResumeId && currentUser && !collabDisabledReason && !isCollabConnecting)

  const sessionRoleHint = useMemo(() => {
    if (!collabSessionParam || !activeResumeId || !currentUser) return null
    return getStoredSessionRole(collabSessionParam, activeResumeId, currentUser.id)
  }, [collabSessionParam, activeResumeId, currentUser])

  useEffect(() => {
    if (!collabSessionParam && joinedSessionId) {
      setJoinedSessionId(null)
    }
  }, [collabSessionParam, joinedSessionId])

  useEffect(() => {
    if (!collabSessionParam || !activeResumeId) return
    if (isSharing) return
    if (lastStoppedSessionId && collabSessionParam === lastStoppedSessionId) return
    if (joinedSessionId === collabSessionParam) return
    if (!isDocumentInitialized || mode !== 'online' || !currentUser) return

    const payload = {
      sessionId: collabSessionParam,
      resumeId: activeResumeId,
      userId: currentUser.id,
      userName: userDisplayName || `用户-${currentUser.id.slice(0, 6)}`,
    }

    const action = sessionRoleHint === 'host' ? resumeHosting : joinSession
    action(payload)
      .then(() => setJoinedSessionId(collabSessionParam))
      .catch(() => setJoinedSessionId(collabSessionParam))
  }, [
    collabSessionParam,
    activeResumeId,
    isSharing,
    joinedSessionId,
    lastStoppedSessionId,
    isDocumentInitialized,
    mode,
    currentUser,
    userDisplayName,
    sessionRoleHint,
    joinSession,
    resumeHosting,
  ])

  useEffect(() => {
    if (!shareEndedByRemote) return
    acknowledgeRemoteShareEnd()
    navigate('/resume')
  }, [acknowledgeRemoteShareEnd, navigate, shareEndedByRemote])

  const openCollaborationDialog = useCallback(() => setCollabDialogOpen(true), [])
  const closeCollaborationDialog = useCallback(() => setCollabDialogOpen(false), [])

  return {
    isMobile,
    isSyncing,
    pendingChanges,
    lastSyncTime,
    isSharing,
    isCollabConnecting,
    collabDisabledReason,
    shareButtonTooltip,
    participantCount,
    shareUrl,
    collaborationRole,
    collaborationError,
    canStartSharing,
    collabDialogOpen,
    onManualSync: handleManualSync,
    onCopyShareLink: handleCopyShareLink,
    onStartSharing: handleStartSharing,
    onStopSharing: handleStopSharing,
    openCollaborationDialog,
    closeCollaborationDialog,
    setCollaborationDialogOpen: setCollabDialogOpen,
  }
}
