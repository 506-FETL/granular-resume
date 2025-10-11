import { z } from 'zod'

// 预设兴趣爱好
export const PRESET_HOBBIES = [
  '篮球',
  '跑步',
  '唱歌',
  '跳舞',
  '摄影',
  '旅行',
  '健身',
  '养宠物',
  '园艺',
  '桌游',
  '王者荣耀',
  '吃鸡',
] as const

export type PresetHobby = typeof PRESET_HOBBIES[number]

// 爱好项 schema - 简单的对象包含 name 字段
export const hobbyItemSchema = z.object({
  name: z.string().trim().min(1, '爱好名称不能为空'),
})

// 兴趣爱好列表
const hobbiesListSchema = z.array(hobbyItemSchema).default([])

const hobbiesBaseSchema = z.object({
  description: z.string().trim().default(''),
  hobbies: hobbiesListSchema,
})

export const hobbiesFormSchema = hobbiesBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const hobbiesFormSchemaExcludeHidden = hobbiesBaseSchema

export type HobbiesForm = z.infer<typeof hobbiesFormSchema>
export type HobbiesFormExcludeHidden = z.infer<typeof hobbiesFormSchemaExcludeHidden>
export type HobbyItem = z.infer<typeof hobbyItemSchema>

export const DEFAULT_HOBBIES: HobbiesForm = {
  description: '',
  hobbies: [],
  isHidden: false,
}
