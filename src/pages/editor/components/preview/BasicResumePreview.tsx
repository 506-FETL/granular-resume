import { memo } from 'react'
import getAge from '@/hooks/useAge'
import useResumeStore from '@/store/resume/form'

function BasicResumePreview() {
  const {
    name,
    gender,
    birthMonth,
    workYears,
    phone,
    email,
    politicalStatus,
    customFields,
    heightCm,
    maritalStatus,
    nation,
    nativePlace,
    weightKg,
  } = useResumeStore(state => state.basics)

  const jobIntent = useResumeStore(state => state.jobIntent)
  const applicationInfo = useResumeStore(state => state.applicationInfo)

  return (
    <div className="flex justify-center order-3 xl:order-2">
      <div className="resume-page relative bg-white shadow-sm border print:shadow-none print:border-0 text-[13px] leading-relaxed font-normal text-slate-800 overflow-hidden w-a4-w h-a4-h">
        <div className="h-full flex flex-col resume-page-padding">
          {/* 头部信息 */}
          <header className="pb-4 border-b mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight m-0">{name || 'Granular Resume'}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {gender && <span>{gender}</span>}
                  {birthMonth && (
                    <span>
                      {getAge(birthMonth)}
                      岁
                    </span>
                  )}
                  {workYears && workYears !== '不填' && (
                    <span>
                      工作年限
                      {workYears}
                    </span>
                  )}
                  {maritalStatus && maritalStatus !== '不填' && <span>{maritalStatus}</span>}
                  {heightCm && weightKg && (
                    <span>
                      {heightCm}
                      cm /
                      {' '}
                      {weightKg}
                      kg
                    </span>
                  )}
                  {nation && (
                    <span>
                      {nation}
                      族
                    </span>
                  )}
                  {nativePlace && (
                    <span>
                      籍贯:
                      {nativePlace}
                    </span>
                  )}
                  {politicalStatus && politicalStatus !== '不填' && <span>{politicalStatus}</span>}
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-1">
                {phone && (
                  <div>
                    📞
                    {' '}
                    {phone}
                  </div>
                )}
                {email && (
                  <div>
                    📧
                    {' '}
                    {email}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* 求职意向 */}
          {!jobIntent.isHidden && (jobIntent.jobIntent || jobIntent.intentionalCity || jobIntent.expectedSalary || jobIntent.dateEntry) && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-slate-800 border-b border-slate-200 pb-1">
                求职意向
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {jobIntent.jobIntent && (
                  <div>
                    <span className="font-medium text-slate-600">期望岗位：</span>
                    <span>{jobIntent.jobIntent}</span>
                  </div>
                )}
                {jobIntent.intentionalCity && (
                  <div>
                    <span className="font-medium text-slate-600">意向城市：</span>
                    <span>{jobIntent.intentionalCity}</span>
                  </div>
                )}
                {jobIntent.expectedSalary && (
                  <div>
                    <span className="font-medium text-slate-600">期望薪资：</span>
                    <span>
                      {jobIntent.expectedSalary}
                      K/月
                    </span>
                  </div>
                )}
                {jobIntent.dateEntry && jobIntent.dateEntry !== '不填' && (
                  <div>
                    <span className="font-medium text-slate-600">到岗时间：</span>
                    <span>{jobIntent.dateEntry}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 报考信息 */}
          {!applicationInfo.isHidden && (applicationInfo.applicationSchool || applicationInfo.applicationMajor) && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-slate-800 border-b border-slate-200 pb-1">
                报考信息
              </h2>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {applicationInfo.applicationSchool && (
                  <div>
                    <span className="font-medium text-slate-600">报考院校：</span>
                    <span>{applicationInfo.applicationSchool}</span>
                  </div>
                )}
                {applicationInfo.applicationMajor && (
                  <div>
                    <span className="font-medium text-slate-600">报考专业：</span>
                    <span>{applicationInfo.applicationMajor}</span>
                  </div>
                )}
              </div>
            </section>
          )}
          {customFields && customFields.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-slate-800 border-b border-slate-200 pb-1">
                其他信息
              </h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {customFields.map(field => (
                  field && field.label && field.value && (
                    <div key={field.label}>
                      <span className="font-medium text-slate-600">
                        {field.label}
                        ：
                      </span>
                      <span>{field.value}</span>
                    </div>
                  )
                ))}
              </div>
            </section>
          )}
          {/* 占位内容区域 - 可以后续添加工作经历、教育经历等 */}
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            <div className="text-center">
              <p>更多简历内容区域</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BasicResumePreview)
