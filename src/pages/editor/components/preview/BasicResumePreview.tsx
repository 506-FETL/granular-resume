import { Badge } from '@/components/ui/badge'
import useAge from '@/hooks/useAge'
import useResumeStore from '@/store/resume/form'
import parser from 'html-react-parser'
import type { ProficiencyLevel, ORDERType } from '@/lib/schema'
import { defaultFont, defaultSpacing, ResumeWrapper, themes, useResumeContext } from './resume-context'

const skillProficiencyMap: { [key in ProficiencyLevel]: number } = {
  一般: 50,
  良好: 65,
  熟练: 80,
  擅长: 85,
  精通: 95,
}

function formatDuration(duration?: string[]): string | undefined {
  if (!duration?.[0]) return undefined
  return `${duration[0]} - ${duration[1] || '至今'}`
}

// ============ 辅助组件 ============

/**
 * 通用Section组件
 */
function Section({
  title,
  children,
  theme,
  font,
  spacing,
}: {
  title: string
  children: React.ReactNode
  theme: any
  font: any
  spacing: any
}) {
  return (
    <section style={{ marginBottom: spacing.sectionMargin }}>
      <h2
        className='m-0 border-b-2'
        style={{
          fontSize: font.sectionTitleSize,
          fontWeight: font.boldWeight,
          color: theme.primaryColor,
          marginBottom: spacing.sectionTitleMargin,
          paddingBottom: `calc(${spacing.itemSpacing} / 2)`,
          borderColor: theme.primaryColor,
        }}
      >
        {title}
      </h2>
      <div className='flex flex-col' style={{ gap: spacing.itemSpacing }}>
        {children}
      </div>
    </section>
  )
}

/**
 * 通用Entry组件 - 用于教育/工作/实习/项目/校园经历
 */
