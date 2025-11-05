import { Edit } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { RealtimeCursors } from '@/components/realtime-cursors'
import { useTheme } from '@/components/theme-provider'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Spinner } from '@/components/ui/spinner'
import { DragProvider } from '@/contexts/DragContext'
import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { useIsMobile } from '@/hooks/use-mobile'
import useCollaborationStore from '@/store/collaboration'
import useResumeExportStore from '@/store/resume/export'
import useResumeStore from '@/store/resume/form'
import { CollaborationControls } from './components/collaboration/CollaborationControls'
import { CollaborationDialog } from './components/collaboration/CollaborationDialog'
import { CollaborationPanelProvider } from './components/collaboration/CollaborationPanelProvider'
import { ResumePreview } from './components/preview/ResumePreview'
import { SidebarEditor } from './components/sidebar/SidebarEditor'
import { useResumeLoader } from './hooks/useResumeLoader'

function Editor() {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const { loading, currentUser, activeResumeId } = useResumeLoader()

  const resumeRef = useRef<HTMLDivElement | null>(null)

  const resumeName = useResumeStore(state => state.basics.name)
  const setResumeRef = useResumeExportStore(state => state.setResumeRef)
  const setHandlePrint = useResumeExportStore(state => state.setHandlePrint)

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: resumeName ? `${resumeName}-简历` : '我的简历',
  })

  useEffect(() => {
    setResumeRef(resumeRef)
  }, [setResumeRef])

  useEffect(() => {
    setHandlePrint(handlePrint)
  }, [setHandlePrint, handlePrint])

  const {
    activeTabId,
    order,
    updateActiveTabId,
    updateOrder,
    toggleVisibility,
    visibility: visibilityState,
  } = useResumeStore()

  const roomName = useCollaborationStore(state => state.roomName)

  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'
  const userDisplayName = useCurrentUserName()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spinner className="mx-auto" />
          <p className="mt-4 text-muted-foreground">加载简历中...</p>
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

      {roomName && currentUser && (
        <RealtimeCursors roomName={roomName} username={userDisplayName || `用户-${currentUser.id.slice(0, 6)}`} />
      )}

      <DragProvider>
        <Drawer open={open} onOpenChange={setOpen} handleOnly>
          <DrawerTrigger asChild>
            <RainbowButton
              variant="outline"
              className="fixed bottom-6 left-1/2 z-1 -transform -translate-x-1/2"
              size={isMobile ? 'icon' : 'default'}
            >
              <Edit />
              {!isMobile && '编辑简历'}
            </RainbowButton>
          </DrawerTrigger>
          <DrawerContent className="h-160">
            <CollaborationControls />
            <div className="p-4 overflow-y-scroll overflow-x-hidden">
              <SidebarEditor
                activeTabId={activeTabId}
                order={order}
                visibilityState={visibilityState}
                fill={fill}
                stroke={stroke}
                isMobile={isMobile}
                onUpdateActiveTabId={updateActiveTabId}
                onUpdateOrder={updateOrder}
                onToggleVisibility={toggleVisibility}
              />
            </div>
          </DrawerContent>
        </Drawer>
        <div className="flex flex-col md:flex-row min-h-screen overflow-auto">
          <ResumePreview resumeRef={resumeRef} />
        </div>
      </DragProvider>
      <CollaborationDialog />
    </CollaborationPanelProvider>
  )
}

export default Editor
