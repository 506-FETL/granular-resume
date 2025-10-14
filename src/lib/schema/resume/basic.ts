import { z } from 'zod'

const genderSchema = z.enum(['不填', '男', '女', '其他']).default('不填')
export type Gender = z.infer<typeof genderSchema>
const maritalStatusSchema = z.enum(['不填', '未婚', '已婚', '离异', '已婚已育']).default('不填')
export type MaritalStatus = z.infer<typeof maritalStatusSchema>
const politicalStatusSchema = z.enum(['不填', '中共党员', '中共预备党员', '共青团员', '群众', '其他']).default('不填')
export type PoliticalStatus = z.infer<typeof politicalStatusSchema>
const workYearsSchema = z.enum(['不填', '应届', '1年', '2年', '3-5年', '5-10年', '10年以上']).default('不填')
export type WorkYears = z.infer<typeof workYearsSchema>

const customFieldSchema = z
  .object({
    label: z.string().trim().optional(),
    value: z.string().trim().optional(),
  })
  .optional()
export type CustomField = z.infer<typeof customFieldSchema>

export const basicsSchema = z
  .object({
    name: z.string().trim(),
    gender: genderSchema,
    birthMonth: z.string(),
    phone: z.string().trim(),
    email: z.string(),
    workYears: workYearsSchema,
    maritalStatus: maritalStatusSchema,
    heightCm: z.number().int(),
    weightKg: z.number().int(),
    nation: z.string().trim(),
    nativePlace: z.string().trim(),
    customFields: z.array(customFieldSchema).default([]),
    politicalStatus: politicalStatusSchema,
  })
  .partial()

export type BasicForm = z.infer<typeof basicsSchema>

export const DEFAULT_BASICS: BasicForm = {
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
