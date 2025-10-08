import { z } from 'zod'

const GenderSchema = z.enum(['不填', '男', '女', '其他']).default('不填')
export type Gender = z.infer<typeof GenderSchema>
const MaritalStatusSchema = z.enum(['不填', '未婚', '已婚', '离异', '已婚已育']).default('不填')
export type MaritalStatus = z.infer<typeof MaritalStatusSchema>
const PoliticalStatusSchema = z.enum(['不填', '中共党员', '中共预备党员', '共青团员', '群众', '其他']).default('不填')
export type PoliticalStatus = z.infer<typeof PoliticalStatusSchema>
const WorkYearsSchema = z.enum([
  '不填',
  '应届',
  '1年',
  '2年',
  '3-5年',
  '5-10年',
  '10年以上',
]).default('不填')
export type WorkYears = z.infer<typeof WorkYearsSchema>

const CustomFieldSchema = z.object({
  label: z.string().trim().optional(),
  value: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof CustomFieldSchema>

export const BasicsSchema = z.object({
  name: z.string().trim(),
  gender: GenderSchema,
  birthMonth: z.string(),
  phone: z.string().trim(),
  email: z.string(),
  workYears: WorkYearsSchema,
  maritalStatus: MaritalStatusSchema,
  heightCm: z.number().int(),
  weightKg: z.number().int(),
  nation: z.string().trim(),
  nativePlace: z.string().trim(),
  customFields: z.array(CustomFieldSchema).default([]),
  politicalStatus: PoliticalStatusSchema,
}).partial()

export type BasicFormType = z.infer<typeof BasicsSchema>

export const DEFAULT_BASICS: BasicFormType = {
  name: 'Granular Resume',
  gender: '男',
  birthMonth: undefined,
  phone: undefined,
  email: undefined,
  workYears: '不填',
  maritalStatus: '不填',
  heightCm: undefined,
  weightKg: undefined,
  nation: undefined,
  nativePlace: undefined,
  politicalStatus: '不填',
  customFields: [],
}
