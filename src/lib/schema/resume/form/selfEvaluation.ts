import { z } from 'zod'

export const selfEvaluationFormSchema = z.object({
  content: z.string().trim(),
})

export type SelfEvaluationFormType = z.infer<typeof selfEvaluationFormSchema>

export const DEFAULT_SELF_EVALUATION: SelfEvaluationFormType = {
  content: '',
}
