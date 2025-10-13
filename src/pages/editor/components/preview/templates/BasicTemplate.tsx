/**
 * 基础简历模板渲染器
 * 实现了一个简洁的单栏布局简历模板
 */

import parser from 'html-react-parser'
import type { ReactNode } from 'react'
import { styled } from 'styled-components'
import { BaseResumeRenderer, type RenderContext } from '../renderer-interface'
import { skillProficiencyMap } from '../resume-config'
import { EntryItem, SectionContent, SectionTitle, SectionWrapper, SkillItem } from '../ResumeComponents'
import type {
  ApplicationInfoData,
  BasicsData,
  CampusExperienceData,
  EduBackgroundData,
  HobbiesData,
  HonorsCertificatesData,
  InternshipExperienceData,
  JobIntentData,
  ProjectExperienceData,
  ResumeData,
  SelfEvaluationData,
  SkillSpecialtyData,
  WorkExperienceData,
} from '../types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export class BasicTemplateRenderer extends BaseResumeRenderer {
  renderResume(data: ResumeData, context: RenderContext): ReactNode {
    return (
      <ResumeContainer>
        <ResumeWrapper $theme={context.theme} $spacing={context.spacing} $font={context.font}>
          {data.order.map((moduleType) => (
            <div key={moduleType}>{this.renderModuleByType(moduleType, data, context)}</div>
          ))}
        </ResumeWrapper>
      </ResumeContainer>
    )
  }

  renderBasics(data: BasicsData, jobIntent: JobIntentData, context: RenderContext): ReactNode {
    const { theme, font, spacing, age } = context

    return (
      <HeaderSection $theme={theme} $font={font}>
        {/* 姓名 */}
        <Name $theme={theme} $font={font}>
          {data.name || '姓名'}
        </Name>

        {/* 求职意向 */}
        {jobIntent?.jobIntent && !jobIntent.isHidden && (
          <JobIntent $theme={theme} $font={font}>
            <span className='font-medium'>求职意向：</span>
            {jobIntent.jobIntent}
            {jobIntent.intentionalCity && ` | ${jobIntent.intentionalCity}`}
            {jobIntent.expectedSalary && ` | ${jobIntent.expectedSalary}K`}
            {jobIntent.dateEntry && jobIntent.dateEntry !== '不填' && ` | ${jobIntent.dateEntry}`}
          </JobIntent>
        )}

        {/* 基本信息 */}
        <InfoRow $theme={theme} $font={font} $spacing={spacing}>
          {age && <span>{age}岁</span>}
          {data.gender && data.gender !== '不填' && <span>{data.gender}</span>}
          {data.nation && <span>{data.nation}</span>}
          {data.maritalStatus && data.maritalStatus !== '不填' && <span>{data.maritalStatus}</span>}
          {data.heightCm && <span>{data.heightCm}cm</span>}
          {data.weightKg && <span>{data.weightKg}kg</span>}
          {data.workYears && data.workYears !== '不填' && <span>{data.workYears}</span>}
          {data.politicalStatus && data.politicalStatus !== '不填' && <span>{data.politicalStatus}</span>}
          {data.nativePlace && <span>{data.nativePlace}</span>}
        </InfoRow>

        {/* 联系方式 */}
        <InfoRow $theme={theme} $font={font} $spacing={spacing}>
          {data.phone && <span>{data.phone}</span>}
          {data.email && <span>{data.email}</span>}
        </InfoRow>

        {/* 自定义字段 */}
        <div className='flex flex-wrap justify-center gap-4'>
          {data.customFields
            ?.filter((field): field is NonNullable<typeof field> => Boolean(field?.label && field?.value))
            .map((field) => (
              <CustomField key={`custom-${field.label}`} $theme={theme} $font={font}>
                <span style={{ fontWeight: font.mediumWeight }}>{field.label}：</span>
                <span>{field.value}</span>
              </CustomField>
            ))}
        </div>
      </HeaderSection>
    )
  }

  renderApplicationInfo(data: ApplicationInfoData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context
    const hasContent = data.applicationSchool || data.applicationMajor

    if (!hasContent) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          报考信息
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.applicationSchool && (
            <ContentText $font={font} $spacing={spacing}>
              报考院校：<span style={{ fontWeight: font.mediumWeight }}>{data.applicationSchool}</span>
            </ContentText>
          )}
          {data.applicationMajor && (
            <ContentText $font={font} $spacing={spacing}>
              报考专业：<span style={{ fontWeight: font.mediumWeight }}>{data.applicationMajor}</span>
            </ContentText>
          )}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderEduBackground(data: EduBackgroundData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.items?.length) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          教育背景
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.items.map((item, index) => {
            const subtitle =
              item.degree && item.degree !== '不填' ? `${item.professional}（${item.degree}）` : item.professional
            const duration = this.formatDuration(item.duration)

            return (
              <EntryItem
                key={`edu-${item.schoolName}-${index}`}
                title={item.schoolName}
                subtitle={subtitle}
                duration={duration}
                theme={theme}
                spacing={spacing}
                font={font}
              >
                {item.eduInfo && this.renderRichText(item.eduInfo, context)}
              </EntryItem>
            )
          })}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderWorkExperience(data: WorkExperienceData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.items?.length) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          工作经历
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.items.map((item, index) => {
            const duration = this.formatDuration(item.workDuration)

            return (
              <EntryItem
                key={`work-${item.companyName}-${index}`}
                title={item.companyName}
                subtitle={item.position}
                duration={duration}
                theme={theme}
                spacing={spacing}
                font={font}
              >
                {item.workInfo && this.renderRichText(item.workInfo, context)}
              </EntryItem>
            )
          })}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderInternshipExperience(data: InternshipExperienceData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.items?.length) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          实习经验
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.items.map((item, index) => {
            const duration = this.formatDuration(item.internshipDuration)

            return (
              <EntryItem
                key={`intern-${item.companyName}-${index}`}
                title={item.companyName}
                subtitle={item.position}
                duration={duration}
                theme={theme}
                spacing={spacing}
                font={font}
              >
                {item.internshipInfo && this.renderRichText(item.internshipInfo, context)}
              </EntryItem>
            )
          })}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderProjectExperience(data: ProjectExperienceData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.items?.length) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          项目经验
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.items.map((item, index) => {
            const duration = this.formatDuration(item.projectDuration)

            return (
              <EntryItem
                key={`project-${item.projectName}-${index}`}
                title={item.projectName}
                subtitle={item.participantRole}
                duration={duration}
                theme={theme}
                spacing={spacing}
                font={font}
              >
                {item.projectInfo && this.renderRichText(item.projectInfo, context)}
              </EntryItem>
            )
          })}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderCampusExperience(data: CampusExperienceData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.items?.length) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          校园经历
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.items.map((item, index) => {
            const duration = this.formatDuration(item.duration)

            return (
              <EntryItem
                key={`campus-${item.experienceName}-${index}`}
                title={item.experienceName}
                subtitle={item.role}
                duration={duration}
                theme={theme}
                spacing={spacing}
                font={font}
              >
                {item.campusInfo && this.renderRichText(item.campusInfo, context)}
              </EntryItem>
            )
          })}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderSkillSpecialty(data: SkillSpecialtyData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context
    const hasContent = data.description || data.skills?.length

    if (!hasContent) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          技能特长
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.description && this.renderRichText(data.description, context)}

          {data.skills && data.skills.length > 0 && (
            <SkillGrid>
              {data.skills.map((skill, index) => {
                const percentage = skillProficiencyMap[skill.proficiencyLevel as keyof typeof skillProficiencyMap] || 40

                return (
                  <SkillItem
                    key={`skill-${skill.label}-${index}`}
                    label={skill.label}
                    proficiencyLevel={skill.proficiencyLevel}
                    displayType={skill.displayType}
                    percentage={percentage}
                    theme={theme}
                    font={font}
                  />
                )
              })}
            </SkillGrid>
          )}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderHonorsCertificates(data: HonorsCertificatesData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context
    const hasContent = data.description || data.certificates?.length

    if (!hasContent) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          荣誉证书
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.description && this.renderRichText(data.description, context)}

          {data.certificates && data.certificates.length > 0 && (
            <ContentText $font={font} $spacing={spacing}>
              {data.certificates.map((cert, index) => (
                <span key={`cert-${cert.name}-${index}`}>
                  {index > 0 && '、'}
                  {cert.name}
                </span>
              ))}
            </ContentText>
          )}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderSelfEvaluation(data: SelfEvaluationData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context

    if (!data.content) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          自我评价
        </SectionTitle>
        <SectionContent spacing={spacing}>{this.renderRichText(data.content, context)}</SectionContent>
      </SectionWrapper>
    )
  }

  renderHobbies(data: HobbiesData, context: RenderContext): ReactNode {
    const { theme, font, spacing } = context
    const hasContent = data.description || data.hobbies?.length

    if (!hasContent) return null

    return (
      <SectionWrapper theme={theme} spacing={spacing}>
        <SectionTitle theme={theme} spacing={spacing} font={font}>
          兴趣爱好
        </SectionTitle>
        <SectionContent spacing={spacing}>
          {data.description && this.renderRichText(data.description, context)}

          {data.hobbies && data.hobbies.length > 0 && (
            <ContentText $font={font} $spacing={spacing}>
              {data.hobbies.map((hobby, index) => (
                <span key={`hobby-${hobby.name}-${index}`} className={cn('ml-2')}>
                  <Badge variant='outline'>{hobby.name}</Badge>
                </span>
              ))}
            </ContentText>
          )}
        </SectionContent>
      </SectionWrapper>
    )
  }

  renderRichText(html: string | undefined, context: RenderContext): ReactNode {
    if (!html) return null
    return <div className='prose'>{parser(html)}</div>
  }
}

