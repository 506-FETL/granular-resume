import { z } from 'zod'

const companyName = z.string().trim().default('')
const position = z.string().trim().default('')

const internshipDuration = z.array(z.string().trim()).length(2).default(['', ''])
export type InternshipDuration = z.infer<typeof internshipDuration>

const internshipInfo = z.string().trim().default('')
export type InternshipInfo = z.infer<typeof internshipInfo>

// 单个实习经验项
const internshipExperienceItemSchema = z.object({
  companyName,
  position,
  internshipDuration,
  internshipInfo,
})
export type InternshipExperienceItem = z.infer<typeof internshipExperienceItemSchema>

// 实习经验列表
const internshipExperienceListSchema = z.array(internshipExperienceItemSchema).default([{
  companyName: '',
  position: '',
  internshipDuration: ['', ''],
  internshipInfo: '',
}])

const internshipExperienceBaseSchema = z.object({
  items: internshipExperienceListSchema,
})

export const internshipExperienceFormSchema = internshipExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const internshipExperienceFormSchemaExcludeHidden = internshipExperienceBaseSchema

export type InternshipExperienceForm = z.infer<typeof internshipExperienceFormSchema>
export type InternshipExperienceFormExcludeHidden = z.infer<typeof internshipExperienceFormSchemaExcludeHidden>

export const DEFAULT_INTERNSHIP_EXPERIENCE: InternshipExperienceForm = {
  items: [{
    companyName: '',
    position: '',
    internshipDuration: ['', ''],
    internshipInfo: '',
  }],
  isHidden: false,
}
