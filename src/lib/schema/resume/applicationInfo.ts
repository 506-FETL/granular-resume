import { z } from 'zod'

const applicationSchoolSchema = z.string().trim().default('')
export type ApplicationSchool = z.infer<typeof applicationSchoolSchema>

const applicationMajorSchema = z.string().trim().default('')
export type ApplicationMajor = z.infer<typeof applicationMajorSchema>

const applicationInfoBaseSchema = z.object({
  applicationSchool: applicationSchoolSchema,
  applicationMajor: applicationMajorSchema,
})

export const applicationInfoFormSchema = applicationInfoBaseSchema.extend({
  isHidden: z.boolean().default(true),
})

export const applicationInfoFormSchemaExcludeHidden = applicationInfoBaseSchema

export type ApplicationInfoForm = z.infer<typeof applicationInfoFormSchema>
export type ApplicationInfoFormExcludeHidden = z.infer<typeof applicationInfoFormSchemaExcludeHidden>

export const DEFAULT_APPLICATION_INFO: ApplicationInfoForm = {
  applicationSchool: '',
  applicationMajor: '',
  isHidden: true,
}
