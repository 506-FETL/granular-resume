import { z } from 'zod'
import {
  applicationInfoForm,
  basicsSchema,
  campusExperienceFormSchema,
  eduBackgroundFormSchema,
  hobbiesFormSchema,
  honorsCertificatesFormSchema,
  internshipExperienceFormSchema,
  jobIntentFormSchema,
  projectExperienceFormSchema,
  selfEvaluationFormSchema,
  skillSpecialtyFormSchema,
  workExperienceFormSchema,
} from './form'

export const resumeSchema = z.object({
  basics: basicsSchema,
  jobIntent: jobIntentFormSchema,
  applicationInfo: applicationInfoForm,
  eduBackground: eduBackgroundFormSchema,
  workExperience: workExperienceFormSchema,
  internshipExperience: internshipExperienceFormSchema,
  campusExperience: campusExperienceFormSchema,
  projectExperience: projectExperienceFormSchema,
  skillSpecialty: skillSpecialtyFormSchema,
  honorsCertificates: honorsCertificatesFormSchema,
  selfEvaluation: selfEvaluationFormSchema,
  hobbies: hobbiesFormSchema,
})

export type ResumeSchema = z.infer<typeof resumeSchema>

export type ORDERType = keyof ResumeSchema
export const DEFAULT_ORDER: ORDERType[] = [
  'basics',
  'jobIntent',
  'applicationInfo',
  'eduBackground',
  'workExperience',
  'internshipExperience',
  'campusExperience',
  'projectExperience',
  'skillSpecialty',
  'honorsCertificates',
  'selfEvaluation',
  'hobbies',
]

export * from './config'
export * from './form'
export * from './visibility'
