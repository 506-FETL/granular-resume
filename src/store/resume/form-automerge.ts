import { DocumentManager } from '@/lib/automerge/document-manager'
import type { AutomergeResumeDocument } from '@/lib/automerge/schema'
import type { DocHandle } from '@automerge/automerge-repo'
import {
  DEFAULT_APPLICATION_INFO,
  DEFAULT_BASICS,
  DEFAULT_CAMPUS_EXPERIENCE,
  DEFAULT_EDU_BACKGROUND,
  DEFAULT_HOBBIES,
  DEFAULT_HONORS_CERTIFICATES,
  DEFAULT_INTERNSHIP_EXPERIENCE,
  DEFAULT_JOB_INTENT,
  DEFAULT_ORDER,
  DEFAULT_PROJECT_EXPERIENCE,
  DEFAULT_SELF_EVALUATION,
  DEFAULT_SKILL_SPECIALTY,
  DEFAULT_VISIBILITY,
  DEFAULT_WORK_EXPERIENCE,
  type ApplicationInfoFormType,
  type BasicFormType,
  type CampusExperienceFormType,
  type EduBackgroundFormType,
  type HobbiesFormType,
  type HonorsCertificatesFormType,
  type InternshipExperienceFormType,
  type JobIntentFormType,
  type ORDERType,
  type ProjectExperienceFormType,
  type SelfEvaluationFormType,
  type SkillSpecialtyFormType,
  type VisibilityItemsType,
  type WorkExperienceFormType,
} from '@/lib/schema'
import { create } from 'zustand'

// 表单数据映射
interface FormDataMap {
  basics: BasicFormType
  jobIntent: JobIntentFormType
  applicationInfo: ApplicationInfoFormType
  eduBackground: EduBackgroundFormType
  workExperience: WorkExperienceFormType
  internshipExperience: InternshipExperienceFormType
  campusExperience: CampusExperienceFormType
  projectExperience: ProjectExperienceFormType
  skillSpecialty: SkillSpecialtyFormType
  honorsCertificates: HonorsCertificatesFormType
  selfEvaluation: SelfEvaluationFormType
  hobbies: HobbiesFormType
}

interface AutomergeResumeState extends FormDataMap {
  // UI 状态 (不同步到 Automerge)
  activeTabId: ORDERType

  // 文档状态
  order: ORDERType[]
  visibility: { [key in VisibilityItemsType]: boolean }

  // Automerge 相关
  docManager: DocumentManager | null
  docHandle: DocHandle<AutomergeResumeDocument> | null
  isInitialized: boolean
  isLoading: boolean

  // 同步状态
  isSyncing: boolean
  lastSyncTime: number | null
  syncError: string | null

  // 初始化方法
  initializeDocument: (resumeId: string, userId: string) => Promise<void>

  // 更新方法
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataMap>(key: K, data: Partial<FormDataMap[K]>) => void
  updateOrder: (newOrder: ORDERType[]) => void
  toggleVisibility: (id: VisibilityItemsType) => void
  setVisibility: (id: VisibilityItemsType, isHidden: boolean) => void

  // 手动同步
  manualSync: () => Promise<void>

  // 清理
  cleanup: () => void
}

