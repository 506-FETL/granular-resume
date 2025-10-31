/* eslint-disable no-console */
/**
 * 统一的简历存储 Store - 离线优先架构
 *
 * 特性：
 * 1. 完全离线可用 - 未登录也能创建和编辑简历
 * 2. 使用 IndexedDB 本地持久化
 * 3. 登录后自动使用 Automerge 同步
 * 4. 监听远程变更并提示用户
 */

import type { DocHandle } from '@automerge/automerge-repo'
import type { AutomergeResumeDocument } from '@/lib/automerge/schema'
import type { ApplicationInfoFormType, BasicFormType, CampusExperienceFormType, EduBackgroundFormType, HobbiesFormType, HonorsCertificatesFormType, InternshipExperienceFormType, JobIntentFormType, ORDERType, ProjectExperienceFormType, SelfEvaluationFormType, SkillSpecialtyFormType, VisibilityItemsType, WorkExperienceFormType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DocumentManager } from '@/lib/automerge/document-manager'
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

} from '@/lib/schema'
import { getCurrentUser } from '@/lib/supabase/user'

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

interface UnifiedResumeState extends FormDataMap {
  // UI 状态
  activeTabId: ORDERType
  order: ORDERType[]
  visibility: { [key in VisibilityItemsType]: boolean }

  // 当前简历信息
  currentResumeId: string | null
  isOnlineMode: boolean // 是否启用在线同步模式

  // Automerge 相关（仅在线模式）
  docManager: DocumentManager | null
  docHandle: DocHandle<AutomergeResumeDocument> | null
  isAutomergeInitialized: boolean

  // 同步状态
  isSyncing: boolean
  lastSyncTime: number | null
  syncError: string | null
  pendingChanges: boolean

  // 远程变更提醒
  hasRemoteChanges: boolean
  remoteChangeNotification: string | null

  // 初始化方法
  initializeResume: (resumeId: string) => Promise<void>

  // 更新方法
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataMap>(key: K, data: Partial<FormDataMap[K]>) => void
  updateOrder: (newOrder: ORDERType[]) => void
  toggleVisibility: (id: VisibilityItemsType) => void
  setVisibility: (id: VisibilityItemsType, isHidden: boolean) => void

  // 同步方法
  manualSync: () => Promise<void>
  acceptRemoteChanges: () => void
  dismissRemoteChanges: () => void

  // 清理
  cleanup: () => void
}

const useUnifiedResumeStore = create<UnifiedResumeState>()(
  persist(
    (set, get) => ({
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

      // 状态
      currentResumeId: null,
      isOnlineMode: false,
      docManager: null,
      docHandle: null,
      isAutomergeInitialized: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      pendingChanges: false,
      hasRemoteChanges: false,
      remoteChangeNotification: null,

      /**
       * 初始化简历
       * - 如果用户已登录，启用 Automerge 在线同步
       * - 如果用户未登录，使用本地 localStorage
       */
      initializeResume: async (resumeId: string) => {
        console.log('🚀 初始化简历', { resumeId })

        set({ currentResumeId: resumeId, syncError: null })

        try {
          // 检查用户是否登录
          const user = await getCurrentUser()

          if (user) {
            console.log('👤 用户已登录，启用 Automerge 同步模式')
            await initializeAutomerge(resumeId, user.id, set)
          }
          else {
            console.log('📴 离线模式，使用本地存储')
            set({ isOnlineMode: false })
          }
        }
        catch (error) {
          console.error('❌ 初始化失败', error)
          set({
            syncError: error instanceof Error ? error.message : '初始化失败',
            isOnlineMode: false, // 降级到离线模式
          })
        }
      },

      /**
       * 更新活动标签页
       */
      updateActiveTabId: newActiveTab => set({ activeTabId: newActiveTab }),

      /**
       * 更新表单数据
       */
      updateForm: (key, data) => {
        const state = get()

        // 更新本地状态
        set(prev => ({
          [key]: { ...prev[key], ...data },
          pendingChanges: true,
        }))

        console.log('📝 表单数据已更新', { key, data })

        // 如果在线模式，同步到 Automerge
        if (state.isOnlineMode && state.docManager) {
          state.docManager.change((doc) => {
            if (!doc[key]) {
              doc[key] = {} as any
            }
            Object.assign(doc[key], data)
          })
        }
      },

      /**
       * 更新顺序
       */
      updateOrder: (newOrder) => {
        const state = get()

        set({ order: newOrder, pendingChanges: true })

        if (state.isOnlineMode && state.docManager) {
          state.docManager.change((doc) => {
            doc.order = newOrder
          })
        }
      },

      /**
       * 切换可见性
       */
      toggleVisibility: (id) => {
        const state = get()
        const newVisibility = !state.visibility[id]

        set(prev => ({
          visibility: { ...prev.visibility, [id]: newVisibility },
          pendingChanges: true,
        }))

        if (state.isOnlineMode && state.docManager) {
          state.docManager.change((doc) => {
            if (!doc.visibility) {
              doc.visibility = {} as any
            }
            doc.visibility[id] = newVisibility
          })
        }
      },

      /**
       * 设置可见性
       */
      setVisibility: (id, isHidden) => {
        const state = get()

        set(prev => ({
          visibility: { ...prev.visibility, [id]: isHidden },
          pendingChanges: true,
        }))

        if (state.isOnlineMode && state.docManager) {
          state.docManager.change((doc) => {
            if (!doc.visibility) {
              doc.visibility = {} as any
            }
            doc.visibility[id] = isHidden
          })
        }
      },

      /**
       * 手动同步
       */
      manualSync: async () => {
        const { docManager, docHandle, isOnlineMode } = get()

        if (!isOnlineMode || !docManager || !docHandle) {
          console.warn('⚠️ 不在在线模式或未初始化，跳过同步')
          return
        }

        set({ isSyncing: true })

        try {
          await docManager.saveToSupabase(docHandle)
          set({
            isSyncing: false,
            lastSyncTime: Date.now(),
            syncError: null,
            pendingChanges: false,
          })
          console.log('✅ 手动同步成功')
        }
        catch (error) {
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : '同步失败',
          })
          console.error('❌ 同步失败', error)
        }
      },

      /**
       * 接受远程变更
       */
      acceptRemoteChanges: () => {
        console.log('✅ 用户接受远程变更')
        set({
          hasRemoteChanges: false,
          remoteChangeNotification: null,
        })
        // 远程变更已经通过 Automerge 自动合并，只需清除通知
      },

      /**
       * 忽略远程变更提醒
       */
      dismissRemoteChanges: () => {
        console.log('⏭️ 用户忽略远程变更提醒')
        set({
          hasRemoteChanges: false,
          remoteChangeNotification: null,
        })
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
          isAutomergeInitialized: false,
          isOnlineMode: false,
          currentResumeId: null,
        })
        console.log('🧹 清理完成')
      },
    }),
    {
      name: 'unified-resume-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // 只持久化必要的数据，排除运行时状态
        basics: state.basics,
        jobIntent: state.jobIntent,
        applicationInfo: state.applicationInfo,
        eduBackground: state.eduBackground,
        workExperience: state.workExperience,
        internshipExperience: state.internshipExperience,
        campusExperience: state.campusExperience,
        projectExperience: state.projectExperience,
        skillSpecialty: state.skillSpecialty,
        honorsCertificates: state.honorsCertificates,
        selfEvaluation: state.selfEvaluation,
        hobbies: state.hobbies,
        activeTabId: state.activeTabId,
        order: state.order,
        visibility: state.visibility,
        currentResumeId: state.currentResumeId,
      }),
    },
  ),
)