function Entry({
  title,
  subtitle,
  duration,
  content,
  theme,
  font,
}: {
  title: string
  subtitle?: string
  duration?: string
  content?: string
  theme: any
  font: any
}) {
  return (
    <div>
      <div className='flex justify-between items-start gap-4 mb-2'>
        <div className='flex items-baseline gap-3 flex-1'>
          <h3
            className='m-0'
            style={{
              fontSize: font.contentSize,
              fontWeight: font.boldWeight,
              color: theme.textPrimary,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <span
              style={{
                fontSize: font.contentSize,
                fontWeight: font.mediumWeight,
                color: theme.textSecondary,
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        {duration && (
          <div
            className='whitespace-nowrap'
            style={{
              fontSize: font.smallSize,
              color: theme.textMuted,
            }}
          >
            {duration}
          </div>
        )}
      </div>
      {content && <div className='prose'>{parser(content)}</div>}
    </div>
  )
}

// ============ 模块函数 ============

function BasicsModule({ data, age }: { data: any; age?: string | number }) {
  const { theme, font, spacing } = useResumeContext()
  const { basics, jobIntent } = data

  return (
    <header
      className='flex flex-col items-center'
      style={{
        borderColor: theme.primaryColor,
        marginBottom: spacing.sectionMargin,
        paddingBottom: spacing.itemSpacing,
      }}
    >
      <h1
        className='text-center m-0'
        style={{
          fontSize: font.nameSize,
          fontWeight: font.boldWeight,
          color: theme.primaryColor,
          marginBottom: '0.5em',
        }}
      >
        {basics.name || '姓名'}
      </h1>

      {jobIntent?.jobIntent && !jobIntent.isHidden && (
        <div
          style={{
            fontSize: font.jobIntentSize,
            color: theme.textSecondary,
            marginBottom: '0.5em',
            fontWeight: font.mediumWeight,
          }}
        >
          求职意向：{jobIntent.jobIntent}
          {jobIntent.intentionalCity && ` | ${jobIntent.intentionalCity}`}
          {jobIntent.expectedSalary && ` | ${jobIntent.expectedSalary}K`}
          {jobIntent.dateEntry && jobIntent.dateEntry !== '不填' && ` | ${jobIntent.dateEntry}`}
        </div>
      )}

      <div
        className='flex flex-wrap justify-center'
        style={{
          gap: spacing.itemSpacing,
          fontSize: font.contentSize,
          color: theme.textPrimary,
          marginBottom: `calc(${spacing.itemSpacing} / 2)`,
        }}
      >
        {age && (
          <>
            <span>{age}岁</span>
            {(basics.gender || basics.nation || basics.maritalStatus) && (
              <span style={{ color: theme.textMuted }}>|</span>
            )}
          </>
        )}
        {basics.gender && basics.gender !== '不填' && (
          <>
            <span>{basics.gender}</span>
            {(basics.nation || basics.maritalStatus) && <span style={{ color: theme.textMuted }}>|</span>}
          </>
        )}
        {basics.nation && (
          <>
            <span>{basics.nation}</span>
            {basics.maritalStatus && <span style={{ color: theme.textMuted }}>|</span>}
          </>
        )}
        {basics.maritalStatus && basics.maritalStatus !== '不填' && <span>{basics.maritalStatus}</span>}
      </div>

      <div
        className='flex flex-wrap justify-center'
        style={{
          gap: spacing.itemSpacing,
          fontSize: font.contentSize,
          color: theme.textPrimary,
        }}
      >
        {basics.phone && (
          <>
            <span>{basics.phone}</span>
            {basics.email && <span style={{ color: theme.textMuted }}>|</span>}
          </>
        )}
        {basics.email && <span>{basics.email}</span>}
      </div>

      {basics.customFields
        ?.filter((field: any) => field && field.label && field.value)
        .map((field: any, index: number) => (
          <div
            key={`custom-${index}`}
            style={{
              fontSize: font.contentSize,
              color: theme.textPrimary,
              marginTop: '0.5em',
            }}
          >
            <span style={{ fontWeight: font.mediumWeight }}>{field.label}：</span>
            <span>{field.value}</span>
          </div>
        ))}
    </header>
  )
}

/**
 * 报考信息模块
 */
function ApplicationInfoModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { applicationInfo } = data
  const hasContent = applicationInfo.applicationSchool || applicationInfo.applicationMajor

  if (!hasContent) return null

  return (
    <Section title='报考信息' theme={theme} font={font} spacing={spacing}>
      {applicationInfo.applicationSchool && (
        <div
          style={{
            fontSize: font.contentSize,
            lineHeight: spacing.lineHeight,
          }}
        >
          报考院校：<span style={{ fontWeight: font.mediumWeight }}>{applicationInfo.applicationSchool}</span>
        </div>
      )}
      {applicationInfo.applicationMajor && (
        <div
          style={{
            fontSize: font.contentSize,
            lineHeight: spacing.lineHeight,
          }}
        >
          报考专业：<span style={{ fontWeight: font.mediumWeight }}>{applicationInfo.applicationMajor}</span>
        </div>
      )}
    </Section>
  )
}

/**
 * 教育背景模块
 */
function EduBackgroundModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { eduBackground } = data

  if (!eduBackground.items?.length) return null

  return (
    <Section title='教育背景' theme={theme} font={font} spacing={spacing}>
      {eduBackground.items.map((item: any, index: number) => {
        const subtitle =
          item.degree && item.degree !== '不填' ? `${item.professional}（${item.degree}）` : item.professional
        const duration = formatDuration(item.duration)

        return (
          <Entry
            key={`edu-${index}`}
            title={item.schoolName}
            subtitle={subtitle}
            duration={duration}
            content={item.eduInfo}
            theme={theme}
            font={font}
          />
        )
      })}
    </Section>
  )
}

/**
 * 工作经历模块
 */
function WorkExperienceModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { workExperience } = data

  if (!workExperience.items?.length) return null

  return (
    <Section title='工作经历' theme={theme} font={font} spacing={spacing}>
      {workExperience.items.map((item: any, index: number) => (
        <Entry
          key={`work-${index}`}
          title={item.companyName}
          subtitle={item.position}
          duration={formatDuration(item.workDuration)}
          content={item.workInfo}
          theme={theme}
          font={font}
        />
      ))}
    </Section>
  )
}

/**
 * 实习经验模块
 */
function InternshipExperienceModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { internshipExperience } = data

  if (!internshipExperience.items?.length) return null

  return (
    <Section title='实习经验' theme={theme} font={font} spacing={spacing}>
      {internshipExperience.items.map((item: any, index: number) => (
        <Entry
          key={`intern-${index}`}
          title={item.companyName}
          subtitle={item.position}
          duration={formatDuration(item.internshipDuration)}
          content={item.internshipInfo}
          theme={theme}
          font={font}
        />
      ))}
    </Section>
  )
}

