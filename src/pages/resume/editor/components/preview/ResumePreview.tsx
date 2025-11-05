import type { RefObject } from 'react'
import ResumeContent from '.'
import ResumeWrapper from './ResumeWrapper'

interface ResumePreviewProps {
  resumeRef: RefObject<HTMLDivElement | null>
}

export function ResumePreview({ resumeRef }: ResumePreviewProps) {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <ResumeWrapper ref={resumeRef}>
        <ResumeContent />
      </ResumeWrapper>
    </div>
  )
}
