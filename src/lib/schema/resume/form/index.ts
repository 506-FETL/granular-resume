import { z } from 'zod'
import { applicationInfoForm } from './applicationInfo'
import { basicsSchema } from './basic'
import { campusExperienceFormSchema } from './campusExperience'
import { eduBackgroundFormSchema } from './eduBackground'
import { hobbiesFormSchema } from './hobbies'
import { honorsCertificatesFormSchema } from './honorsCertificates'
import { internshipExperienceFormSchema } from './internshipExperience'
import { jobIntentFormSchema } from './jobIntent'
import { projectExperienceFormSchema } from './projectExperience'
import { selfEvaluationFormSchema } from './selfEvaluation'
import { skillSpecialtyFormSchema } from './skillSpecialty'
import { workExperienceFormSchema } from './workExperience'

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

export * from './applicationInfo'
export * from './basic'
export * from './campusExperience'
export * from './eduBackground'
export * from './hobbies'
export * from './honorsCertificates'
export * from './internshipExperience'
export * from './jobIntent'
export * from './projectExperience'
export * from './selfEvaluation'
export * from './skillSpecialty'
export * from './workExperience'

export type ORDERType = keyof ResumeSchema
export type VisibilityItemsType = Exclude<ORDERType, 'basics'>
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
