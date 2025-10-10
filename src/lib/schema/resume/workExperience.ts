import { z } from 'zod'

const companyName = z.string().trim()
export type CompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type Position = z.infer<typeof position>

const workDuration = z.array(z.string().trim().optional()).length(2)
export type WorkDuration = z.infer<typeof workDuration>

const customFieldSchema = z.object({
  content: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof customFieldSchema>

const workInfo = z.array(customFieldSchema).default([])
export type WorkInfo = z.infer<typeof workInfo>

const workExperienceBaseSchema = z.object({
  companyName,
  position,
  workDuration,
  workInfo,
})

export const workExperienceFormSchema = workExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const workExperienceFormSchemaExcludeHidden = workExperienceBaseSchema.partial()

export type WorkExperienceForm = z.infer<typeof workExperienceFormSchema>
export type WorkExperienceFormExcludeHidden = z.infer<typeof workExperienceFormSchemaExcludeHidden>

export const DEFAULT_WORK_EXPERIENCE: WorkExperienceForm = {
  companyName: undefined,
  position: undefined,
  workDuration: [],
  workInfo: [],
  isHidden: false,
}
