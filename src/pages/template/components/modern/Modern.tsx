import type React from 'react'
import type { ResumeContextType, ResumeFont, ResumeSpacing, ResumeTheme } from '../resume-context'
import type { ORDERType, ProficiencyLevel, ResumeSchema } from '@/lib/schema'
import parser from 'html-react-parser'
import { Calendar, DollarSign, Mail, MapPin, Phone, Target } from 'lucide-react'
import { createContext, use, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import useAge from '@/hooks/useAge'
import useResumeStore from '@/store/resume/form'
import './modern.css'

// 创建简历上下文
const ResumeContext = createContext<ResumeContextType | null>(null)

function useResumeContext() {
  const context = use(ResumeContext)
  if (!context) {
    throw new Error('useResumeContext 必须在 ResumeProvider 内部使用')
  }
  return context
}

interface ResumeProviderProps {
  theme: ResumeTheme
  spacing: ResumeSpacing
  font: ResumeFont
  children: React.ReactNode
}

function ResumeProvider({ children, theme, spacing, font }: ResumeProviderProps) {
  const contextValue = useMemo(() => ({ theme, spacing, font }), [theme, spacing, font])

  return (
    <ResumeContext value={contextValue}>
      {children}
    </ResumeContext>
  )
}

const skillProficiencyMap: Record<ProficiencyLevel, number> = {
  一般: 50,
  良好: 65,
  熟练: 80,
  擅长: 85,
  精通: 95,
}

function formatDuration(duration?: string[]): string | undefined {
  return duration?.[0] ? `${duration[0]} - ${duration[1] || '至今'}` : undefined
}

function Section({ title, children, icon }: { title: string, children: React.ReactNode, icon?: React.ReactNode }) {
  const { theme, font, spacing } = useResumeContext()
  return (
    <section className="modern-section" style={{ marginBottom: spacing.sectionMargin }}>
      <div className="modern-section-header" style={{ marginBottom: spacing.sectionTitleMargin }}>
        <div className="modern-section-title-wrapper">
          {icon && <span className="modern-section-icon" style={{ color: theme.primaryColor }}>{icon}</span>}
          <h2
            className="modern-section-title"
            style={{
              fontSize: font.sectionTitleSize,
              fontWeight: font.boldWeight,
              color: theme.primaryColor,
            }}
          >
            {title}
          </h2>
        </div>
        <div className="modern-section-line" style={{ backgroundColor: theme.primaryColor }} />
      </div>
      <div className="modern-section-content" style={{ gap: spacing.itemSpacing }}>
        {children}
      </div>
    </section>
  )
}

function Entry({ title, subtitle, duration, content }: {
  title: string
  subtitle?: string
  duration?: string
  content?: string
}) {
  const { theme, font, spacing } = useResumeContext()
  return (
    <div className="modern-entry" style={{ padding: spacing.itemSpacing }}>
      <div className="modern-entry-header">
        <div className="modern-entry-left">
          <h3
            className="modern-entry-title"
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
              className="modern-entry-subtitle"
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
          <div className="modern-entry-duration" style={{ fontSize: font.smallSize, color: theme.textMuted }}>
            <Calendar size={14} className="inline mr-1" />
            {duration}
          </div>
        )}
      </div>
      {content && (
        <div className="modern-entry-content prose" style={{ marginTop: `calc(${spacing.itemSpacing} / 2)` }}>
          {parser(content)}
        </div>
      )}
    </div>
  )
}

