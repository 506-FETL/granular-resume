import { z } from 'zod'

const companyName = z.string().trim()
export type CompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type Position = z.infer<typeof position>

const workDuration = z.array(z.string().trim().optional()).length(2)
export type WorkDuration = z.infer<typeof workDuration>

// 单个工作经历项
const workExperienceItemSchema = z.object({
  companyName: companyName.optional(),
  position: position.optional(),
  workDuration: workDuration.optional(),
  workInfo: z.string().trim().optional(), // 工作经历描述
})
export type WorkExperienceItem = z.infer<typeof workExperienceItemSchema>

// 工作经历列表
const workExperienceListSchema = z.array(workExperienceItemSchema).default([{
  companyName: undefined,
  position: undefined,
  workDuration: [],
  workInfo: undefined,
}])

const workExperienceBaseSchema = z.object({
  items: workExperienceListSchema,
})

export const workExperienceFormSchema = workExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const workExperienceFormSchemaExcludeHidden = workExperienceBaseSchema.partial()

export type WorkExperienceForm = z.infer<typeof workExperienceFormSchema>
export type WorkExperienceFormExcludeHidden = z.infer<typeof workExperienceFormSchemaExcludeHidden>

export const DEFAULT_WORK_EXPERIENCE: WorkExperienceForm = {
  items: [{
    companyName: undefined,
    position: undefined,
    workDuration: [],
    workInfo: undefined,
  }],
  isHidden: false,
}
