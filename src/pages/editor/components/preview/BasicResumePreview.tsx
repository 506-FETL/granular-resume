import type { ReactNode } from 'react'
import parse from 'html-react-parser'
import { memo } from 'react'
import getAge from '@/hooks/useAge'
import { PROFICIENCY_PERCENTAGE_MAP } from '@/lib/schema/resume/skillSpecialty'
import useResumeStore from '@/store/resume/form'

// 渲染章节标题 - 更专业的样式
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-base font-bold text-slate-900 whitespace-nowrap">
        {children}
      </h2>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-400 to-transparent" />
    </div>
  )
}

function BasicResumePreview() {
  const basics = useResumeStore(state => state.basics)
  const jobIntent = useResumeStore(state => state.jobIntent)
  const applicationInfo = useResumeStore(state => state.applicationInfo)
  const eduBackground = useResumeStore(state => state.eduBackground)
  const workExperience = useResumeStore(state => state.workExperience)
  const internshipExperience = useResumeStore(state => state.internshipExperience)
  const campusExperience = useResumeStore(state => state.campusExperience)
  const projectExperience = useResumeStore(state => state.projectExperience)
  const skillSpecialty = useResumeStore(state => state.skillSpecialty)
  const honorsCertificates = useResumeStore(state => state.honorsCertificates)
  const selfEvaluation = useResumeStore(state => state.selfEvaluation)
  const hobbies = useResumeStore(state => state.hobbies)
  const order = useResumeStore(state => state.order)

  // 渲染模块内容
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'basics':
        return null // 基本信息在 header 中显示

      case 'jobIntent':
        if (jobIntent.isHidden)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>求职意向</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {jobIntent.jobIntent && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">期望职位</span>
                  <span className="text-slate-900 font-medium">{jobIntent.jobIntent}</span>
                </div>
              )}
              {jobIntent.intentionalCity && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">期望城市</span>
                  <span className="text-slate-900 font-medium">{jobIntent.intentionalCity}</span>
                </div>
              )}
              {jobIntent.expectedSalary > 0 && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">期望薪资</span>
                  <span className="text-slate-900 font-medium">
                    {jobIntent.expectedSalary}
                    k
                  </span>
                </div>
              )}
              {jobIntent.dateEntry && jobIntent.dateEntry !== '不填' && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">到岗时间</span>
                  <span className="text-slate-900 font-medium">{jobIntent.dateEntry}</span>
                </div>
              )}
            </div>
          </section>
        )

      case 'applicationInfo':
        if (applicationInfo.isHidden)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>报考信息</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {applicationInfo.applicationSchool && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">报考学校</span>
                  <span className="text-slate-900 font-medium">{applicationInfo.applicationSchool}</span>
                </div>
              )}
              {applicationInfo.applicationMajor && (
                <div className="flex items-baseline">
                  <span className="text-slate-500 min-w-[70px]">报考专业</span>
                  <span className="text-slate-900 font-medium">{applicationInfo.applicationMajor}</span>
                </div>
              )}
            </div>
          </section>
        )

      case 'eduBackground':
        if (eduBackground.isHidden || eduBackground.items.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>教育背景</SectionTitle>
            <div className="space-y-3">
              {eduBackground.items.map((edu, index) => (
                <div key={`edu-${index}`} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {edu.schoolName}
                        {edu.professional && (
                          <span className="ml-2 text-slate-600 font-normal">
                            {edu.professional}
                          </span>
                        )}
                      </h3>
                      {edu.degree && edu.degree !== '不填' && (
                        <div className="text-xs text-slate-500 mt-0.5">{edu.degree}</div>
                      )}
                    </div>
                    {edu.duration && edu.duration.length === 2 && (edu.duration[0] || edu.duration[1]) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {edu.duration[0]}
                        {' - '}
                        {edu.duration[1]}
                      </div>
                    )}
                  </div>
                  {edu.eduInfo && (
                    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                      {parse(edu.eduInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'workExperience':
        if (workExperience.isHidden || workExperience.items.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>工作经历</SectionTitle>
            <div className="space-y-3">
              {workExperience.items.map((work, index) => (
                <div key={`work-${index}`} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {work.companyName}
                        {work.position && (
                          <span className="ml-2 text-slate-600 font-normal">
                            {work.position}
                          </span>
                        )}
                      </h3>
                    </div>
                    {work.workDuration && work.workDuration.length === 2 && (work.workDuration[0] || work.workDuration[1]) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {work.workDuration[0]}
                        {' - '}
                        {work.workDuration[1]}
                      </div>
                    )}
                  </div>
                  {work.workInfo && (
                    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                      {parse(work.workInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'internshipExperience':
        if (internshipExperience.isHidden || internshipExperience.items.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>实习经验</SectionTitle>
            <div className="space-y-3">
              {internshipExperience.items.map((intern, index) => (
                <div key={`intern-${index}`} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {intern.companyName}
                        {intern.position && (
                          <span className="ml-2 text-slate-600 font-normal">
                            {intern.position}
                          </span>
                        )}
                      </h3>
                    </div>
                    {intern.internshipDuration && intern.internshipDuration.length === 2 && (intern.internshipDuration[0] || intern.internshipDuration[1]) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {intern.internshipDuration[0]}
                        {' - '}
                        {intern.internshipDuration[1]}
                      </div>
                    )}
                  </div>
                  {intern.internshipInfo && (
                    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                      {parse(intern.internshipInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'campusExperience':
        if (campusExperience.isHidden || campusExperience.items.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>校园经历</SectionTitle>
            <div className="space-y-3">
              {campusExperience.items.map((campus, index) => (
                <div key={`campus-${index}`} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {campus.experienceName}
                        {campus.role && (
                          <span className="ml-2 text-slate-600 font-normal">
                            {campus.role}
                          </span>
                        )}
                      </h3>
                    </div>
                    {campus.duration && campus.duration.length === 2 && (campus.duration[0] || campus.duration[1]) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {campus.duration[0]}
                        {' - '}
                        {campus.duration[1]}
                      </div>
                    )}
                  </div>
                  {campus.campusInfo && (
                    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                      {parse(campus.campusInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'projectExperience':
        if (projectExperience.isHidden || projectExperience.items.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>项目经验</SectionTitle>
            <div className="space-y-3">
              {projectExperience.items.map((project, index) => (
                <div key={`project-${index}`} className="relative pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {project.projectName}
                        {project.participantRole && (
                          <span className="ml-2 text-slate-600 font-normal">
                            {project.participantRole}
                          </span>
                        )}
                      </h3>
                    </div>
                    {project.projectDuration && project.projectDuration.length === 2 && (project.projectDuration[0] || project.projectDuration[1]) && (
                      <div className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {project.projectDuration[0]}
                        {' - '}
                        {project.projectDuration[1]}
                      </div>
                    )}
                  </div>
                  {project.projectInfo && (
                    <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                      {parse(project.projectInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'skillSpecialty':
        if (skillSpecialty.isHidden || skillSpecialty.skills.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>技能特长</SectionTitle>
            {skillSpecialty.description && (
              <div className="mb-3 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                {parse(skillSpecialty.description)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {skillSpecialty.skills.map((skill, index) => (
                <div key={`skill-${index}`} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-900 text-sm">{skill.label}</span>
                    {skill.displayType === 'percentage'
                      ? (
                          <span className="text-xs text-slate-500">
                            {PROFICIENCY_PERCENTAGE_MAP[skill.proficiencyLevel]}
                            %
                          </span>
                        )
                      : (
                          <span className="text-xs text-slate-500">{skill.proficiencyLevel}</span>
                        )}
                  </div>
                  {skill.displayType === 'percentage' && (
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${PROFICIENCY_PERCENTAGE_MAP[skill.proficiencyLevel]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )

      case 'honorsCertificates':
        if (honorsCertificates.isHidden || honorsCertificates.certificates.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>荣誉证书</SectionTitle>
            {honorsCertificates.description && (
              <div className="mb-3 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                {parse(honorsCertificates.description)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {honorsCertificates.certificates.map((cert, index) => (
                <span
                  key={`cert-${index}`}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200"
                >
                  {cert.name}
                </span>
              ))}
            </div>
          </section>
        )

      case 'selfEvaluation':
        if (selfEvaluation.isHidden || !selfEvaluation.content)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>自我评价</SectionTitle>
            <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
              {parse(selfEvaluation.content)}
            </div>
          </section>
        )

      case 'hobbies':
        if (hobbies.isHidden || hobbies.hobbies.length === 0)
          return null
        return (
          <section className="mb-6">
            <SectionTitle>兴趣爱好</SectionTitle>
            {hobbies.description && (
              <div className="mb-3 text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none [&>ul]:my-1 [&>ol]:my-1 [&>p]:my-1">
                {parse(hobbies.description)}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {hobbies.hobbies.map((hobby, index) => (
                <span
                  key={`hobby-${index}`}
                  className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200"
                >
                  {hobby.name}
                </span>
              ))}
            </div>
          </section>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex justify-center order-3 xl:order-2">
      <div className="resume-page relative bg-white shadow-sm border print:shadow-none print:border-0 text-[13px] leading-relaxed font-normal text-slate-800 overflow-hidden w-a4-w h-a4-h">
        <div className="h-full flex flex-col resume-page-padding overflow-y-auto">
          {/* 头部基本信息 */}
          <header className="pb-4 border-b-2 border-slate-300 mb-6 flex-shrink-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight m-0 text-slate-900">
                  {basics.name || 'Granular Resume'}
                </h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {basics.gender && basics.gender !== '不填' && <span>{basics.gender}</span>}
                  {basics.birthMonth && (
                    <span>
                      {getAge(basics.birthMonth)}
                      岁
                    </span>
                  )}
                  {basics.workYears && basics.workYears !== '不填' && (
                    <span>
                      {basics.workYears}
                      工作经验
                    </span>
                  )}
                  {basics.politicalStatus && basics.politicalStatus !== '不填' && (
                    <span>{basics.politicalStatus}</span>
                  )}
                  {basics.nation && basics.nation !== '不填' && <span>{basics.nation}</span>}
                  {basics.maritalStatus && basics.maritalStatus !== '不填' && (
                    <span>{basics.maritalStatus}</span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-1 flex-shrink-0">
                {basics.phone && (
                  <div className="flex items-center justify-end gap-1">
                    <span>📞</span>
                    <span>{basics.phone}</span>
                  </div>
                )}
                {basics.email && (
                  <div className="flex items-center justify-end gap-1">
                    <span>📧</span>
                    <span>{basics.email}</span>
                  </div>
                )}
                {basics.nativePlace && (
                  <div className="flex items-center justify-end gap-1">
                    <span>🏠</span>
                    <span>{basics.nativePlace}</span>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* 主体内容 */}
          <div className="flex-1 overflow-y-auto">
            {order.map(sectionId => (
              <div key={sectionId}>{renderSection(sectionId)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BasicResumePreview)