/**
 * 项目经验模块
 */
function ProjectExperienceModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { projectExperience } = data

  if (!projectExperience.items?.length) return null

  return (
    <Section title='项目经验' theme={theme} font={font} spacing={spacing}>
      {projectExperience.items.map((item: any, index: number) => (
        <Entry
          key={`project-${index}`}
          title={item.projectName}
          subtitle={item.participantRole}
          duration={formatDuration(item.projectDuration)}
          content={item.projectInfo}
          theme={theme}
          font={font}
        />
      ))}
    </Section>
  )
}

/**
 * 校园经历模块
 */
function CampusExperienceModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { campusExperience } = data

  if (!campusExperience.items?.length) return null

  return (
    <Section title='校园经历' theme={theme} font={font} spacing={spacing}>
      {campusExperience.items.map((item: any, index: number) => (
        <Entry
          key={`campus-${index}`}
          title={item.experienceName}
          subtitle={item.role}
          duration={formatDuration(item.duration)}
          content={item.campusInfo}
          theme={theme}
          font={font}
        />
      ))}
    </Section>
  )
}

/**
 * 技能特长模块
 */
function SkillSpecialtyModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { skillSpecialty } = data
  const hasContent = skillSpecialty.description || skillSpecialty.skills?.length

  if (!hasContent) return null

  return (
    <Section title='技能特长' theme={theme} font={font} spacing={spacing}>
      {skillSpecialty.description && <div className='prose'>{parser(skillSpecialty.description)}</div>}

      {skillSpecialty.skills && skillSpecialty.skills.length > 0 && (
        <div className='grid gap-4 mt-2' style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {skillSpecialty.skills.map((skill: any, index: number) => {
            const percentage = skillProficiencyMap[skill.proficiencyLevel as keyof typeof skillProficiencyMap] || 50

            return (
              <div key={`skill-${index}`} className='flex flex-col gap-1'>
                {skill.displayType === 'percentage' && (
                  <div className='flex items-center gap-2'>
                    <div
                      className='flex-1 h-2 rounded overflow-hidden'
                      style={{ backgroundColor: theme.progressBarBg }}
                    >
                      <div
                        className='h-full transition-all duration-300'
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: theme.progressBarFill,
                        }}
                      />
                    </div>
                    <span
                      className='min-w-[3em] text-right'
                      style={{
                        fontSize: font.smallSize,
                        color: theme.textMuted,
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>
                )}
                <div
                  style={{
                    fontSize: font.contentSize,
                    color: theme.textPrimary,
                    fontWeight: font.mediumWeight,
                  }}
                >
                  {skill.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

/**
 * 荣誉证书模块
 */
function HonorsCertificatesModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { honorsCertificates } = data
  const hasContent = honorsCertificates.description || honorsCertificates.certificates?.length

  if (!hasContent) return null

  return (
    <Section title='荣誉证书' theme={theme} font={font} spacing={spacing}>
      {honorsCertificates.description && <div className='prose'>{parser(honorsCertificates.description)}</div>}

      {honorsCertificates.certificates && honorsCertificates.certificates.length > 0 && (
        <div style={{ fontSize: font.contentSize, lineHeight: spacing.lineHeight }}>
          {honorsCertificates.certificates.map((cert: any, index: number) => (
            <span key={`cert-${index}`}>
              {index > 0 && '、'}
              {cert.name}
            </span>
          ))}
        </div>
      )}
    </Section>
  )
}

/**
 * 自我评价模块
 */
function SelfEvaluationModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { selfEvaluation } = data

  if (!selfEvaluation.content) return null

  return (
    <Section title='自我评价' theme={theme} font={font} spacing={spacing}>
      <div className='prose'>{parser(selfEvaluation.content)}</div>
    </Section>
  )
}

/**
 * 兴趣爱好模块
 */
function HobbiesModule({ data }: { data: any }) {
  const { theme, font, spacing } = useResumeContext()
  const { hobbies } = data
  const hasContent = hobbies.description || hobbies.hobbies?.length

  if (!hasContent) return null

  return (
    <Section title='兴趣爱好' theme={theme} font={font} spacing={spacing}>
      {hobbies.description && <div className='prose'>{parser(hobbies.description)}</div>}

      {hobbies.hobbies && hobbies.hobbies.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {hobbies.hobbies.map((hobby: any) => (
            <Badge variant='outline' key={hobby.name} style={{ backgroundColor: theme.badgeBg }}>
              {hobby.name}
            </Badge>
          ))}
        </div>
      )}
    </Section>
  )
}

// ============ 主组件 ============

/**
 * 简历预览组件
 */
function BasicResumePreview() {
  const data = useResumeStore()
  const age = useAge(data.basics.birthMonth)

  // ============ 配置主题/间距/字体 ============
  const theme = themes.green // 可选: default, blue, green, purple
  const spacing = { ...defaultSpacing }
  const font = { ...defaultFont }

  /**
   * 渲染单个模块
   */
  const renderModule = (moduleType: ORDERType) => {
    switch (moduleType) {
      case 'basics':
        return <BasicsModule key={moduleType} data={data} age={age} />

      case 'jobIntent':
        // jobIntent 已集成在 BasicsModule 中
        return null

      case 'applicationInfo':
        return data.applicationInfo.isHidden ? null : <ApplicationInfoModule key={moduleType} data={data} />

      case 'eduBackground':
        return data.eduBackground.isHidden ? null : <EduBackgroundModule key={moduleType} data={data} />

      case 'workExperience':
        return data.workExperience.isHidden ? null : <WorkExperienceModule key={moduleType} data={data} />

      case 'internshipExperience':
        return data.internshipExperience.isHidden ? null : <InternshipExperienceModule key={moduleType} data={data} />

      case 'projectExperience':
        return data.projectExperience.isHidden ? null : <ProjectExperienceModule key={moduleType} data={data} />

      case 'campusExperience':
        return data.campusExperience.isHidden ? null : <CampusExperienceModule key={moduleType} data={data} />

      case 'skillSpecialty':
        return data.skillSpecialty.isHidden ? null : <SkillSpecialtyModule key={moduleType} data={data} />

      case 'honorsCertificates':
        return data.honorsCertificates.isHidden ? null : <HonorsCertificatesModule key={moduleType} data={data} />

      case 'selfEvaluation':
        return data.selfEvaluation.isHidden ? null : <SelfEvaluationModule key={moduleType} data={data} />

      case 'hobbies':
        return data.hobbies.isHidden ? null : <HobbiesModule key={moduleType} data={data} />

      default:
        return null
    }
  }

  return (
    <ResumeWrapper theme={theme} spacing={spacing} font={font}>
      <div className='max-w-[210mm] mx-auto p-2 bg-white shadow-lg'>
        <div style={{ padding: spacing.pagePadding }}>{data.order.map((moduleType) => renderModule(moduleType))}</div>
      </div>
    </ResumeWrapper>
  )
}

export default BasicResumePreview
