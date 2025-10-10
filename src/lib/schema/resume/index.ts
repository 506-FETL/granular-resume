import { z } from 'zod'
import { applicationInfoFormSchema } from './applicationInfo'
import { basicsSchema } from './basic'
import { eduBackgroundFormSchema } from './eduBackground'
import { jobIntentFormSchema } from './jobIntent'

export const resumeSchema = z.object({
  basics: basicsSchema,
  jobIntent: jobIntentFormSchema,
  applicationInfo: applicationInfoFormSchema,
  eduBackground: eduBackgroundFormSchema,
})

export type ResumeSchema = z.infer<typeof resumeSchema>

export * from './applicationInfo'
export * from './basic'
export * from './jobIntent'

export type ORDERType = (keyof ResumeSchema)
export const DEFAULT_ORDER: ORDERType[] = ['basics', 'jobIntent', 'applicationInfo', 'eduBackground']
