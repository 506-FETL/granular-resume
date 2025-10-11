import { z } from 'zod'

const schoolName = z.string().trim().default('')
export type SchoolName = z.infer<typeof schoolName>

const professional = z.string().trim().default('')
export type Professional = z.infer<typeof professional>

const degree = z.enum(['不填', '初中', '高中', '中专', '大专', '本科', '学士', '硕士', '博士', 'MBA', 'EMBA', '其他']).default('不填')
export type Degree = z.infer<typeof degree>

const duration = z.array(z.string().trim()).length(2).default(['', ''])
export type Duration = z.infer<typeof duration>

const eduInfo = z.string().trim().default('')
export type EduInfo = z.infer<typeof eduInfo>

// 单个教育背景项
const eduBackgroundItemSchema = z.object({
  schoolName,
  professional,
  degree,
  duration,
  eduInfo,
})
export type EduBackgroundItem = z.infer<typeof eduBackgroundItemSchema>

// 教育背景列表
const eduBackgroundListSchema = z.array(eduBackgroundItemSchema).default([{
  schoolName: '',
  professional: '',
  degree: '不填',
  duration: ['', ''],
  eduInfo: '',
}])

const eduBackgroundBaseSchema = z.object({
  items: eduBackgroundListSchema,
})

export const eduBackgroundFormSchema = eduBackgroundBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const eduBackgroundFormSchemaExcludeHidden = eduBackgroundBaseSchema

export type EduBackgroundForm = z.infer<typeof eduBackgroundFormSchema>
export type EduBackgroundFormExcludeHidden = z.infer<typeof eduBackgroundFormSchemaExcludeHidden>

export const DEFAULT_EDU_BACKGROUND: EduBackgroundForm = {
  items: [{
    schoolName: '',
    professional: '',
    degree: '不填',
    duration: ['', ''],
    eduInfo: '',
  }],
  isHidden: false,
}
