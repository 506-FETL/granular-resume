import { z } from 'zod'

const projectName = z.string().trim()
export type ProjectName = z.infer<typeof projectName>

const participantRole = z.string().trim()
export type ParticipantRole = z.infer<typeof participantRole>

const projectDuration = z.array(z.string().trim().optional()).length(2)
export type ProjectDuration = z.infer<typeof projectDuration>

const customFieldSchema = z.object({
  content: z.string().trim().optional(),
}).optional()
export type CustomField = z.infer<typeof customFieldSchema>

const projectInfo = z.array(customFieldSchema).default([])
export type ProjectInfo = z.infer<typeof projectInfo>

const projectExperienceBaseSchema = z.object({
  projectName,
  participantRole,
  projectDuration,
  projectInfo,
})

export const projectExperienceFormSchema = projectExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const projectExperienceFormSchemaExcludeHidden = projectExperienceBaseSchema.partial()

export type ProjectExperienceForm = z.infer<typeof projectExperienceFormSchema>
export type ProjectExperienceFormExcludeHidden = z.infer<typeof projectExperienceFormSchemaExcludeHidden>

export const DEFAULT_PROJECT_EXPERIENCE: ProjectExperienceForm = {
  projectName: undefined,
  participantRole: undefined,
  projectDuration: [],
  projectInfo: [],
  isHidden: false,
}
