import { z } from 'zod'
import { BasicsSchema } from './basic'

export const ResumeSchema = z.object({
  basics: BasicsSchema,
})

export type ResumeSchemaType = z.infer<typeof ResumeSchema>

export * from './basic'