function BasicsModule({ data, age }: { data: ResumeSchema, age?: string | number }) {
  const { theme, font, spacing } = useResumeContext()
  const { basics, jobIntent } = data
  const infoFields = [
    age && `${age}岁`,
    basics.gender !== '不填' && basics.gender,
    basics.nation,
    basics.heightCm && `${basics.heightCm}cm`,
    basics.weightKg && `${basics.weightKg}kg`,
    basics.maritalStatus !== '不填' && basics.maritalStatus,
  ].filter(Boolean)

  return (
    <header
      className="modern-header"
      style={{
        marginBottom: spacing.sectionMargin,
        paddingBottom: spacing.itemSpacing,
      }}
    >
      <div className="modern-header-bg" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}15 0%, ${theme.primaryColor}05 100%)` }}>
        <div className="modern-header-content">
          <h1
            className="modern-name"
            style={{
              fontSize: font.nameSize,
              fontWeight: font.boldWeight,
              color: theme.primaryColor,
            }}
          >
            {basics.name || '姓名'}
          </h1>

          {jobIntent && (
            <div className="modern-job-intent" style={{ fontSize: font.jobIntentSize, fontWeight: font.mediumWeight }}>
              <div className="modern-intent-item" style={{ color: theme.textPrimary }}>
                <Target size={16} className="inline mr-1" style={{ color: theme.primaryColor }} />
                {jobIntent.jobIntent}
              </div>
              {jobIntent.intentionalCity && (
                <div className="modern-intent-item" style={{ color: theme.textSecondary }}>
                  <MapPin size={16} className="inline mr-1" style={{ color: theme.primaryColor }} />
                  {jobIntent.intentionalCity}
                </div>
              )}
              {jobIntent.expectedSalary && (
                <div className="modern-intent-item" style={{ color: theme.textSecondary }}>
                  <DollarSign size={16} className="inline mr-1" style={{ color: theme.primaryColor }} />
                  {jobIntent.expectedSalary}
                  K
                </div>
              )}
              {jobIntent.dateEntry && jobIntent.dateEntry !== '不填' && (
                <div className="modern-intent-item" style={{ color: theme.textSecondary }}>
                  <Calendar size={16} className="inline mr-1" style={{ color: theme.primaryColor }} />
                  {jobIntent.dateEntry}
                </div>
              )}
            </div>
          )}

          {infoFields.length > 0 && (
            <div
              className="modern-info-fields"
              style={{
                gap: spacing.itemSpacing,
                fontSize: font.contentSize,
                color: theme.textPrimary,
              }}
            >
              {infoFields.map((field, i) => (
                <span key={i} className="modern-info-item">
                  {field}
                </span>
              ))}
            </div>
          )}

          <div className="modern-contact" style={{ fontSize: font.contentSize }}>
            {basics.phone && (
              <div className="modern-contact-item" style={{ color: theme.textPrimary }}>
                <Phone size={16} style={{ color: theme.primaryColor }} />
                <span>{basics.phone}</span>
              </div>
            )}
            {basics.email && (
              <div className="modern-contact-item" style={{ color: theme.textPrimary }}>
                <Mail size={16} style={{ color: theme.primaryColor }} />
                <span>{basics.email}</span>
              </div>
            )}
          </div>

          {basics.customFields?.filter(f => f?.label && f?.value).map((field, i) => (
            field && (
              <div
                key={`custom-field-${i}`}
                className="modern-custom-field"
                style={{
                  fontSize: font.contentSize,
                  color: theme.textPrimary,
                }}
              >
                <span style={{ fontWeight: font.mediumWeight, color: theme.primaryColor }}>
                  {field.label}
                  ：
                </span>
                <span>{field.value}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </header>
  )
}

function ApplicationInfoModule() {
  const { theme, font, spacing } = useResumeContext()
  const { applicationInfo } = useResumeStore()

  return (
    <Section title="报考信息" icon={<Target size={20} />}>
      <div className="modern-card" style={{ padding: spacing.itemSpacing }}>
        {applicationInfo.applicationSchool && (
          <div className="modern-info-row" style={{ fontSize: font.contentSize, lineHeight: spacing.lineHeight }}>
            <span className="modern-info-label" style={{ color: theme.textSecondary }}>报考院校：</span>
            <span style={{ fontWeight: font.mediumWeight, color: theme.textPrimary }}>{applicationInfo.applicationSchool}</span>
          </div>
        )}
        {applicationInfo.applicationMajor && (
          <div className="modern-info-row" style={{ fontSize: font.contentSize, lineHeight: spacing.lineHeight }}>
            <span className="modern-info-label" style={{ color: theme.textSecondary }}>报考专业：</span>
            <span style={{ fontWeight: font.mediumWeight, color: theme.textPrimary }}>{applicationInfo.applicationMajor}</span>
          </div>
        )}
      </div>
    </Section>
  )
}

function EduBackgroundModule() {
  const { eduBackground } = useResumeStore()
  return (
    <Section title="教育背景" icon={<span className="modern-icon-emoji">🎓</span>}>
      {eduBackground.items.map((item, i) => (
        <Entry
          key={`edu-${item.schoolName}-${i}`}
          title={item.schoolName}
          subtitle={item.degree !== '不填' ? `${item.professional}（${item.degree}）` : item.professional}
          duration={formatDuration(item.duration)}
          content={item.eduInfo}
        />
      ))}
    </Section>
  )
}

function WorkExperienceModule() {
  const { workExperience } = useResumeStore()
  return (
    <Section title="工作经历" icon={<span className="modern-icon-emoji">💼</span>}>
      {workExperience.items.map((item, i) => (
        <Entry
          key={`work-${item.companyName}-${i}`}
          title={item.companyName}
          subtitle={item.position}
          duration={formatDuration(item.workDuration)}
          content={item.workInfo}
        />
      ))}
    </Section>
  )
}

function InternshipExperienceModule() {
  const { internshipExperience } = useResumeStore()
  return (
    <Section title="实习经验" icon={<span className="modern-icon-emoji">🚀</span>}>
      {internshipExperience.items.map((item, i) => (
        <Entry
          key={`intern-${item.companyName}-${i}`}
          title={item.companyName}
          subtitle={item.position}
          duration={formatDuration(item.internshipDuration)}
          content={item.internshipInfo}
        />
      ))}
    </Section>
  )
}

function ProjectExperienceModule() {
  const { projectExperience } = useResumeStore()
  return (
    <Section title="项目经验" icon={<span className="modern-icon-emoji">⚡</span>}>
      {projectExperience.items.map((item, i) => (
        <Entry
          key={`project-${item.projectName}-${i}`}
          title={item.projectName}
          subtitle={item.participantRole}
          duration={formatDuration(item.projectDuration)}
          content={item.projectInfo}
        />
      ))}
    </Section>
  )
}

function CampusExperienceModule() {
  const { campusExperience } = useResumeStore()
  return (
    <Section title="校园经历" icon={<span className="modern-icon-emoji">🏫</span>}>
      {campusExperience.items.map((item, i) => (
        <Entry
          key={`campus-${item.experienceName}-${i}`}
          title={item.experienceName}
          subtitle={item.role}
          duration={formatDuration(item.duration)}
          content={item.campusInfo}
        />
      ))}
    </Section>
  )
}

function SkillSpecialtyModule() {
  const { theme, font, spacing } = useResumeContext()
  const { skillSpecialty } = useResumeStore()

  return (
    <Section title="技能特长" icon={<span className="modern-icon-emoji">💪</span>}>
      {skillSpecialty.description && (
        <div className="modern-card prose" style={{ padding: spacing.itemSpacing }}>
          {parser(skillSpecialty.description)}
        </div>
      )}
      {skillSpecialty.skills?.length > 0 && (
        <div className="modern-skills-grid">
          {skillSpecialty.skills.map((skill, i) => {
            const percentage = skillProficiencyMap[skill.proficiencyLevel] || 50
            return (
              <div key={`skill-${skill.label}-${i}`} className="modern-skill-card">
                <div className="modern-skill-header">
                  <span style={{ fontSize: font.contentSize, color: theme.textPrimary, fontWeight: font.mediumWeight }}>
                    {skill.label}
                  </span>
                  <span style={{ fontSize: font.smallSize, color: theme.textMuted, fontWeight: font.boldWeight }}>
                    {percentage}
                    %
                  </span>
                </div>
                {skill.displayType === 'percentage' && (
                  <div className="modern-progress-bar" style={{ backgroundColor: theme.progressBarBg }}>
                    <div
                      className="modern-progress-fill"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${theme.progressBarFill} 0%, ${theme.primaryColor} 100%)`,
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

