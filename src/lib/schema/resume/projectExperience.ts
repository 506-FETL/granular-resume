import { z } from 'zod'

const projectName = z.string().trim().default('')
export type ProjectName = z.infer<typeof projectName>

const participantRole = z.string().trim().default('')
export type ParticipantRole = z.infer<typeof participantRole>

const projectDuration = z.array(z.string().trim()).length(2).default(['', ''])
export type ProjectDuration = z.infer<typeof projectDuration>

const projectInfo = z.string().trim().default('')
export type ProjectInfo = z.infer<typeof projectInfo>

// 单个项目经验项
const projectExperienceItemSchema = z.object({
  projectName,
  participantRole,
  projectDuration,
  projectInfo,
})
export type ProjectExperienceItem = z.infer<typeof projectExperienceItemSchema>

// 项目经验列表
const projectExperienceListSchema = z.array(projectExperienceItemSchema).default([
  {
    projectName: '',
    participantRole: '',
    projectDuration: ['', ''],
    projectInfo: '',
  },
])

const projectExperienceBaseSchema = z.object({
  items: projectExperienceListSchema,
})

export const projectExperienceFormSchema = projectExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const projectExperienceFormSchemaExcludeHidden = projectExperienceBaseSchema

export type ProjectExperienceForm = z.infer<typeof projectExperienceFormSchema>
export type ProjectExperienceFormExcludeHidden = z.infer<typeof projectExperienceFormSchemaExcludeHidden>

export const DEFAULT_PROJECT_EXPERIENCE: ProjectExperienceForm = {
  items: [
    {
      projectName: '',
      participantRole: '',
      projectDuration: ['', ''],
      projectInfo: '',
    },
  ],
  isHidden: false,
}
