import { z } from 'zod'

const jobIntentSchema = z.string().trim().default('')
export type JobIntent = z.infer<typeof jobIntentSchema>

const intentionalCitySchema = z.string().trim().default('')
export type IntentionalCity = z.infer<typeof intentionalCitySchema>

const expectedSalarySchema = z.number().default(0)
export type ExpectedSalary = z.infer<typeof expectedSalarySchema>

const dateEntrySchema = z.enum(['不填', '随时到岗', '15天内', '1个月内', '2个月内', '3个月内', '到岗时间另行商议']).default('不填')
export type DateEntry = z.infer<typeof dateEntrySchema>

const jobIntentBaseSchema = z.object({
  jobIntent: jobIntentSchema,
  intentionalCity: intentionalCitySchema,
  expectedSalary: expectedSalarySchema,
  dateEntry: dateEntrySchema,
})

export const jobIntentFormSchema = jobIntentBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const jobIntentFormSchemaExcludeHidden = jobIntentBaseSchema

export type JobIntentForm = z.infer<typeof jobIntentFormSchema>
export type JobIntentFormExcludeHidden = z.infer<typeof jobIntentFormSchemaExcludeHidden>

export const DEFAULT_JOB_INTENT: JobIntentForm = {
  jobIntent: '',
  intentionalCity: '',
  expectedSalary: 0,
  dateEntry: '不填',
  isHidden: false,
}
