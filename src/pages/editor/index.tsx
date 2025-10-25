import { DraggableList } from '@/components/DraggableList'
import { RealtimeCursors } from '@/components/realtime-cursors'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader as ModalHeader,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DragProvider } from '@/contexts/DragContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { isOfflineResumeId } from '@/lib/offline-resume-manager'
import type { VisibilityItemsType } from '@/lib/schema'
import { subscribeToResumeConfigUpdates } from '@/lib/supabase/resume'
import { getCurrentUser } from '@/lib/supabase/user'
import { cn } from '@/lib/utils'
import useCollaborationStore from '@/store/collaboration'
import useCurrentResumeStore from '@/store/resume/current'
import useResumeStore from '@/store/resume/form'
import { Clock, Copy, Edit, Loader2, Radio, Save, Share2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DraggableItem } from './components/DraggableItem'
import ResumePreview from './components/preview/BasicResumePreview'
import { ResumeConfigToolbar } from './components/ResumeConfigToolbar'
import { ITEMS } from './data'

type SupabaseUser = Awaited<ReturnType<typeof getCurrentUser>>

function Editor() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [collabDialogOpen, setCollabDialogOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentUser, setCurrentUserState] = useState<SupabaseUser>(null)
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null)
  const { theme } = useTheme()
  const resumeId = useCurrentResumeStore((state) => state.resumeId)
  const navigate = useNavigate()
  const queryResumeId = searchParams.get('resumeId')
  const collabSessionParam = searchParams.get('collabSession')
  const activeResumeId = resumeId ?? queryResumeId ?? undefined

  // Resume Store
  const activeTabId = useResumeStore((state) => state.activeTabId)
  const order = useResumeStore((state) => state.order)
  const orderDraggable = order.filter((id) => id !== 'basics')
  const updateActiveTabId = useResumeStore((state) => state.updateActiveTabId)
  const updateOrder = useResumeStore((state) => state.updateOrder)
  const toggleVisibility = useResumeStore((state) => state.toggleVisibility)
  const visibilityState = useResumeStore((state) => state.visibility)
  const loadResumeData = useResumeStore((state) => state.loadResumeData)
  const manualSync = useResumeStore((state) => state.manualSync)
  const isSyncing = useResumeStore((state) => state.isSyncing)
  const lastSyncTime = useResumeStore((state) => state.lastSyncTime)
  const pendingChanges = useResumeStore((state) => state.pendingChanges)
  const { setCurrentResume } = useCurrentResumeStore()
  const mode = useResumeStore((state) => state.mode)
  const isDocumentInitialized = useResumeStore((state) => state.isInitialized)
  const participants = useCollaborationStore((state) => state.participants)
  const isSharing = useCollaborationStore((state) => state.isSharing)
  const isCollabConnecting = useCollaborationStore((state) => state.isConnecting)
  const shareUrl = useCollaborationStore((state) => state.shareUrl)
  const roomName = useCollaborationStore((state) => state.roomName)
  const collaborationRole = useCollaborationStore((state) => state.role)
  const startSharing = useCollaborationStore((state) => state.startSharing)
  const stopSharing = useCollaborationStore((state) => state.stopSharing)
  const joinSession = useCollaborationStore((state) => state.joinSession)
  const collaborationError = useCollaborationStore((state) => state.error)

  const isMobile = useIsMobile()
  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'
  const participantCount = useMemo(() => Object.keys(participants).length, [participants])
  const collabDisabledReason = useMemo(() => {
    if (mode !== 'online') return '离线简历暂不支持实时协作'
    if (!currentUser) return '请先登录以启用实时协作'
    if (!isDocumentInitialized) return '数据加载中，请稍候'
    return null
  }, [mode, currentUser, isDocumentInitialized])
  const userDisplayName = useMemo(() => (currentUser ? getUserDisplayName(currentUser) : ''), [currentUser])
  const canCopyLink = typeof navigator !== 'undefined' && !!navigator.clipboard
  const shareButtonTooltip = collabDisabledReason ?? (isSharing ? '查看协作信息' : '开启实时协作')

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
      }
    } catch {
      // store 已处理提示
    }
  }, [activeResumeId, currentUser, startSharing, userDisplayName, setSearchParams])

  const handleStopSharing = useCallback(() => {
    stopSharing()
    const params = new URLSearchParams(window.location.search)
    params.delete('collabSession')
    params.delete('resumeId')
    setSearchParams(params, { replace: true })
    setJoinedSessionId(null)
    setCollabDialogOpen(false)
    location.reload()
  }, [setSearchParams, stopSharing])

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) return
    if (!canCopyLink) {
      toast.info('请手动复制链接')
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('已复制分享链接')
    } catch {
      toast.error('复制失败，请手动复制')
    }
  }, [shareUrl, canCopyLink])

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

  useEffect(() => {
    return () => {
      useResumeStore.getState().cleanup()
      useCollaborationStore.getState().stopSharing({ silent: true })
    }
  }, [])

  useEffect(() => {
    if (!resumeId && queryResumeId) {
      setCurrentResume(queryResumeId, 'default')
    }
  }, [resumeId, queryResumeId, setCurrentResume])

  // 加载简历数据
  useEffect(() => {
    if (!activeResumeId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    loadResumeData(activeResumeId)
      .catch((error: any) => {
        if (cancelled) return
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
  }, [activeResumeId, loadResumeData, navigate])

  // 订阅简历删除事件（仅在线简历）
  useEffect(() => {
    if (!activeResumeId || isOfflineResumeId(activeResumeId) || !currentUser) return

    let unSubscribe: (() => void) | undefined
    let cancelled = false

    ;(async () => {
      try {
        unSubscribe = await subscribeToResumeConfigUpdates((payload) => {
          if (cancelled) return
          if (payload.eventType !== 'DELETE') return

          const deletedResumeId = payload.old.resume_id
          if (deletedResumeId !== activeResumeId) return

          const resumeName = payload.old.display_name || '简历'
          toast.error(`简历 "${resumeName}" 已在其他窗口被删除`, {
            duration: 5000,
          })

          setTimeout(() => {
            navigate('/resume')
          }, 1500)
        })
      } catch {
        // ignore
      }
    })()

    return () => {
      cancelled = true
      unSubscribe?.()
    }
  }, [activeResumeId, currentUser, navigate])

  useEffect(() => {
    if (!collabSessionParam || !activeResumeId) return
    if (isSharing || joinedSessionId === collabSessionParam) return
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
    isDocumentInitialized,
    mode,
    currentUser,
    joinSession,
    userDisplayName,
  ])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Spinner className='mx-auto' />
          <p className='mt-4 text-muted-foreground'>加载简历中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {roomName && currentUser && (
        <RealtimeCursors roomName={roomName} username={userDisplayName || `用户-${currentUser.id.slice(0, 6)}`} />
      )}
      <DragProvider>
        <Drawer open={open} onOpenChange={setOpen} handleOnly>
          <DrawerTrigger asChild>
            <RainbowButton
              variant='outline'
              className='fixed bottom-6 left-1/2 z-1 -transform -translate-x-1/2'
              size={isMobile ? 'icon' : 'default'}
            >
              <Edit />
              {!isMobile && '编辑简历'}
            </RainbowButton>
          </DrawerTrigger>
          <DrawerContent className='h-160'>
            <DrawerHeader className='relative'>
              <DrawerTitle className='flex items-center gap-3'>
                简历信息
                {/* 同步状态指示器 */}
                {isSyncing ? (
                  <span className='flex items-center gap-2 text-sm text-muted-foreground font-normal'>
                    <Clock className='h-4 w-4 animate-spin' />
                    同步中...
                  </span>
                ) : pendingChanges ? (
                  <span className='flex items-center gap-2 text-sm text-amber-600 font-normal'>
                    <Clock className='h-4 w-4' />
                    有未保存的更改
                  </span>
                ) : lastSyncTime ? (
                  <span className='text-sm text-green-600 font-normal'>
                    已同步 {new Date(lastSyncTime).toLocaleTimeString()}
                  </span>
                ) : null}
              </DrawerTitle>
              <DrawerDescription asChild>
                <div className='text-sm text-muted-foreground flex flex-wrap items-center gap-3'>
                  <span>实时同步到云端</span>
                  <div className='flex items-center gap-2'>
                    <Button
                      size={isMobile ? 'icon' : 'sm'}
                      variant='outline'
                      onClick={manualSync}
                      disabled={isSyncing || !pendingChanges}
                    >
                      <Save className='h-4 w-4' />
                      {!isMobile && '手动保存'}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            size={isMobile ? 'icon' : 'sm'}
                            variant={isSharing ? 'default' : 'outline'}
                            onClick={() => setCollabDialogOpen(true)}
                            disabled={Boolean(collabDisabledReason) || isCollabConnecting}
                            className={cn(
                              'transition-colors',
                              isSharing &&
                                !isCollabConnecting &&
                                'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
                            )}
                          >
                            {isCollabConnecting ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : isSharing ? (
                              <Radio className='h-4 w-4' />
                            ) : (
                              <Share2 className='h-4 w-4' />
                            )}
                            {!isMobile && (isSharing ? '协作中' : '开启协作')}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>{shareButtonTooltip}</TooltipContent>
                    </Tooltip>
                    {isSharing && (
                      <span className='text-xs font-medium text-emerald-600'>协作人数 {participantCount}</span>
                    )}
                  </div>
                </div>
              </DrawerDescription>
            </DrawerHeader>
            <div className='p-4 overflow-y-scroll overflow-x-hidden'>
              <DraggableList items={orderDraggable} onOrderChange={(order) => updateOrder(['basics', ...order])}>
                <SideTabsWrapper defaultId={activeTabId}>
                  <SideTabs>
                    <div className='flex flex-col items-center justify-end gap-2'>
                      <Tab
                        id={'basics'}
                        onClick={() => updateActiveTabId('basics')}
                        disabled={visibilityState['basics' as VisibilityItemsType]}
                      >
                        {ITEMS.find((item) => item.id === 'basics')?.icon}
                        {!isMobile && ITEMS.find((item) => item.id === 'basics')?.label}
                      </Tab>
                    </div>
                    {orderDraggable.map((itm, index) => {
                      const item = ITEMS.find((it) => it.id === itm)!
                      return (
                        <DraggableItem id={item.id} index={index} key={item.id} disabled={item.id === 'basics'}>
                          <div key={item.id} className='flex flex-col items-center justify-end gap-2'>
                            {item.id !== 'basics' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={!visibilityState[item.id as VisibilityItemsType]}
                                      onCheckedChange={() => toggleVisibility(item.id as VisibilityItemsType)}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>点击可隐藏模块</TooltipContent>
                              </Tooltip>
                            )}
                            <Tab
                              id={item.id}
                              onClick={() => updateActiveTabId(item.id)}
                              disabled={visibilityState[item.id as VisibilityItemsType]}
                            >
                              {item.icon}
                              {!isMobile && item.label}
                            </Tab>
                          </div>
                        </DraggableItem>
                      )
                    })}
                  </SideTabs>
                  <ViewPort items={ITEMS} fill={fill} stroke={stroke} />
                </SideTabsWrapper>
              </DraggableList>
            </div>
          </DrawerContent>
        </Drawer>
        <div className='flex flex-col md:flex-row min-h-screen overflow-auto'>
          <ResumeConfigToolbar />
          <div className='flex-1 overflow-auto p-4 md:p-8'>
            <ResumePreview />
          </div>
        </div>
      </DragProvider>
      <Dialog open={collabDialogOpen} onOpenChange={setCollabDialogOpen}>
        <DialogContent className='max-w-lg'>
          {isSharing ? (
            <>
              <ModalHeader>
                <DialogTitle>实时协作已开启</DialogTitle>
                <DialogDescription>
                  将链接分享给队友即可实时同步编辑内容，当前协作人数 {participantCount}
                </DialogDescription>
              </ModalHeader>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <p className='text-sm text-muted-foreground'>分享链接</p>
                  <div className='flex items-center gap-2'>
                    <Input readOnly value={shareUrl ?? ''} className='flex-1 text-xs md:text-sm' />
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={handleCopyShareLink}
                      disabled={!shareUrl}
                    >
                      <Copy className='h-4 w-4' />
                      <span className='hidden md:inline'>复制</span>
                    </Button>
                  </div>
                </div>
                <div className='rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground'>
                  <p>
                    <span className='font-medium text-foreground'>
                      {collaborationRole === 'host' ? '发起者' : '协作者'}
                    </span>
                    {collaborationRole === 'host'
                      ? ' 可以随时关闭共享，关闭后他人将无法继续加入此链接。'
                      : ' 可以随时退出协作，重新访问链接即可再次加入。'}
                  </p>
                </div>
              </div>
              <DialogFooter className='flex justify-between sm:justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => setCollabDialogOpen(false)}>
                  关闭
                </Button>
                <Button type='button' variant='destructive' onClick={handleStopSharing}>
                  {collaborationRole === 'host' ? '停止共享' : '离开协作'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <ModalHeader>
                <DialogTitle>开启实时协作</DialogTitle>
                <DialogDescription>
                  启用后将创建协作会话，你可以复制链接分享给队友，大家的更改会实时同步。
                </DialogDescription>
              </ModalHeader>
              <div className='space-y-3 text-sm text-muted-foreground'>
                <p>• 支持多人同时编辑，自动保存修改记录</p>
                <p>• 分享结束后链接立即失效，可随时重新开启</p>
              </div>
              {collaborationError && <p className='text-sm text-destructive'>{collaborationError}</p>}
              <DialogFooter className='flex justify-between sm:justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => setCollabDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  type='button'
                  onClick={handleStartSharing}
                  disabled={Boolean(collabDisabledReason) || isCollabConnecting || !activeResumeId || !currentUser}
                >
                  {isCollabConnecting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  确认开启
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Editor

function getUserDisplayName(user: SupabaseUser) {
  if (!user) return ''
  const fullName =
    (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined)
  if (fullName) return fullName
  if (user.email) return user.email
  return `用户-${user.id.slice(0, 6)}`
}