function HonorsCertificatesModule() {
  const { theme, font, spacing } = useResumeContext()
  const { honorsCertificates } = useResumeStore()

  return (
    <Section title="荣誉证书" icon={<span className="modern-icon-emoji">🏆</span>}>
      {honorsCertificates.description && (
        <div className="modern-card prose" style={{ padding: spacing.itemSpacing }}>
          {parser(honorsCertificates.description)}
        </div>
      )}
      {honorsCertificates.certificates?.length > 0 && (
        <div className="modern-certificates-grid">
          {honorsCertificates.certificates.map((cert, i) => (
            <div
              key={`cert-${cert.name}-${i}`}
              className="modern-certificate-badge"
              style={{
                fontSize: font.contentSize,
                backgroundColor: `${theme.primaryColor}10`,
                color: theme.textPrimary,
                borderColor: `${theme.primaryColor}30`,
              }}
            >
              <span className="modern-certificate-icon">✓</span>
              {cert.name}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function SelfEvaluationModule() {
  const { spacing } = useResumeContext()
  const { selfEvaluation } = useResumeStore()
  return (
    <Section title="自我评价" icon={<span className="modern-icon-emoji">✨</span>}>
      <div className="modern-card prose" style={{ padding: spacing.itemSpacing }}>
        {parser(selfEvaluation.content)}
      </div>
    </Section>
  )
}

function HobbiesModule() {
  const { theme } = useResumeContext()
  const { hobbies } = useResumeStore()

  return (
    <Section title="兴趣爱好" icon={<span className="modern-icon-emoji">🎨</span>}>
      {hobbies.description && (
        <div className="modern-card prose" style={{ padding: '1rem' }}>
          {parser(hobbies.description)}
        </div>
      )}
      {hobbies.hobbies?.length > 0 && (
        <div className="modern-hobbies-grid">
          {hobbies.hobbies.map((hobby, i) => (
            <Badge
              variant="outline"
              key={`hobby-${hobby.name}-${i}`}
              className="modern-hobby-badge"
              style={{
                backgroundColor: `${theme.primaryColor}08`,
                borderColor: `${theme.primaryColor}40`,
                color: theme.textPrimary,
              }}
            >
              {hobby.name}
            </Badge>
          ))}
        </div>
      )}
    </Section>
  )
}

const MODULE_COMPONENTS: Record<ORDERType, React.ComponentType<any>> = {
  basics: BasicsModule,
  applicationInfo: ApplicationInfoModule,
  eduBackground: EduBackgroundModule,
  workExperience: WorkExperienceModule,
  internshipExperience: InternshipExperienceModule,
  projectExperience: ProjectExperienceModule,
  campusExperience: CampusExperienceModule,
  skillSpecialty: SkillSpecialtyModule,
  honorsCertificates: HonorsCertificatesModule,
  selfEvaluation: SelfEvaluationModule,
  hobbies: HobbiesModule,
  jobIntent: () => null,
} as const

interface ModernResumeContentProps {
  theme: ResumeTheme
  spacing: ResumeSpacing
  font: ResumeFont
}

export default function ModernResume({ theme, spacing, font }: ModernResumeContentProps) {
  const data = useResumeStore()
  const getVisibility = useResumeStore(state => state.getVisibility)
  const age = useAge(data.basics.birthMonth)

  return (
    <ResumeProvider theme={theme} spacing={spacing} font={font}>
      <div className="modern-resume" style={{ fontFamily: font.fontFamily }}>
        {data.order.map((moduleType: ORDERType) => {
          const Component = MODULE_COMPONENTS[moduleType]
          if (!Component || (moduleType !== 'basics' && getVisibility(moduleType)))
            return null

          if (moduleType === 'basics') {
            return <BasicsModule key={moduleType} data={data} age={age} />
          }

          return <Component key={moduleType} />
        })}
      </div>
    </ResumeProvider>
  )
}