/**
 * 初始化 Automerge（在线模式）
 */
async function initializeAutomerge(resumeId: string, userId: string, set: any) {
  console.log('🔄 初始化 Automerge', { resumeId, userId })

  try {
    const manager = new DocumentManager(resumeId, userId)
    const handle = await manager.initialize()

    console.log('✅ Automerge 文档初始化成功', { url: handle.url })

    // 监听远程变更
    handle.on('change', ({ doc, patches, patchInfo }) => {
      if (!doc)
        return

      // 判断是否为远程变更（通过检查 patchInfo）
      const isRemoteChange = patchInfo && typeof patchInfo === 'object' && 'source' in patchInfo

      console.log('🔄 文档变更', {
        patchInfo,
        isRemoteChange,
        patchCount: patches?.length || 0,
      })

      // 如果是远程变更，提醒用户
      if (isRemoteChange && patches && patches.length > 0) {
        const changedFields = extractChangedFields(patches)
        const notification = `检测到远程更新: ${changedFields.join(', ')}`

        console.log('🔔 远程变更提醒', { notification })

        set({
          hasRemoteChanges: true,
          remoteChangeNotification: notification,
        })
      }

      // 更新本地状态（Automerge 已自动合并冲突）
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
    })

    // 初始加载文档数据
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
      isOnlineMode: true,
      isAutomergeInitialized: true,
    })

    console.log('🎉 Automerge 初始化完成')
  }
  catch (error) {
    console.error('❌ Automerge 初始化失败', error)
    throw error
  }
}

/**
 * 从 patches 中提取变更的字段
 */
function extractChangedFields(patches: any[]): string[] {
  const fields = new Set<string>()
  const fieldLabels: Record<string, string> = {
    basics: '基本信息',
    jobIntent: '求职意向',
    applicationInfo: '应聘信息',
    eduBackground: '教育背景',
    workExperience: '工作经历',
    internshipExperience: '实习经历',
    campusExperience: '校园经历',
    projectExperience: '项目经历',
    skillSpecialty: '技能特长',
    honorsCertificates: '荣誉证书',
    selfEvaluation: '自我评价',
    hobbies: '兴趣爱好',
  }

  patches.forEach((patch) => {
    if (patch.path && patch.path.length > 0) {
      const topLevelField = patch.path[0]
      if (fieldLabels[topLevelField]) {
        fields.add(fieldLabels[topLevelField])
      }
    }
  })

  return Array.from(fields)
}

export default useUnifiedResumeStore
