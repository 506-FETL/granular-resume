import { z } from 'zod'

const experienceName = z.string().trim()
export type ExperienceName = z.infer<typeof experienceName>

const role = z.string().trim()
export type Role = z.infer<typeof role>

const duration = z.array(z.string().trim().optional()).length(2)
export type Duration = z.infer<typeof duration>

// 单个校园经历项
const campusExperienceItemSchema = z.object({
  experienceName: experienceName.optional(),
  role: role.optional(),
  duration: duration.optional(),
  campusInfo: z.string().trim().optional(), // 校园经历描述
})
export type CampusExperienceItem = z.infer<typeof campusExperienceItemSchema>

// 校园经历列表
const campusExperienceListSchema = z.array(campusExperienceItemSchema).default([{
  experienceName: undefined,
  role: undefined,
  duration: [],
  campusInfo: undefined,
}])

const campusExperienceBaseSchema = z.object({
  items: campusExperienceListSchema,
})

export const campusExperienceFormSchema = campusExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const campusExperienceFormSchemaExcludeHidden = campusExperienceBaseSchema.partial()

export type CampusExperienceForm = z.infer<typeof campusExperienceFormSchema>
export type CampusExperienceFormExcludeHidden = z.infer<typeof campusExperienceFormSchemaExcludeHidden>

export const DEFAULT_CAMPUS_EXPERIENCE: CampusExperienceForm = {
  items: [{
    experienceName: undefined,
    role: undefined,
    duration: [],
    campusInfo: undefined,
  }],
  isHidden: false,
}
