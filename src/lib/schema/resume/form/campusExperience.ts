import { z } from 'zod'

const experienceName = z.string().trim().default('')
export type CampusExperienceName = z.infer<typeof experienceName>

const role = z.string().trim().default('')
export type CampusRole = z.infer<typeof role>

const duration = z.array(z.string().trim()).length(2).default(['', ''])
export type CampusDuration = z.infer<typeof duration>

const campusInfo = z.string().trim().default('')
export type CampusInfo = z.infer<typeof campusInfo>

const campusExperienceItemSchema = z.object({
  experienceName,
  role,
  duration,
  campusInfo,
})
export type CampusExperienceItem = z.infer<typeof campusExperienceItemSchema>

// 校园经历列表
const campusExperienceListSchema = z.array(campusExperienceItemSchema)

export const campusExperienceFormSchema = z.object({
  items: campusExperienceListSchema,
})

export type CampusExperienceFormType = z.infer<typeof campusExperienceFormSchema>

export const DEFAULT_CAMPUS_EXPERIENCE: CampusExperienceFormType = {
  items: [
    {
      experienceName: '',
      role: '',
      duration: ['', ''],
      campusInfo: '',
    },
  ],
}
