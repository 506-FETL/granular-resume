/* eslint-disable react-hooks/rules-of-hooks */
import type { ReactNode } from 'react'
import type { ORDERType } from '@/lib/schema'
import { Briefcase, Edit, GraduationCap, School, UserRound } from 'lucide-react'
import { useState } from 'react'
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import useResumeStore from '@/store/resume/form'
import ApplicationInfoForm from './components/forms/ApplicationInfoForm'
import BasicResumeForm from './components/forms/BasicResumeForm'
import EduBackgroundForm from './components/forms/EduBackgroundForm'
import JobIntentForm from './components/forms/JobIntentForm'
import ResumePreview from './components/preview/BasicResumePreview'

interface Item<T> {
  id: T
  label: string
  icon: ReactNode
  content: ReactNode
}

const ITEMS: Item<ORDERType>[] = [
  {
    id: 'basics',
    label: '基本信息',
    icon: <UserRound />,
    content: <BasicResumeForm />,
  },
  {
    id: 'jobIntent',
    label: '求职意向',
    icon: <Briefcase />,
    content: <JobIntentForm />,
  },
  {
    id: 'applicationInfo',
    label: '报考信息',
    icon: <School />,
    content: <ApplicationInfoForm />,
  },
  {
    id: 'eduBackground',
    label: '教育背景',
    icon: <GraduationCap />,
    content: <EduBackgroundForm />,
  },
]

function Editor() {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const activeTabId = useResumeStore(state => state.activeTabId)
  const updateActiveTabId = useResumeStore(state => state.updateActiveTabId)
  const revertIsHidden = useResumeStore(state => state.revertIsHidden)
  const isMobile = useIsMobile()

  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'

  return (
    <>
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
        <DrawerContent className="h-140">
          <DrawerHeader className="relative">
            <DrawerTitle>简历信息</DrawerTitle>
            <DrawerDescription>实时同步</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-scroll overflow-x-hidden">
            <SideTabsWrapper defaultId={activeTabId}>
              <SideTabs>
                {ITEMS.map(item => (
                  <div key={item.id} className="flex flex-col items-center justify-end gap-2">
                    {item.id !== 'basics' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Switch
                              checked={useResumeStore(state => state.getIsHidden(item.id as Exclude<ORDERType, 'basics'>))}
                              onCheckedChange={() => revertIsHidden(item.id as Exclude<ORDERType, 'basics'>)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>点击可隐藏模块</TooltipContent>
                      </Tooltip>
                    )}
                    <Tab id={item.id} onClick={() => updateActiveTabId(item.id)}>
                      {item.icon}
                      {!isMobile && item.label}
                    </Tab>
                  </div>
                ),
                )}
              </SideTabs>
              <ViewPort items={ITEMS} fill={fill} stroke={stroke} />
            </SideTabsWrapper>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="max-w-screen-2xl mx-auto">
        <ResumePreview />
      </div>
    </>
  )
}

export default Editor
