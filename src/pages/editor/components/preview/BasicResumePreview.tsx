import { memo } from 'react'
import useResumeStore from '@/store/resume/form'

function BasicResumePreview() {
  const { name, gender, birthMonth, workYears, phone, email } = useResumeStore(state => state.basics)

  return (
    <div className="flex justify-center order-3 xl:order-2">
      <div className="resume-page relative bg-white shadow-sm border print:shadow-none print:border-0 text-[13px] leading-relaxed font-normal text-slate-800 overflow-hidden w-a4-w h-a4-h">
        <div className="h-full flex flex-col resume-page-padding">
          {/* Header */}
          <header className="pb-4 border-b mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight m-0">{name}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {gender && <span>{gender}</span>}
                  {birthMonth && (
                    <span>
                      出生
                      {birthMonth}
                    </span>
                  )}
                  {workYears && (
                    <span>
                      工作年限
                      {workYears}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right text-xs text-slate-600 space-y-1">
                {phone && (
                  <div>
                    📞
                    {phone}
                  </div>
                )}
                {email && (
                  <div>
                    📧
                    {email}
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>
    </div>
  )
}

export default memo(BasicResumePreview)
