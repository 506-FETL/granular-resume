import { DraggableList } from '@/components/DraggableList'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DragProvider } from '@/contexts/DragContext'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ORDERType, VisibilityItemsType } from '@/lib/schema'
import useCurrentResumeStore from '@/store/resume/current'
import useResumeStore from '@/store/resume/form'
import { Clock, Edit, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { DraggableItem } from './components/DraggableItem'
import ResumePreview from './components/preview/BasicResumePreview'
import { ResumeConfigToolbar } from './components/ResumeConfigToolbar'
import { ITEMS, type Item } from './data'

function Editor() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const { id: resumeId } = useParams<{ id: string }>()
  const navigate = useNavigate()

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

  const isMobile = useIsMobile()
  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'

  // 加载简历数据
  useEffect(() => {
    async function loadData() {
      try {
        // 加载简历数据
        await loadResumeData(resumeId!)
      } catch (error: any) {
        toast.error(`加载简历失败, ${error.details || '未知错误'}`)
        navigate('/resume')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resumeId, loadResumeData, setCurrentResume, navigate])

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
              <DrawerDescription className='flex items-center justify-start gap-4'>
                <span>实时同步到云端</span>
                <Button
                  size={isMobile ? 'icon' : 'sm'}
                  variant='outline'
                  onClick={manualSync}
                  disabled={isSyncing || !pendingChanges}
                >
                  <Save className='h-4 w-4' />
                  {!isMobile && '手动保存'}
                </Button>
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
    </>
  )
}

export default Editor
