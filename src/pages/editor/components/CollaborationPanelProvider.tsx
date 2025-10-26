import { useIsMobile } from '@/hooks/use-mobile'
import type { SupabaseUser } from '@/pages/editor/types'
import useCollaborationStore from '@/store/collaboration'
import useResumeStore from '@/store/resume/form'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

interface CollaborationPanelContextValue {
  isMobile: boolean
  isSyncing: boolean
  pendingChanges: boolean
  lastSyncTime: number | null
  isSharing: boolean
  isCollabConnecting: boolean
  collabDisabledReason: string | null
  shareButtonTooltip: string
  participantCount: number
  shareUrl: string | null
  collaborationRole: 'host' | 'guest' | null
  collaborationError: string | null
  canStartSharing: boolean
  collabDialogOpen: boolean
  onManualSync: () => void
  onCopyShareLink: () => void
  onStartSharing: () => Promise<void>
  onStopSharing: () => void
  openCollaborationDialog: () => void
  closeCollaborationDialog: () => void
  setCollaborationDialogOpen: (open: boolean) => void
}

const CollaborationPanelContext = createContext<CollaborationPanelContextValue | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useCollaborationPanel() {
  const context = useContext(CollaborationPanelContext)

  if (!context) {
    throw new Error('useCollaborationPanel must be used within CollaborationPanelProvider')
  }
  return context
}

interface CollaborationPanelProviderProps {
  currentUser: SupabaseUser
  activeResumeId?: string
  userDisplayName: string
  children: ReactNode
}

export function CollaborationPanelProvider({
  currentUser,
  activeResumeId,
  userDisplayName,
  children,
}: CollaborationPanelProviderProps) {
  const isMobile = useIsMobile()
  const [collabDialogOpen, setCollabDialogOpen] = useState(false)
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null)
  const [lastStoppedSessionId, setLastStoppedSessionId] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
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
    error: collaborationError,
    sessionId,
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

  const handleManualSync = () => manualSync()

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
        // NOTE: 不再将本地 documentUrl 写入分享链接或 URL 参数，避免跨浏览器加载本地 handle
        setSearchParams(params, { replace: true })
        setJoinedSessionId(newSessionId)
        setLastStoppedSessionId(null)
      }
    } catch (error: any) {
      toast.error('开启实时协作失败，请稍后重试', error.message)
    }
  }, [activeResumeId, currentUser, startSharing, userDisplayName, setSearchParams])

  const handleStopSharing = () => {
    const lastSession = sessionId ?? useCollaborationStore.getState().sessionId
    if (lastSession) {
      setLastStoppedSessionId(lastSession)
    }
    stopSharing()
    const params = new URLSearchParams(window.location.search)

    params.delete('collabSession')
    params.delete('resumeId')
    params.delete('docUrl')

    setSearchParams(params, { replace: true })
    setCollabDialogOpen(false)
  }

  const handleCopyShareLink = () => {
    if (!shareUrl) return
    if (!canCopyLink) {
      toast.info('请手动复制链接')
      return
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success('已复制分享链接')
      })
      .catch(() => {
        toast.error('复制失败，请手动复制')
      })
  }

  const canStartSharing = Boolean(activeResumeId && currentUser && !collabDisabledReason && !isCollabConnecting)

  useEffect(() => {
    if (!collabSessionParam || !activeResumeId) return
    if (isSharing) return
    if (lastStoppedSessionId && collabSessionParam === lastStoppedSessionId) return
    if (joinedSessionId === collabSessionParam) return
    if (!isDocumentInitialized || mode !== 'online' || !currentUser) return

    joinSession({
      sessionId: collabSessionParam,
      resumeId: activeResumeId,
      userId: currentUser.id,
      userName: userDisplayName || `用户-${currentUser.id.slice(0, 6)}`,
    })
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
    joinSession,
    userDisplayName,
  ])

  useEffect(() => {
    if (!collabSessionParam && joinedSessionId) {
      setJoinedSessionId(null)
    }
  }, [collabSessionParam, joinedSessionId])

  const openCollaborationDialog = () => setCollabDialogOpen(true)
  const closeCollaborationDialog = () => setCollabDialogOpen(false)
  const setCollaborationDialogOpen = (open: boolean) => setCollabDialogOpen(open)

  const value = {
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
    setCollaborationDialogOpen,
  }

  return <CollaborationPanelContext value={value}>{children}</CollaborationPanelContext>
}
