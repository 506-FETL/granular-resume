import { DraggableList } from '@/components/DraggableList'
import { RealtimeCursors } from '@/components/realtime-cursors'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
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
import useCollaborationStore from '@/store/collaboration'
import useCurrentResumeStore from '@/store/resume/current'
import useResumeStore from '@/store/resume/form'
import { Edit } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CollaborationControls } from './components/CollaborationControls'
import { CollaborationDialog } from './components/CollaborationDialog'
import { CollaborationPanelProvider } from './components/CollaborationPanelProvider'
import { DraggableItem } from './components/DraggableItem'
import ResumePreview from './components/preview/BasicResumePreview'
import { ResumeConfigToolbar } from './components/ResumeConfigToolbar'
import { ITEMS } from './data'
import type { SupabaseUser } from './types'

function Editor() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [currentUser, setCurrentUserState] = useState<SupabaseUser>(null)
  const { theme } = useTheme()
  const resumeId = useCurrentResumeStore((state) => state.resumeId)
  const { setCurrentResume } = useCurrentResumeStore()
  const navigate = useNavigate()
  const queryResumeId = searchParams.get('resumeId')
  const sharedDocUrl = searchParams.get('docUrl')
  const collabSessionParam = searchParams.get('collabSession')
  const activeResumeId = resumeId ?? queryResumeId ?? undefined

  const {
    activeTabId,
    order,
    updateActiveTabId,
    updateOrder,
    toggleVisibility,
    visibility: visibilityState,
    loadResumeData,
  } = useResumeStore()

  const roomName = useCollaborationStore((state) => state.roomName)

  const orderDraggable = order.filter((id) => id !== 'basics')
  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'
  const userDisplayName = useMemo(() => (currentUser ? getUserDisplayName(currentUser) : ''), [currentUser])

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
    if (queryResumeId && collabSessionParam) {
      // 如果有协作会话参数，强制切换到链接中的简历
      setCurrentResume(queryResumeId, 'default')
    } else if (!resumeId && queryResumeId) {
      setCurrentResume(queryResumeId, 'default')
    }
  }, [resumeId, queryResumeId, collabSessionParam, setCurrentResume])

  useEffect(() => {
    if (!activeResumeId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    loadResumeData(activeResumeId, sharedDocUrl ? { documentUrl: sharedDocUrl } : undefined)
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
  }, [activeResumeId, loadResumeData, navigate, sharedDocUrl])

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
    <CollaborationPanelProvider
      currentUser={currentUser}
      activeResumeId={activeResumeId}
      userDisplayName={userDisplayName}
    >
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
              <CollaborationControls />
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
        <CollaborationDialog />
      </>
    </CollaborationPanelProvider>
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
