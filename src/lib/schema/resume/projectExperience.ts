import { z } from 'zod'

const projectName = z.string().trim()
export type ProjectName = z.infer<typeof projectName>

const participantRole = z.string().trim()
export type ParticipantRole = z.infer<typeof participantRole>

const projectDuration = z.array(z.string().trim().optional()).length(2)
export type ProjectDuration = z.infer<typeof projectDuration>

// 单个项目经验项
const projectExperienceItemSchema = z.object({
  projectName: projectName.optional(),
  participantRole: participantRole.optional(),
  projectDuration: projectDuration.optional(),
  projectInfo: z.string().trim().optional(), // 项目经验描述
})
export type ProjectExperienceItem = z.infer<typeof projectExperienceItemSchema>

// 项目经验列表
const projectExperienceListSchema = z.array(projectExperienceItemSchema).default([{
  projectName: undefined,
  participantRole: undefined,
  projectDuration: [],
  projectInfo: undefined,
}])

const projectExperienceBaseSchema = z.object({
  items: projectExperienceListSchema,
})

export const projectExperienceFormSchema = projectExperienceBaseSchema.extend({
  isHidden: z.boolean().default(false),
}).partial().required({ isHidden: true })

export const projectExperienceFormSchemaExcludeHidden = projectExperienceBaseSchema.partial()

export type ProjectExperienceForm = z.infer<typeof projectExperienceFormSchema>
export type ProjectExperienceFormExcludeHidden = z.infer<typeof projectExperienceFormSchemaExcludeHidden>

export const DEFAULT_PROJECT_EXPERIENCE: ProjectExperienceForm = {
  items: [{
    projectName: undefined,
    participantRole: undefined,
    projectDuration: [],
    projectInfo: undefined,
  }],
  isHidden: false,
}
