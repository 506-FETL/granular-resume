import { z } from 'zod'

const companyName = z.string().trim().default('')
export type CompanyName = z.infer<typeof companyName>

const position = z.string().trim().default('')
export type Position = z.infer<typeof position>

const workDuration = z.array(z.string().trim()).length(2).default(['', ''])
export type WorkDuration = z.infer<typeof workDuration>

const workInfo = z.string().trim().default('')
export type WorkInfo = z.infer<typeof workInfo>

// 单个工作经历项
const workExperienceItemSchema = z.object({
  companyName,
  position,
  workDuration,
  workInfo,
})
export type WorkExperienceItem = z.infer<typeof workExperienceItemSchema>

// 工作经历列表
const workExperienceListSchema = z.array(workExperienceItemSchema).default([{
  companyName: '',
  position: '',
  workDuration: ['', ''],
  workInfo: '',
}])

const workExperienceBaseSchema = z.object({
  items: workExperienceListSchema,
})

export const workExperienceFormSchema = workExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const workExperienceFormSchemaExcludeHidden = workExperienceBaseSchema

export type WorkExperienceForm = z.infer<typeof workExperienceFormSchema>
export type WorkExperienceFormExcludeHidden = z.infer<typeof workExperienceFormSchemaExcludeHidden>

export const DEFAULT_WORK_EXPERIENCE: WorkExperienceForm = {
  items: [{
    companyName: '',
    position: '',
    workDuration: ['', ''],
    workInfo: '',
  }],
  isHidden: false,
}
