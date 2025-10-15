import { z } from 'zod'

const projectName = z.string().trim()
export type ProjectName = z.infer<typeof projectName>

const participantRole = z.string().trim()
export type ParticipantRole = z.infer<typeof participantRole>

const projectDuration = z.array(z.string().trim()).length(2)
export type ProjectDuration = z.infer<typeof projectDuration>

const projectInfo = z.string().trim()
export type ProjectInfo = z.infer<typeof projectInfo>

const projectExperienceItemSchema = z.object({
  projectName,
  participantRole,
  projectDuration,
  projectInfo,
})
export type ProjectExperienceItem = z.infer<typeof projectExperienceItemSchema>

const projectExperienceListSchema = z.array(projectExperienceItemSchema)

export const projectExperienceFormSchema = z.object({
  items: projectExperienceListSchema,
})

export type ProjectExperienceFormType = z.infer<typeof projectExperienceFormSchema>

export const DEFAULT_PROJECT_EXPERIENCE: ProjectExperienceFormType = {
  items: [
    {
      projectName: '',
      participantRole: '',
      projectDuration: ['', ''],
      projectInfo: '',
    },
  ],
}
