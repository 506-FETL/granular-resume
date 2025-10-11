import { z } from 'zod'

const companyName = z.string().trim()
export type CompanyName = z.infer<typeof companyName>

const position = z.string().trim()
export type Position = z.infer<typeof position>

const internshipDuration = z.array(z.string().trim().optional()).length(2)
export type InternshipDuration = z.infer<typeof internshipDuration>

// 单个实习经验项
const internshipExperienceItemSchema = z.object({
  companyName: companyName.optional(),
  position: position.optional(),
  internshipDuration: internshipDuration.optional(),
  internshipInfo: z.string().trim().optional(), // 实习经历描述
})
export type InternshipExperienceItem = z.infer<typeof internshipExperienceItemSchema>

// 实习经验列表
const internshipExperienceListSchema = z.array(internshipExperienceItemSchema).default([{
  companyName: undefined,
  position: undefined,
  internshipDuration: [],
  internshipInfo: undefined,
}])

const internshipExperienceBaseSchema = z.object({
  items: internshipExperienceListSchema,
})

export const internshipExperienceFormSchema = internshipExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const internshipExperienceFormSchemaExcludeHidden = internshipExperienceBaseSchema.partial()

export type InternshipExperienceForm = z.infer<typeof internshipExperienceFormSchema>
export type InternshipExperienceFormExcludeHidden = z.infer<typeof internshipExperienceFormSchemaExcludeHidden>

export const DEFAULT_INTERNSHIP_EXPERIENCE: InternshipExperienceForm = {
  items: [{
    companyName: undefined,
    position: undefined,
    internshipDuration: [],
    internshipInfo: undefined,
  }],
  isHidden: false,
}
