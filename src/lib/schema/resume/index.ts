import { z } from 'zod'
import { BasicsSchema } from './basic'
import { JobIntentFormSchema } from './jobIntent'

export const ResumeSchema = z.object({
  basics: BasicsSchema,
  jobIntent: JobIntentFormSchema,
})

export type ResumeSchemaType = z.infer<typeof ResumeSchema>

export * from './basic'
export * from './jobIntent'

export type ORDERType = (keyof ResumeSchemaType)
export const DEFAULT_ORDER: ORDERType[] = ['basics']
