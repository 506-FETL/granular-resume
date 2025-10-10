import { z } from 'zod'

const experienceName = z.string().trim()
export type ExperienceName = z.infer<typeof experienceName>

const role = z.string().trim()
export type Role = z.infer<typeof role>

const duration = z.array(z.string().trim().optional()).length(2)
export type Duration = z.infer<typeof duration>

const customFieldSchema = z.object({
  content: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof customFieldSchema>

const campusInfo = z.array(customFieldSchema).default([])
export type CampusInfo = z.infer<typeof campusInfo>

const campusExperienceBaseSchema = z.object({
  experienceName,
  role,
  duration,
  campusInfo,
})

export const campusExperienceFormSchema = campusExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const campusExperienceFormSchemaExcludeHidden = campusExperienceBaseSchema.partial()

export type CampusExperienceForm = z.infer<typeof campusExperienceFormSchema>
export type CampusExperienceFormExcludeHidden = z.infer<typeof campusExperienceFormSchemaExcludeHidden>

export const DEFAULT_CAMPUS_EXPERIENCE: CampusExperienceForm = {
  experienceName: undefined,
  role: undefined,
  duration: [],
  campusInfo: [],
  isHidden: false,
}
