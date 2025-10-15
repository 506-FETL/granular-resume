import { z } from 'zod'

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

export type PresetHobby = (typeof PRESET_HOBBIES)[number]

export const hobbyItemSchema = z.object({
  name: z.string().trim(),
})

const hobbiesListSchema = z.array(hobbyItemSchema)

export const hobbiesFormSchema = z.object({
  description: z.string().trim(),
  hobbies: hobbiesListSchema,
})

export type HobbiesFormType = z.infer<typeof hobbiesFormSchema>
export type HobbyItem = z.infer<typeof hobbyItemSchema>

export const DEFAULT_HOBBIES: HobbiesFormType = {
  description: '',
  hobbies: [],
}
