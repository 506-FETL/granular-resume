import { z } from 'zod'

const applicationSchoolSchema = z.string().trim()
export type ApplicationSchool = z.infer<typeof applicationSchoolSchema>

const applicationMajorSchema = z.string().trim()
export type ApplicationMajor = z.infer<typeof applicationMajorSchema>

export const applicationInfoFormSchema = z.object({
  applicationSchool: applicationSchoolSchema,
  applicationMajor: applicationMajorSchema,
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export type ApplicationInfoForm = z.infer<typeof applicationInfoFormSchema>
export type ApplicationInfoFormExcludeHidden = Omit<ApplicationInfoForm, 'isHidden'>

export const DEFAULT_APPLICATION_INFO: ApplicationInfoForm = {
  applicationSchool: undefined,
  applicationMajor: undefined,
  isHidden: false,
}
