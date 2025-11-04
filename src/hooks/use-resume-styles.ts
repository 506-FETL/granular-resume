import { useMemo } from 'react'
import { getFontFamilyCSS, themeColorMap } from '@/lib/schema'
import useResumeConfigStore from '@/store/resume/config'

export function useResumeStyles() {
  const spacingConfig = useResumeConfigStore(state => state.spacing)
  const fontConfig = useResumeConfigStore(state => state.font)
  const themeConfig = useResumeConfigStore(state => state.theme)

  const resumeTheme = useMemo(() => themeColorMap[themeConfig.theme], [themeConfig.theme])

  const fontSize = fontConfig.fontSize

  const font = useMemo(() => ({
    fontFamily: getFontFamilyCSS(fontConfig.fontFamily),
    nameSize: `${fontSize * 1.5}px`,
    jobIntentSize: `${fontSize}px`,
    sectionTitleSize: `${fontSize}px`,
    contentSize: `${fontSize * 0.875}px`,
    smallSize: `${fontSize * 0.75}px`,
    boldWeight: 700,
    mediumWeight: 600,
    normalWeight: 400,
  }), [fontConfig.fontFamily, fontSize])

  const spacing = useMemo(() => ({
    pagePadding: `${spacingConfig.pageMargin}px`,
    sectionMargin: `${spacingConfig.sectionSpacing}px`,
    sectionTitleMargin: '0.75rem',
    itemSpacing: '0.55rem',
    paragraphSpacing: '0.25rem',
    lineHeight: spacingConfig.lineHeight,
    proseLineHeight: spacingConfig.lineHeight,
  }), [spacingConfig.pageMargin, spacingConfig.sectionSpacing, spacingConfig.lineHeight])

  return {
    font,
    spacing,
    theme: resumeTheme,
  }
}
