import { z } from 'zod'

const JobIntentSchema = z.string().trim()
export type JobIntent = z.infer<typeof JobIntentSchema>

const IntentionalCitySchema = z.string().trim()
export type IntentionalCity = z.infer<typeof IntentionalCitySchema>

const ExpectedSalarySchema = z.number()
export type ExpectedSalary = z.infer<typeof ExpectedSalarySchema>

const DateEntrySchema = z.enum(['不填', '随时到岗', '15天内', '1个月内', '2个月内', '3个月内', '到岗时间另行商议']).default('不填')
export type DateEntry = z.infer<typeof DateEntrySchema>

export const JobIntentFormSchema = z.object({
  jobIntent: JobIntentSchema,
  intentionalCity: IntentionalCitySchema,
  expectedSalary: ExpectedSalarySchema,
  dateEntry: DateEntrySchema,
}).partial()

export type JobIntentFormType = z.infer<typeof JobIntentFormSchema>

export const DEFAULT_JOB_INTENT: JobIntentFormType = {
  jobIntent: undefined,
  intentionalCity: undefined,
  expectedSalary: undefined,
  dateEntry: '不填',
}
