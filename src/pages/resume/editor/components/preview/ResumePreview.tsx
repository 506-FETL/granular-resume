import type { RefObject } from 'react'
import { useResumeStyles } from '@/hooks/use-resume-styles'
import resumeComponents from '@/pages/template/components'
import BasicResume from '@/pages/template/components/basic/Basic'
import useResumeStore from '@/store/resume/form'
import ResumeWrapper from './ResumeWrapper'

interface ResumePreviewProps {
  resumeRef: RefObject<HTMLDivElement | null>
}

export function ResumePreview({ resumeRef }: ResumePreviewProps) {
  const { font, spacing, theme } = useResumeStyles()
  const type = useResumeStore(state => state.type)
  const ResumeComponent = resumeComponents[type] || BasicResume

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <ResumeWrapper ref={resumeRef}>
        <ResumeComponent font={font} spacing={spacing} theme={theme} />
      </ResumeWrapper>
    </div>
  )
}