// ============ 样式组件 ============

const ResumeContainer = styled.div`
  max-width: 210mm;
  width: 100%;
  margin: 0 auto;
  background-color: white;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);

  @media (min-width: 768px) {
    padding: 3rem;
  }

  @media print {
    box-shadow: none;
    padding: 0;
  }
`

const ResumeWrapper = styled.div<{
  $theme: any
  $spacing: any
  $font: any
}>`
  padding: ${(props) => props.$spacing.pagePadding};
  font-family: ${(props) => props.$font.fontFamily};
  line-height: ${(props) => props.$spacing.lineHeight};
  color: ${(props) => props.$theme.textPrimary};

  /* 富文本样式 */
  .prose {
    color: ${(props) => props.$theme.textSecondary};
    font-size: ${(props) => props.$font.contentSize};
    line-height: ${(props) => props.$spacing.proseLineHeight};
  }

  .prose h1,
  .prose h2,
  .prose h3 {
    font-weight: ${(props) => props.$font.mediumWeight};
    color: ${(props) => props.$theme.primaryColor};
    margin: 0.5rem 0 0.25rem 0;
  }

  .prose p {
    margin: ${(props) => props.$spacing.paragraphSpacing} 0;
  }

  .prose ul,
  .prose ol {
    margin: ${(props) => props.$spacing.paragraphSpacing} 0;
    padding-left: 1.25rem;
    list-style: outside;
  }

  .prose li {
    list-style: decimal;

    li {
      list-style: disc;
    }
  }

  .prose strong,
  .prose b {
    color: ${(props) => props.$theme.textPrimary};
    font-weight: ${(props) => props.$font.mediumWeight};
  }

  .prose a {
    color: ${(props) => props.$theme.linkColor};
    text-decoration: underline;
    transition: color 0.2s ease;
  }

  .prose a:hover {
    color: ${(props) => props.$theme.linkHoverColor};
  }

  @media print {
    padding: 15mm;

    .prose a {
      color: ${(props) => props.$theme.textPrimary};
      text-decoration: none;
    }
  }
`

