import { z } from 'zod'

const selfEvaluationBaseSchema = z.object({
  content: z.string().trim().default(''),
})

export const selfEvaluationFormSchema = selfEvaluationBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const selfEvaluationFormSchemaExcludeHidden = selfEvaluationBaseSchema

export type SelfEvaluationForm = z.infer<typeof selfEvaluationFormSchema>
export type SelfEvaluationFormExcludeHidden = z.infer<typeof selfEvaluationFormSchemaExcludeHidden>

export const DEFAULT_SELF_EVALUATION: SelfEvaluationForm = {
  content: '',
  isHidden: false,
}
