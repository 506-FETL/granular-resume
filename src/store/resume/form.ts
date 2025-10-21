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
import { getResumeById, updateResumeConfig } from '@/lib/supabase/resume'
import { getCurrentUser } from '@/lib/supabase/user'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import useCurrentResumeStore from './current'

// 表单数据映射（纯数据，不包含 isHidden）
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

interface ResumeState extends FormDataMap {
  activeTabId: ORDERType
  order: ORDERType[]
  visibility: { [key in VisibilityItemsType]: boolean }

  // 同步状态
  isSyncing: boolean
  lastSyncTime: number | null
  syncError: string | null
  pendingChanges: boolean

  toggleVisibility: (id: VisibilityItemsType) => void
  getVisibility: (id: VisibilityItemsType) => boolean
  setVisibility: (id: VisibilityItemsType, isHidden: boolean) => void
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataMap>(key: K, data: Partial<FormDataMap[K]>) => void
  updateOrder: (newOrder: ORDERType[]) => void

  // 同步方法
  syncToSupabase: () => Promise<void>
  manualSync: () => Promise<void>
  loadResumeData: (resumeId: string) => Promise<void>
  resetToDefaults: () => void
}

// 防抖同步函数
let syncTimer: number | null = null
const SYNC_DELAY = 3000 // 3秒防抖

const debouncedSync = (syncFn: () => Promise<void>) => {
  if (syncTimer) {
    clearTimeout(syncTimer)
  }
  syncTimer = setTimeout(() => {
    syncFn()
  }, SYNC_DELAY)
}

const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
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
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      pendingChanges: false,

      updateOrder: (newOrder) => {
        set({ order: newOrder, pendingChanges: true })
        debouncedSync(get().syncToSupabase)
      },

      updateActiveTabId: (newActiveTab) => set({ activeTabId: newActiveTab }),

      updateForm: (key, data) => {
        set((state) => ({ [key]: { ...state[key], ...data }, pendingChanges: true }))
        debouncedSync(get().syncToSupabase)
      },

      toggleVisibility: (id) => {
        set((state) => ({
          visibility: { ...state.visibility, [id]: !state.visibility[id] },
          pendingChanges: true,
        }))
        debouncedSync(get().syncToSupabase)
      },

      getVisibility: (id) => get().visibility[id],

      setVisibility: (id, isHidden) => {
        set((state) => ({
          visibility: { ...state.visibility, [id]: isHidden },
          pendingChanges: true,
        }))
        debouncedSync(get().syncToSupabase)
      },

      syncToSupabase: async () => {
        const state = get()
        const resumeId = useCurrentResumeStore.getState().resumeId

        // 没有当前简历ID或正在同步中,跳过
        if (!resumeId || state.isSyncing || !state.pendingChanges) return

        set({ isSyncing: true, syncError: null })

        try {
          const user = await getCurrentUser()

          if (!user) return

          // 准备要保存的数据
          const resumeData = {
            user_id: user.id,
            basics: state.basics,
            job_intent: state.jobIntent,
            application_info: state.applicationInfo,
            edu_background: state.eduBackground,
            work_experience: state.workExperience,
            internship_experience: state.internshipExperience,
            campus_experience: state.campusExperience,
            project_experience: state.projectExperience,
            skill_specialty: state.skillSpecialty,
            honors_certificates: state.honorsCertificates,
            self_evaluation: state.selfEvaluation,
            hobbies: state.hobbies,
            order: state.order,
            visibility: state.visibility,
            updated_at: new Date().toISOString(),
          }

          // 更新现有简历
          await updateResumeConfig(resumeId, resumeData)

          set({
            isSyncing: false,
            lastSyncTime: Date.now(),
            syncError: null,
            pendingChanges: false,
          })
        } catch (error) {
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : '同步失败',
          })
        }
      },

      manualSync: async () => {
        if (syncTimer) {
          clearTimeout(syncTimer)
          syncTimer = null
        }
        await get().syncToSupabase()
      },

      loadResumeData: async (resumeId: string) => {
        const data = await getResumeById(resumeId)

        set({
          basics: data.basics || DEFAULT_BASICS,
          jobIntent: data.job_intent || DEFAULT_JOB_INTENT,
          applicationInfo: data.application_info || DEFAULT_APPLICATION_INFO,
          eduBackground: data.edu_background || DEFAULT_EDU_BACKGROUND,
          workExperience: data.work_experience || DEFAULT_WORK_EXPERIENCE,
          internshipExperience: data.internship_experience || DEFAULT_INTERNSHIP_EXPERIENCE,
          campusExperience: data.campus_experience || DEFAULT_CAMPUS_EXPERIENCE,
          projectExperience: data.project_experience || DEFAULT_PROJECT_EXPERIENCE,
          skillSpecialty: data.skill_specialty || DEFAULT_SKILL_SPECIALTY,
          honorsCertificates: data.honors_certificates || DEFAULT_HONORS_CERTIFICATES,
          selfEvaluation: data.self_evaluation || DEFAULT_SELF_EVALUATION,
          hobbies: data.hobbies || DEFAULT_HOBBIES,
          order: data.order || DEFAULT_ORDER,
          visibility: data.visibility || DEFAULT_VISIBILITY,
          pendingChanges: false,
        })
      },

      resetToDefaults: () => {
        set({
          basics: DEFAULT_BASICS,
          jobIntent: DEFAULT_JOB_INTENT,
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
          order: DEFAULT_ORDER,
          visibility: DEFAULT_VISIBILITY,
          pendingChanges: false,
        })
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 11,
    },
  ),
)

export default useResumeStore