const HeaderSection = styled.div<{ $theme: any; $font: any }>`
  margin-bottom: 1.5rem;
  text-align: center;
`

const Name = styled.h1<{ $theme: any; $font: any }>`
  font-size: ${(props) => props.$font.nameSize};
  font-weight: ${(props) => props.$font.boldWeight};
  color: ${(props) => props.$theme.primaryColor};
  margin-bottom: 0.5rem;
`

const JobIntent = styled.p<{ $theme: any; $font: any }>`
  font-size: ${(props) => props.$font.jobIntentSize};
  color: ${(props) => props.$theme.textSecondary};
  margin-bottom: 0.75rem;
`

const InfoRow = styled.div<{ $theme: any; $font: any; $spacing: any }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: ${(props) => props.$font.contentSize};
  color: ${(props) => props.$theme.textSecondary};
  margin-bottom: 0.5rem;
`

const CustomField = styled.div<{ $theme: any; $font: any }>`
  margin-top: 0.25rem;
  font-size: ${(props) => props.$font.contentSize};
  color: ${(props) => props.$theme.textSecondary};
`

const ContentText = styled.div<{ $font: any; $spacing: any }>`
  font-size: ${(props) => props.$font.contentSize};
  line-height: ${(props) => props.$spacing.lineHeight};
  color: #374151;
`

const SkillGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`
