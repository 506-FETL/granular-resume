import { z } from 'zod'

// 熟练程度枚举
const proficiencyLevelEnum = z.enum(['一般', '良好', '熟练', '擅长', '精通'])
export type ProficiencyLevel = z.infer<typeof proficiencyLevelEnum>

// 展示方式枚举
const displayTypeEnum = z.enum(['text', 'percentage'])
export type DisplayType = z.infer<typeof displayTypeEnum>

// 熟练程度对应的百分比映射
export const PROFICIENCY_PERCENTAGE_MAP: Record<ProficiencyLevel, number> = {
  一般: 50,
  良好: 65,
  熟练: 80,
  擅长: 85,
  精通: 95,
}

// 预设技能标签
export const PRESET_SKILLS = [
  'Office软件',
  '沟通能力',
  '文案编辑',
  '数据分析',
  '推广运营',
  '产品设计',
  '广告设计',
  'JavaScript',
  'Java',
  'Python',
  'PHP',
  'NodeJs',
  '英语',
] as const

export type PresetSkill = typeof PRESET_SKILLS[number]

// 单个技能特长项
export const skillItemSchema = z.object({
  label: z.string().trim().min(1, '标签不能为空'),
  proficiencyLevel: proficiencyLevelEnum.default('熟练'),
  displayType: displayTypeEnum.default('percentage'),
})
export type SkillItem = z.infer<typeof skillItemSchema>

// 技能特长列表
const skillListSchema = z.array(skillItemSchema).default([])

const skillSpecialtyBaseSchema = z.object({
  description: z.string().trim().default(''),
  skills: skillListSchema,
})

export const skillSpecialtyFormSchema = skillSpecialtyBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const skillSpecialtyFormSchemaExcludeHidden = skillSpecialtyBaseSchema

export type SkillSpecialtyForm = z.infer<typeof skillSpecialtyFormSchema>
export type SkillSpecialtyFormExcludeHidden = z.infer<typeof skillSpecialtyFormSchemaExcludeHidden>

export const DEFAULT_SKILL_SPECIALTY: SkillSpecialtyForm = {
  description: '',
  skills: [],
  isHidden: false,
}
