import { z } from 'zod'

const companyName = z.string().trim()
export type WorkExperienceCompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type WorkExperiencePosition = z.infer<typeof position>

const workDuration = z.array(z.string().trim()).length(2)
export type WorkExperienceDuration = z.infer<typeof workDuration>

const workInfo = z.string().trim()
export type WorkExperienceInfo = z.infer<typeof workInfo>

const workExperienceItemSchema = z.object({
  companyName,
  position,
  workDuration,
  workInfo,
})
export type WorkExperienceItem = z.infer<typeof workExperienceItemSchema>

const workExperienceListSchema = z.array(workExperienceItemSchema)

export const workExperienceFormSchema = z.object({
  items: workExperienceListSchema,
})

export type WorkExperienceFormType = z.infer<typeof workExperienceFormSchema>

export const DEFAULT_WORK_EXPERIENCE: WorkExperienceFormType = {
  items: [
    {
      companyName: '',
      position: '',
      workDuration: ['', ''],
      workInfo: '',
    },
  ],
}
