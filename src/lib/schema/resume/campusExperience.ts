import { z } from 'zod'

const experienceName = z.string().trim().default('')
export type ExperienceName = z.infer<typeof experienceName>

const role = z.string().trim().default('')
export type Role = z.infer<typeof role>

const duration = z.array(z.string().trim()).length(2).default(['', ''])
export type Duration = z.infer<typeof duration>

const campusInfo = z.string().trim().default('')
export type CampusInfo = z.infer<typeof campusInfo>

// 单个校园经历项
const campusExperienceItemSchema = z.object({
  experienceName,
  role,
  duration,
  campusInfo,
})
export type CampusExperienceItem = z.infer<typeof campusExperienceItemSchema>

// 校园经历列表
const campusExperienceListSchema = z.array(campusExperienceItemSchema).default([{
  experienceName: '',
  role: '',
  duration: ['', ''],
  campusInfo: '',
}])

const campusExperienceBaseSchema = z.object({
  items: campusExperienceListSchema,
})

export const campusExperienceFormSchema = campusExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const campusExperienceFormSchemaExcludeHidden = campusExperienceBaseSchema

export type CampusExperienceForm = z.infer<typeof campusExperienceFormSchema>
export type CampusExperienceFormExcludeHidden = z.infer<typeof campusExperienceFormSchemaExcludeHidden>

export const DEFAULT_CAMPUS_EXPERIENCE: CampusExperienceForm = {
  items: [{
    experienceName: '',
    role: '',
    duration: ['', ''],
    campusInfo: '',
  }],
  isHidden: false,
}
