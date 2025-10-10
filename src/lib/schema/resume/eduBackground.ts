import { z } from 'zod'

const schoolName = z.string().trim()
export type SchoolName = z.infer<typeof schoolName>

const professional = z.string().trim()
export type Professional = z.infer<typeof professional>

const degree = z.enum(['不填', '初中', '高中', '中专', '大专', '本科', '学士', '硕士', '博士', 'MBA', 'EMBA', '其他']).default('不填')
export type Degree = z.infer<typeof degree>

const duration = z.array(z.string().trim().optional()).length(2)
export type Duration = z.infer<typeof duration>

const customFieldSchema = z.object({
  content: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof customFieldSchema>

const eduInfo = z.array(customFieldSchema).default([])
export type EduInfo = z.infer<typeof eduInfo>

const eduBackgroundBaseSchema = z.object({
  schoolName,
  professional,
  degree,
  duration,
  eduInfo,
})

export const eduBackgroundFormSchema = eduBackgroundBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const eduBackgroundFormSchemaExcludeHidden = eduBackgroundBaseSchema.partial()

export type EduBackgroundForm = z.infer<typeof eduBackgroundFormSchema>
export type EduBackgroundFormExcludeHidden = z.infer<typeof eduBackgroundFormSchemaExcludeHidden>

export const DEFAULT_EDU_BACKGROUND: EduBackgroundForm = {
  schoolName: undefined,
  professional: undefined,
  degree: '不填',
  duration: [],
  eduInfo: [],
  isHidden: false,
}