const useAutomergeResumeStore = create<AutomergeResumeState>()((set, get) => ({
  // 初始默认值
  basics: DEFAULT_BASICS,
  jobIntent: DEFAULT_JOB_INTENT,
  order: DEFAULT_ORDER,
  activeTabId: 'basics',
  applicationInfo: DEFAULT_APPLICATION_INFO,
  eduBackground: DEFAULT_EDU_BACKGROUND,
  workExperience: DEFAULT_WORK_EXPERIENCE,
  internshipExperience: DEFAULT_INTERNSHIP_EXPERIENCE,
  campusExperience: DEFAULT_CAMPUS_EXPERIENCE,
  projectExperience: DEFAULT_PROJECT_EXPERIENCE,
  skillSpecialty: DEFAULT_SKILL_SPECIALTY,
  honorsCertificates: DEFAULT_HONORS_CERTIFICATES,
  selfEvaluation: DEFAULT_SELF_EVALUATION,
  hobbies: DEFAULT_HOBBIES,
  visibility: DEFAULT_VISIBILITY,

  // Automerge 状态
  docManager: null,
  docHandle: null,
  isInitialized: false,
  isLoading: false,

  // 同步状态
  isSyncing: false,
  lastSyncTime: null,
  syncError: null,

  /**
   * 初始化 Automerge 文档
   */
  initializeDocument: async (resumeId: string, userId: string) => {
    // eslint-disable-next-line no-console
    console.log('🚀 开始初始化文档', { resumeId, userId })

    set({ isLoading: true, syncError: null })

    try {
      const manager = new DocumentManager(resumeId, userId)

      // eslint-disable-next-line no-console
      console.log('📝 DocumentManager 已创建')

      const handle = await manager.initialize()

      // eslint-disable-next-line no-console
      console.log('✅ 文档初始化成功', { url: handle.url, isReady: handle.isReady() })

      // 监听 handle 的删除事件（调试用）
      handle.on('delete', () => {
        // eslint-disable-next-line no-console
        console.warn('⚠️ 文档被删除')
      })

      // 监听文档变化
      // eslint-disable-next-line no-console
      console.log('🎯 正在注册 change 监听器...', {
        handleUrl: handle.url,
        isReady: handle.isReady(),
      })

      const changeHandler = ({ doc, patches, patchInfo }: any) => {
        if (!doc) {
          // eslint-disable-next-line no-console
          console.warn('⚠️ 收到空的文档更新')
          return
        }

        // eslint-disable-next-line no-console
        console.log('🔄 文档已更新', {
          patchCount: patches?.length || 0,
          name: doc.basics?.name,
          phone: doc.basics?.phone,
          email: doc.basics?.email,
          timestamp: new Date().toLocaleTimeString(),
          source: patchInfo?.source || 'unknown',
          documentUrl: handle.url,
          patches: patches?.slice(0, 2), // 显示前2个patch
        })

        // 更新 store 状态
        set({
          basics: doc.basics || DEFAULT_BASICS,
          jobIntent: doc.jobIntent || DEFAULT_JOB_INTENT,
          applicationInfo: doc.applicationInfo || DEFAULT_APPLICATION_INFO,
          eduBackground: doc.eduBackground || DEFAULT_EDU_BACKGROUND,
          workExperience: doc.workExperience || DEFAULT_WORK_EXPERIENCE,
          internshipExperience: doc.internshipExperience || DEFAULT_INTERNSHIP_EXPERIENCE,
          campusExperience: doc.campusExperience || DEFAULT_CAMPUS_EXPERIENCE,
          projectExperience: doc.projectExperience || DEFAULT_PROJECT_EXPERIENCE,
          skillSpecialty: doc.skillSpecialty || DEFAULT_SKILL_SPECIALTY,
          honorsCertificates: doc.honorsCertificates || DEFAULT_HONORS_CERTIFICATES,
          selfEvaluation: doc.selfEvaluation || DEFAULT_SELF_EVALUATION,
          hobbies: doc.hobbies || DEFAULT_HOBBIES,
          order: doc.order || DEFAULT_ORDER,
          visibility: doc.visibility || DEFAULT_VISIBILITY,
          lastSyncTime: Date.now(),
        })

        // eslint-disable-next-line no-console
        console.log('✅ Store 状态已更新')
      }

      handle.on('change', changeHandler)

      // eslint-disable-next-line no-console
      console.log('✅ change 监听器已注册', {
        listenerCount: (handle as any).listenerCount?.('change') || 'unknown',
      })

      // 初始加载当前文档数据
      const doc = handle.doc()
      if (doc) {
        set({
          basics: doc.basics || DEFAULT_BASICS,
          jobIntent: doc.jobIntent || DEFAULT_JOB_INTENT,
          applicationInfo: doc.applicationInfo || DEFAULT_APPLICATION_INFO,
          eduBackground: doc.eduBackground || DEFAULT_EDU_BACKGROUND,
          workExperience: doc.workExperience || DEFAULT_WORK_EXPERIENCE,
          internshipExperience: doc.internshipExperience || DEFAULT_INTERNSHIP_EXPERIENCE,
          campusExperience: doc.campusExperience || DEFAULT_CAMPUS_EXPERIENCE,
          projectExperience: doc.projectExperience || DEFAULT_PROJECT_EXPERIENCE,
          skillSpecialty: doc.skillSpecialty || DEFAULT_SKILL_SPECIALTY,
          honorsCertificates: doc.honorsCertificates || DEFAULT_HONORS_CERTIFICATES,
          selfEvaluation: doc.selfEvaluation || DEFAULT_SELF_EVALUATION,
          hobbies: doc.hobbies || DEFAULT_HOBBIES,
          order: doc.order || DEFAULT_ORDER,
          visibility: doc.visibility || DEFAULT_VISIBILITY,
        })
      }

      set({
        docManager: manager,
        docHandle: handle,
        isInitialized: true,
        isLoading: false,
      })

      // eslint-disable-next-line no-console
      console.log('🎉 Store 初始化完成')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ 初始化失败', error)

      const errorMessage = error instanceof Error ? error.message : '初始化失败'

      set({
        isLoading: false,
        syncError: errorMessage,
      })
    }
  },

  /**
   * 更新活动标签页 (仅 UI 状态)
   */
  updateActiveTabId: (newActiveTab) => set({ activeTabId: newActiveTab }),

  /**
   * 更新表单数据
   */
  updateForm: (key, data) => {
    const { docManager } = get()
    if (!docManager) {
      // eslint-disable-next-line no-console
      console.error('❌ docManager 未初始化，无法更新')
      return
    }

    // eslint-disable-next-line no-console
    console.log('📝 正在更新表单数据', { key, data })

    docManager.change((doc) => {
      if (!doc[key]) {
        doc[key] = {} as any
      }
      Object.assign(doc[key], data)

      // eslint-disable-next-line no-console
      console.log('✅ 文档已修改', { key, newValue: doc[key] })
    })
  },

  /**
   * 更新顺序
   */
  updateOrder: (newOrder) => {
    const { docManager } = get()
    if (!docManager) return

    docManager.change((doc) => {
      doc.order = newOrder
    })
  },

  /**
   * 切换可见性
   */
  toggleVisibility: (id) => {
    const { docManager, visibility } = get()
    if (!docManager) return

    docManager.change((doc) => {
      if (!doc.visibility) {
        doc.visibility = {} as any
      }
      doc.visibility[id] = !visibility[id]
    })
  },

  /**
   * 设置可见性
   */
  setVisibility: (id, isHidden) => {
    const { docManager } = get()
    if (!docManager) return

    docManager.change((doc) => {
      if (!doc.visibility) {
        doc.visibility = {} as any
      }
      doc.visibility[id] = isHidden
    })
  },

  /**
   * 手动同步到 Supabase
   */
  manualSync: async () => {
    const { docManager, docHandle } = get()
    if (!docManager || !docHandle) return

    set({ isSyncing: true })

    try {
      await docManager.saveToSupabase(docHandle)
      set({
        isSyncing: false,
        lastSyncTime: Date.now(),
        syncError: null,
      })
    } catch (error) {
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : '同步失败',
      })
    }
  },

  /**
   * 清理资源
   */
  cleanup: () => {
    const { docManager } = get()
    if (docManager) {
      docManager.destroy()
    }
    set({
      docManager: null,
      docHandle: null,
      isInitialized: false,
    })
  },
}))

export default useAutomergeResumeStore
