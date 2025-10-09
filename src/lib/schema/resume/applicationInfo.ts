import { z } from 'zod'

const ApplicationSchoolSchema = z.string().trim()
export type ApplicationSchool = z.infer<typeof ApplicationSchoolSchema>

const ApplicationMajorSchema = z.string().trim()
export type ApplicationMajor = z.infer<typeof ApplicationMajorSchema>

export const ApplicationInfoFormSchema = z.object({
  applicationSchool: ApplicationSchoolSchema,
  applicationMajor: ApplicationMajorSchema,
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export type ApplicationInfoFormType = z.infer<typeof ApplicationInfoFormSchema>
export type ApplicationInfoFormExcludeHidden = Omit<ApplicationInfoFormType, 'isHidden'>

export const DEFAULT_APPLICATION_INFO: ApplicationInfoFormType = {
  applicationSchool: undefined,
  applicationMajor: undefined,
  isHidden: false,
}
