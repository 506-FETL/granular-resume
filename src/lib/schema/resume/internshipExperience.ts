import { z } from 'zod'

const companyName = z.string().trim()
export type CompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type Position = z.infer<typeof position>

const internshipDuration = z.array(z.string().trim().optional()).length(2)
export type InternshipDuration = z.infer<typeof internshipDuration>

const customFieldSchema = z.object({
  content: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof customFieldSchema>

const internshipInfo = z.array(customFieldSchema).default([])
export type InternshipInfo = z.infer<typeof internshipInfo>

const internshipExperienceBaseSchema = z.object({
  companyName,
  position,
  internshipDuration,
  internshipInfo,
})

export const internshipExperienceFormSchema = internshipExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const internshipExperienceFormSchemaExcludeHidden = internshipExperienceBaseSchema.partial()

export type InternshipExperienceForm = z.infer<typeof internshipExperienceFormSchema>
export type InternshipExperienceFormExcludeHidden = z.infer<typeof internshipExperienceFormSchemaExcludeHidden>

export const DEFAULT_INTERNSHIP_EXPERIENCE: InternshipExperienceForm = {
  companyName: undefined,
  position: undefined,
  internshipDuration: [],
  internshipInfo: [],
  isHidden: false,
}
