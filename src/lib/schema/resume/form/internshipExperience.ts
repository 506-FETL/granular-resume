import { z } from 'zod'

const companyName = z.string().trim()
export type InternshipCompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type InternshipPosition = z.infer<typeof position>

const internshipDuration = z.array(z.string().trim()).length(2)
export type InternshipDuration = z.infer<typeof internshipDuration>

const internshipInfo = z.string().trim()
export type InternshipInfo = z.infer<typeof internshipInfo>

const internshipExperienceItemSchema = z.object({
  companyName,
  position,
  internshipDuration,
  internshipInfo,
})
export type InternshipExperienceItem = z.infer<typeof internshipExperienceItemSchema>

const internshipExperienceListSchema = z.array(internshipExperienceItemSchema)

export const internshipExperienceFormSchema = z.object({
  items: internshipExperienceListSchema,
})

export type InternshipExperienceFormType = z.infer<typeof internshipExperienceFormSchema>

export const DEFAULT_INTERNSHIP_EXPERIENCE: InternshipExperienceFormType = {
  items: [
    {
      companyName: '',
      position: '',
      internshipDuration: ['', ''],
      internshipInfo: '',
    },
  ],
}
