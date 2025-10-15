/* eslint-disable react-hooks/rules-of-hooks */
import { SideTabs, SideTabsWrapper, Tab, ViewPort } from '@/components/SideTabs'
import { useTheme } from '@/components/theme-provider'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ORDERType, VisibilityItemsType } from '@/lib/schema'
import useResumeStore from '@/store/resume/form'
import {
  Award,
  Briefcase,
  Building2,
  Code2,
  Edit,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageSquare,
  School,
  Trophy,
  UserCheck,
  UserRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import ApplicationInfoForm from './components/forms/ApplicationInfoForm'
import BasicResumeForm from './components/forms/BasicResumeForm'
import CampusExperienceForm from './components/forms/CampusExperienceForm'
import EduBackgroundForm from './components/forms/EduBackgroundForm'
import HobbiesForm from './components/forms/HobbiesForm'
import HonorsCertificatesForm from './components/forms/HonorsCertificatesForm'
import InternshipExperienceForm from './components/forms/InternshipExperienceForm'
import JobIntentForm from './components/forms/JobIntentForm'
import ProjectExperienceForm from './components/forms/ProjectExperienceForm'
import SelfEvaluationForm from './components/forms/SelfEvaluationForm'
import SkillSpecialtyForm from './components/forms/SkillSpecialtyForm'
import WorkExperienceForm from './components/forms/WorkExperienceForm'
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
  {
    id: 'workExperience',
    label: '工作经历',
    icon: <Building2 />,
    content: <WorkExperienceForm />,
  },
  {
    id: 'internshipExperience',
    label: '实习经验',
    icon: <UserCheck />,
    content: <InternshipExperienceForm />,
  },
  {
    id: 'campusExperience',
    label: '校园经历',
    icon: <Trophy />,
    content: <CampusExperienceForm />,
  },
  {
    id: 'projectExperience',
    label: '项目经验',
    icon: <Code2 />,
    content: <ProjectExperienceForm />,
  },
  {
    id: 'skillSpecialty',
    label: '技能特长',
    icon: <Lightbulb />,
    content: <SkillSpecialtyForm />,
  },
  {
    id: 'honorsCertificates',
    label: '荣誉证书',
    icon: <Award />,
    content: <HonorsCertificatesForm />,
  },
  {
    id: 'selfEvaluation',
    label: '自我评价',
    icon: <MessageSquare />,
    content: <SelfEvaluationForm />,
  },
  {
    id: 'hobbies',
    label: '兴趣爱好',
    icon: <Heart />,
    content: <HobbiesForm />,
  },
]

function Editor() {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const activeTabId = useResumeStore((state) => state.activeTabId)
  const updateActiveTabId = useResumeStore((state) => state.updateActiveTabId)
  const toggleVisibility = useResumeStore((state) => state.toggleVisibility)
  const visibilityState = useResumeStore((state) => state.visibility)
  const isMobile = useIsMobile()

  const fill = theme === 'dark' ? '#0c0a09' : '#fafaf9'
  const stroke = theme === 'dark' ? '#3d3b3b' : '#e7e5e4'

  return (
    <>
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
        <DrawerContent className='h-140'>
          <DrawerHeader className='relative'>
            <DrawerTitle>简历信息</DrawerTitle>
            <DrawerDescription>实时同步</DrawerDescription>
          </DrawerHeader>
          <div className='p-4 overflow-y-scroll overflow-x-hidden'>
            <SideTabsWrapper defaultId={activeTabId}>
              <SideTabs>
                {ITEMS.map((item) => (
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
                ))}
              </SideTabs>
              <ViewPort items={ITEMS} fill={fill} stroke={stroke} />
            </SideTabsWrapper>
          </div>
        </DrawerContent>
      </Drawer>

      <div className='max-w-screen-2xl mx-auto'>
        <ResumePreview />
      </div>
    </>
  )
}

export default Editor
