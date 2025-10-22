import type { ResumeSchema, ORDERType, VisibilityItemsType } from '@/lib/schema'

/**
 * Automerge 文档结构
 * 扩展自现有的 ResumeSchema
 */
export interface AutomergeResumeDocument extends ResumeSchema {
  // 文档元数据
  _metadata: {
    resumeId: string
    userId: string
    createdAt: string
    updatedAt: string
    version: number
  }

  // 表单顺序和可见性
  order: ORDERType[]
  visibility: { [key in VisibilityItemsType]: boolean }

  // 协作者信息（运行时状态，不持久化到 Supabase）
  _collaborators?: {
    [userId: string]: {
      name: string
      email: string
      avatarUrl?: string
      color: string
      lastSeen: string
      currentlyEditing?: string[] // 正在编辑的字段路径
    }
  }
}

/**
 * Automerge 变更函数类型
 */
export type ChangeFn<T> = (doc: T) => void

/**
 * 字段路径类型（用于协作光标定位）
 */
export type FieldPath = string[] // 例如: ['basics', 'name']
