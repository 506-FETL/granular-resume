import type { ReactNode } from 'react'
import { styled } from 'styled-components'
import type { ResumeFontConfig, ResumeSpacing, ResumeTheme } from './resume-config'

interface SectionWrapperProps {
  children: ReactNode
  theme: ResumeTheme
  spacing: ResumeSpacing
}

interface SectionTitleProps {
  children: ReactNode
  theme: ResumeTheme
  spacing: ResumeSpacing
  font: ResumeFontConfig
}

interface SectionContentProps {
  children: ReactNode
  spacing: ResumeSpacing
}

// 模块外层容器 - 统一的模块样式
export function SectionWrapper({ children, theme, spacing }: SectionWrapperProps) {
  return (
    <StyledSection $theme={theme} $spacing={spacing}>
      {children}
    </StyledSection>
  )
}

// 模块标题 - 统一的标题样式
export function SectionTitle({ children, theme, spacing, font }: SectionTitleProps) {
  return (
    <StyledSectionTitle $theme={theme} $spacing={spacing} $font={font}>
      {children}
    </StyledSectionTitle>
  )
}

// 模块内容容器
export function SectionContent({ children, spacing }: SectionContentProps) {
  return <StyledSectionContent $spacing={spacing}>{children}</StyledSectionContent>
}

// 列表项容器（用于教育、工作经历等）
interface EntryItemProps {
  title: string
  subtitle?: string
  duration?: string
  children?: ReactNode
  theme: ResumeTheme
  spacing: ResumeSpacing
  font: ResumeFontConfig
}

export function EntryItem({ title, subtitle, duration, children, theme, spacing, font }: EntryItemProps) {
  return (
    <StyledEntryItem $spacing={spacing}>
      <EntryHeader $font={font}>
        <EntryTitle>
          <EntryMainTitle $theme={theme} $font={font}>
            {title}
          </EntryMainTitle>
          {subtitle && (
            <EntrySubtitle $theme={theme} $font={font}>
              {subtitle}
            </EntrySubtitle>
          )}
        </EntryTitle>
        {duration && (
          <EntryDuration $theme={theme} $font={font}>
            {duration}
          </EntryDuration>
        )}
      </EntryHeader>
      {children && <EntryContent $font={font}>{children}</EntryContent>}
    </StyledEntryItem>
  )
}

// 技能项组件
interface SkillItemProps {
  label: string
  proficiencyLevel: string
  displayType?: 'text' | 'percentage'
  percentage: number
  theme: ResumeTheme
  font: ResumeFontConfig
}

export function SkillItem({
  label,
  proficiencyLevel,
  displayType = 'percentage',
  percentage,
  theme,
  font,
}: SkillItemProps) {
  return (
    <StyledSkillItem>
      <SkillProgress>
        {displayType === 'percentage' ? (
          <>
            <SkillProgressBar $theme={theme}>
              <SkillProgressFill $theme={theme} $percentage={percentage} />
            </SkillProgressBar>
            <SkillPercentage $theme={theme} $font={font}>
              {percentage}%
            </SkillPercentage>
          </>
        ) : (
          <SkillLevel $theme={theme} $font={font}>
            {proficiencyLevel}
          </SkillLevel>
        )}
      </SkillProgress>
      <SkillLabel $theme={theme} $font={font}>
        {label}
      </SkillLabel>
    </StyledSkillItem>
  )
}

// ============ 样式组件 ============

const StyledSection = styled.div<{ $theme: ResumeTheme; $spacing: ResumeSpacing }>`
  margin-bottom: ${(props) => props.$spacing.sectionMarginBottom};
`

const StyledSectionTitle = styled.h2<{ $theme: ResumeTheme; $spacing: ResumeSpacing; $font: ResumeFontConfig }>`
  font-size: ${(props) => props.$font.sectionTitleSize};
  font-weight: ${(props) => props.$font.boldWeight};
  color: ${(props) => props.$theme.primaryColor};
  margin-bottom: ${(props) => props.$spacing.sectionTitleMarginBottom};
  padding-bottom: 0.25rem;
  border-bottom: 1px solid ${(props) => props.$theme.primaryColor};
`

const StyledSectionContent = styled.div<{ $spacing: ResumeSpacing }>`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.$spacing.itemSpacing};
`

const StyledEntryItem = styled.div<{ $spacing: ResumeSpacing }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const EntryHeader = styled.div<{ $font: ResumeFontConfig }>`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: ${(props) => props.$font.contentSize};
  gap: 1rem;
`

const EntryTitle = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const EntryMainTitle = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  font-weight: ${(props) => props.$font.boldWeight};
  color: ${(props) => props.$theme.textPrimary};
`

const EntrySubtitle = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  color: ${(props) => props.$theme.textSecondary};
  font-weight: ${(props) => props.$font.normalWeight};
`

const EntryDuration = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  color: ${(props) => props.$theme.textMuted};
  white-space: nowrap;
  font-size: ${(props) => props.$font.smallSize};
`

const EntryContent = styled.div<{ $font: ResumeFontConfig }>`
  font-size: ${(props) => props.$font.contentSize};
  color: #374151;
`

// 技能项样式
const StyledSkillItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.375rem;
`

const SkillProgress = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
`

const SkillProgressBar = styled.div<{ $theme: ResumeTheme }>`
  flex: 1;
  height: 0.375rem;
  background-color: ${(props) => props.$theme.progressBarBg};
  border-radius: 9999px;
  overflow: hidden;
`

const SkillProgressFill = styled.div<{ $theme: ResumeTheme; $percentage: number }>`
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background-color: ${(props) => props.$theme.progressBarFill};
  border-radius: 9999px;
  transition: width 0.3s ease;
`

const SkillPercentage = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  font-size: ${(props) => props.$font.smallSize};
  color: ${(props) => props.$theme.textMuted};
  min-width: 2.5rem;
  text-align: right;
`

const SkillLevel = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  font-size: ${(props) => props.$font.smallSize};
  color: ${(props) => props.$theme.textSecondary};
`

const SkillLabel = styled.span<{ $theme: ResumeTheme; $font: ResumeFontConfig }>`
  font-size: ${(props) => props.$font.smallSize};
  font-weight: ${(props) => props.$font.mediumWeight};
  color: ${(props) => props.$theme.textPrimary};
  text-align: left;
`
