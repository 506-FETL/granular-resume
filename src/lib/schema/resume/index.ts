import { z } from 'zod'
import { applicationInfoFormSchema } from './applicationInfo'
import { basicsSchema } from './basic'
import { campusExperienceFormSchema } from './campusExperience'
import { eduBackgroundFormSchema } from './eduBackground'
import { internshipExperienceFormSchema } from './internshipExperience'
import { jobIntentFormSchema } from './jobIntent'
import { projectExperienceFormSchema } from './projectExperience'
import { workExperienceFormSchema } from './workExperience'

export const resumeSchema = z.object({
  basics: basicsSchema,
  jobIntent: jobIntentFormSchema,
  applicationInfo: applicationInfoFormSchema,
  eduBackground: eduBackgroundFormSchema,
  workExperience: workExperienceFormSchema,
  internshipExperience: internshipExperienceFormSchema,
  campusExperience: campusExperienceFormSchema,
  projectExperience: projectExperienceFormSchema,
})

export type ResumeSchema = z.infer<typeof resumeSchema>

export * from './applicationInfo'
export * from './basic'
export * from './jobIntent'

export type ORDERType = (keyof ResumeSchema)
export const DEFAULT_ORDER: ORDERType[] = ['basics', 'jobIntent', 'applicationInfo', 'eduBackground', 'workExperience', 'internshipExperience', 'campusExperience', 'projectExperience']
