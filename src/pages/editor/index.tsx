import type { Item } from '@/components/SideTabsWithCurve'
import type { ORDERType } from '@/lib/schema'
import { Briefcase, UserRound } from 'lucide-react'
import { useState } from 'react'
import { SideTabsWithCurve } from '@/components/SideTabsWithCurve'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import useResumeStore from '@/store/resume/form'
import BasicResumeForm from './components/forms/BasicResumeForm'
import JobIntentForm from './components/forms/JobIntentForm'
import ResumePreview from './components/preview/BasicResumePreview'

const ITEMS: Item<ORDERType>[] = [
  {
    id: 'basics',
    label: '基本信息',
    content: <BasicResumeForm />,
    icon: <UserRound />,
  },
  {
    id: 'jobIntent',
    label: '求职意向',
    icon: <Briefcase />,
    content: <JobIntentForm />,
  },
]

function Editor() {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const activeTabId = useResumeStore(state => state.activeTabId)

  const fill = theme === 'dark' ? '#1c1917' : '#fafaf9'
  const stroke = theme === 'dark' ? '#292524' : '#e7e5e4'

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen} handleOnly>
        <DrawerTrigger asChild>
          <Button variant="outline" className="fixed bottom-10 z-10">编辑简历</Button>
        </DrawerTrigger>
        <DrawerContent className="h-120">
          <DrawerHeader>
            <DrawerTitle>简历信息</DrawerTitle>
          </DrawerHeader>
          <DrawerDescription></DrawerDescription>
          <div className="p-4 overflow-y-auto overflow-x-hidden">
            <SideTabsWithCurve items={ITEMS} defaultId={activeTabId} fill={fill} stroke={stroke} />
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
