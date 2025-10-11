import { z } from 'zod'

const schoolName = z.string().trim()
export type SchoolName = z.infer<typeof schoolName>

const professional = z.string().trim()
export type Professional = z.infer<typeof professional>

const degree = z.enum(['不填', '初中', '高中', '中专', '大专', '本科', '学士', '硕士', '博士', 'MBA', 'EMBA', '其他']).default('不填')
export type Degree = z.infer<typeof degree>

const duration = z.array(z.string().trim().optional()).length(2)
export type Duration = z.infer<typeof duration>

// 单个教育背景项
const eduBackgroundItemSchema = z.object({
  schoolName,
  professional,
  degree,
  duration,
  eduInfo: z.string().trim(),
}).partial()
export type EduBackgroundItem = z.infer<typeof eduBackgroundItemSchema>

// 教育背景列表
const eduBackgroundListSchema = z.array(eduBackgroundItemSchema).default([{
  schoolName: undefined,
  professional: undefined,
  degree: '不填',
  duration: [],
  eduInfo: undefined,
}])

const eduBackgroundBaseSchema = z.object({
  items: eduBackgroundListSchema,
})

export const eduBackgroundFormSchema = eduBackgroundBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const eduBackgroundFormSchemaExcludeHidden = eduBackgroundBaseSchema.partial()

export type EduBackgroundForm = z.infer<typeof eduBackgroundFormSchema>
export type EduBackgroundFormExcludeHidden = z.infer<typeof eduBackgroundFormSchemaExcludeHidden>

export const DEFAULT_EDU_BACKGROUND: EduBackgroundForm = {
  items: [{
    schoolName: undefined,
    professional: undefined,
    degree: '不填',
    duration: [],
    eduInfo: undefined,
  }],
  isHidden: false,
}
