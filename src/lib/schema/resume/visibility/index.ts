import { z, ZodBoolean } from 'zod'
import type { ORDERType } from '../form'

type VisibilityForms = Omit<
  {
    [key in ORDERType]: ZodBoolean
  },
  'basics'
>

export const visibilityFormsSchema = z.object<VisibilityForms>({
  jobIntent: z.boolean(),
  applicationInfo: z.boolean(),
  eduBackground: z.boolean(),
  workExperience: z.boolean(),
  internshipExperience: z.boolean(),
  campusExperience: z.boolean(),
  projectExperience: z.boolean(),
  skillSpecialty: z.boolean(),
  honorsCertificates: z.boolean(),
  selfEvaluation: z.boolean(),
  hobbies: z.boolean(),
})

export type VisibilityFormType = z.infer<typeof visibilityFormsSchema>

export const DEFAULT_VISIBILITY: VisibilityFormType = {
  jobIntent: false,
  applicationInfo: true,
  eduBackground: false,
  workExperience: false,
  internshipExperience: false,
  campusExperience: false,
  projectExperience: false,
  skillSpecialty: false,
  honorsCertificates: false,
  selfEvaluation: false,
  hobbies: false,
}
