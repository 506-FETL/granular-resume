import type { RefObject } from 'react'
import type { ThemeColors } from '@/lib/schema'
import ResumeWrapper from './ResumeWrapper'
import { BasicResumeContent } from './templates/Basic'

interface ResumePreviewProps {
  resumeRef: RefObject<HTMLDivElement | null>
  font: {
    fontFamily: string
    nameSize: string
    jobIntentSize: string
    sectionTitleSize: string
    contentSize: string
    smallSize: string
    boldWeight: number
    mediumWeight: number
    normalWeight: number
  }
  spacing: {
    pagePadding: string
    sectionMargin: string
    sectionTitleMargin: string
    itemSpacing: string
    paragraphSpacing: string
    lineHeight: number
    proseLineHeight: number
  }
  theme: ThemeColors
}

export function ResumePreview({ resumeRef, font, spacing, theme }: ResumePreviewProps) {
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
      <ResumeWrapper ref={resumeRef}>
        <BasicResumeContent font={font} spacing={spacing} theme={theme} />
      </ResumeWrapper>
    </div>
  )
}
