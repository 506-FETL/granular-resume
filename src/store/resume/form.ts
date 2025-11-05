import type { DocHandle } from '@automerge/automerge-repo'
import type { AutomergeResumeDocument } from '@/lib/automerge/schema'
import type { ApplicationInfoFormType, BasicFormType, CampusExperienceFormType, EduBackgroundFormType, HobbiesFormType, HonorsCertificatesFormType, InternshipExperienceFormType, JobIntentFormType, ORDERType, ProjectExperienceFormType, SelfEvaluationFormType, SkillSpecialtyFormType, VisibilityItemsType, WorkExperienceFormType } from '@/lib/schema'
import { create } from 'zustand'
import { DocumentManager } from '@/lib/automerge/document-manager'
import {
  getOfflineResumeById,
  isOfflineResumeId,
  updateOfflineResume,
} from '@/lib/offline-resume-manager'
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
import useCurrentResumeStore from './current'

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

type EditorMode = 'online' | 'offline' | null

interface ResumeState extends FormDataMap {
  activeTabId: ORDERType
  order: ORDERType[]
  visibility: Record<VisibilityItemsType, boolean>
  type: 'basic' | 'modern' | 'simple'

  isSyncing: boolean
  lastSyncTime: number | null
  syncError: string | null
  pendingChanges: boolean

  mode: EditorMode
  currentResumeId: string | null
  docManager: DocumentManager | null
  docHandle: DocHandle<AutomergeResumeDocument> | null
  cleanupFns: Array<() => void>
  isInitialized: boolean

  toggleVisibility: (id: VisibilityItemsType) => void
  changeType: (type: 'basic' | 'modern' | 'simple') => void
  getVisibility: (id: VisibilityItemsType) => boolean
  setVisibility: (id: VisibilityItemsType, isHidden: boolean) => void
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataMap>(key: K, data: Partial<FormDataMap[K]>) => void
  updateOrder: (newOrder: ORDERType[]) => void

  syncToSupabase: () => Promise<void>
  manualSync: () => Promise<void>
  loadResumeData: (resumeId: string, options?: { documentUrl?: string }) => Promise<void>
  resetToDefaults: () => void
  cleanup: () => void
}

let syncTimer: ReturnType<typeof setTimeout> | null = null
const SYNC_DELAY = 3000

function scheduleOfflinePersist(flushFn: () => Promise<void>) {
  if (syncTimer) {
    clearTimeout(syncTimer)
  }
  syncTimer = setTimeout(() => {
    void flushFn()
  }, SYNC_DELAY)
}

const useResumeStore = create<ResumeState>()((set, get) => ({
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
  type: 'basic',

  isSyncing: false,
  lastSyncTime: null,
  syncError: null,
  pendingChanges: false,

  mode: null,
  currentResumeId: null,
  docManager: null,
  docHandle: null,
  cleanupFns: [],
  isInitialized: false,

  updateActiveTabId: newActiveTab => set({ activeTabId: newActiveTab }),

  updateForm: (key, data) => {
    const state = get()
    const sanitized = sanitizeDeep(data)
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId

    if (!resumeId || state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      set(prev => ({
        [key]: { ...prev[key], ...sanitized },
        pendingChanges: true,
      }))
      scheduleOfflinePersist(() => get().syncToSupabase())
      return
    }

    set(prev => ({
      [key]: { ...prev[key], ...sanitized },
      pendingChanges: true,
    }))

    state.docManager?.change((doc) => {
      if (!doc[key]) {
        doc[key] = {} as any
      }
      applyPatch(doc[key], sanitized)
    })
  },

  updateOrder: (newOrder) => {
    const state = get()
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId

    if (!resumeId || state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      set({ order: newOrder, pendingChanges: true })
      scheduleOfflinePersist(() => get().syncToSupabase())
      return
    }

    set({ order: newOrder, pendingChanges: true })
    state.docManager?.change((doc) => {
      doc.order = [...newOrder]
    })
  },

  changeType: (type) => {
    const state = get()
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId

    if (!resumeId || state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      set({ type, pendingChanges: true })
      scheduleOfflinePersist(() => get().syncToSupabase())
      return
    }

    set({ type, pendingChanges: true })
    state.docManager?.change((doc) => {
      doc.type = type
    })
  },

  toggleVisibility: (id) => {
    const state = get()
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId
    const nextValue = !state.visibility[id]

    if (!resumeId || state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      set(prev => ({
        visibility: { ...prev.visibility, [id]: nextValue },
        pendingChanges: true,
      }))
      scheduleOfflinePersist(() => get().syncToSupabase())
      return
    }

    set(prev => ({
      visibility: { ...prev.visibility, [id]: nextValue },
      pendingChanges: true,
    }))

    state.docManager?.change((doc) => {
      if (!doc.visibility) {
        doc.visibility = {} as any
      }
      doc.visibility[id] = nextValue
    })
  },

  getVisibility: id => get().visibility[id],

  setVisibility: (id, isHidden) => {
    const state = get()
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId

    if (!resumeId || state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      set(prev => ({
        visibility: { ...prev.visibility, [id]: isHidden },
        pendingChanges: true,
      }))
      scheduleOfflinePersist(() => get().syncToSupabase())
      return
    }

    set(prev => ({
      visibility: { ...prev.visibility, [id]: isHidden },
      pendingChanges: true,
    }))

    state.docManager?.change((doc) => {
      if (!doc.visibility) {
        doc.visibility = {} as any
      }
      doc.visibility[id] = isHidden
    })
  },

  syncToSupabase: async () => {
    const state = get()
    const resumeId = state.currentResumeId ?? useCurrentResumeStore.getState().resumeId

    if (!resumeId) {
      return
    }

    set({ isSyncing: true })

    if (state.mode === 'offline' || isOfflineResumeId(resumeId)) {
      try {
        await updateOfflineResume(resumeId, buildOfflinePayload(state))
        set({
          pendingChanges: false,
          isSyncing: false,
          syncError: null,
          lastSyncTime: Date.now(),
        })
      }
      catch (error) {
        set({
          isSyncing: false,
          syncError: error instanceof Error ? error.message : '同步失败',
        })
      }
      return
    }

    if (!state.docManager || !state.docHandle) {
      return
    }

    set({ isSyncing: true })
    try {
      await state.docManager.saveToSupabase(state.docHandle)
    }
    catch (error) {
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

  loadResumeData: async (resumeId: string, options?: { documentUrl?: string }) => {
    const { docManager, cleanupFns } = get()

    if (cleanupFns.length > 0) {
      cleanupFns.forEach(fn => fn())
    }
    if (docManager) {
      docManager.destroy()
    }

    set({
      isSyncing: true,
      syncError: null,
      pendingChanges: false,
      docManager: null,
      docHandle: null,
      cleanupFns: [],
      currentResumeId: resumeId,
      mode: isOfflineResumeId(resumeId) ? 'offline' : 'online',
      isInitialized: false,
    })

    if (isOfflineResumeId(resumeId)) {
      const offlineResume = await getOfflineResumeById(resumeId)
      if (!offlineResume) {
        throw new Error('离线简历不存在')
      }

      const data = offlineResume.data || {}

      set({
        ...mapDocToState(data as Partial<AutomergeResumeDocument>),
        isSyncing: false,
        pendingChanges: false,
        syncError: null,
        mode: 'offline',
        isInitialized: true,
        lastSyncTime: offlineResume.updated_at ? new Date(offlineResume.updated_at).getTime() : null,
      })
      return
    }

    const user = await getCurrentUser()
    if (!user) {
      throw new Error('用户未登录')
    }

    try {
      const manager = new DocumentManager(resumeId, user.id, {
        sharedDocumentUrl: options?.documentUrl,
      })
      const handle = await manager.initialize()
      const doc = handle.doc()

      const changeHandler = ({ doc }: { doc: AutomergeResumeDocument | null }) => {
        if (!doc)
          return

        set(prev => ({
          ...prev,
          ...mapDocToState(doc),
          isInitialized: true,
        }))
      }

      handle.on('change', changeHandler as any)
      const offChange = () => handle.off('change', changeHandler as any)

      const offSaveStart = manager.onSaveStart(() => {
        set({ isSyncing: true })
      })

      const offSave = manager.onSaveResult(({ success, error }) => {
        if (success) {
          set({
            isSyncing: false,
            pendingChanges: false,
            syncError: null,
            lastSyncTime: Date.now(),
          })
        }
        else {
          set({
            isSyncing: false,
            syncError: error instanceof Error ? error.message : '同步失败',
          })
        }
      })

      set({
        ...mapDocToState(doc),
        docManager: manager,
        docHandle: handle,
        cleanupFns: [offChange, offSaveStart, offSave],
        isSyncing: false,
        pendingChanges: false,
        syncError: null,
        mode: 'online',
        isInitialized: true,
      })
    }
    catch (error) {
      set({
        isSyncing: false,
        syncError: error instanceof Error ? error.message : '初始化失败',
        mode: 'online',
      })
      throw error
    }
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
      pendingChanges: true,
    })

    const state = get()
    if (state.mode === 'offline' || (state.currentResumeId && isOfflineResumeId(state.currentResumeId))) {
      scheduleOfflinePersist(() => get().syncToSupabase())
    }
    else {
      state.docManager?.change((doc) => {
        Object.assign(doc, mapDocToState(null))
      })
    }
  },

  cleanup: () => {
    const { cleanupFns, docManager } = get()
    cleanupFns.forEach(fn => fn())
    docManager?.destroy()
    if (syncTimer) {
      clearTimeout(syncTimer)
      syncTimer = null
    }
    set({
      cleanupFns: [],
      docManager: null,
      docHandle: null,
      mode: null,
      currentResumeId: null,
      isInitialized: false,
    })
  },
}))

function sanitizeDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => sanitizeDeep(item)) as unknown as T
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
      if (val === undefined)
        return
      result[key] = sanitizeDeep(val)
    })
    return result as T
  }
  return value
}

function applyPatch(target: Record<string, any>, patch: Partial<Record<string, any>>) {
  Object.entries(patch).forEach(([field, value]) => {
    if (value === undefined)
      return
    target[field] = value
  })
}

function mapDocToState(doc: Partial<AutomergeResumeDocument> | null | undefined) {
  const source = doc as Record<string, any> | undefined
  return {
    basics: sanitizeDeep((source?.basics as BasicFormType | undefined) || DEFAULT_BASICS),
    jobIntent: sanitizeDeep(
      (source?.jobIntent as JobIntentFormType | undefined) || source?.job_intent || DEFAULT_JOB_INTENT,
    ),
    applicationInfo: sanitizeDeep(
      (source?.applicationInfo as ApplicationInfoFormType | undefined) || source?.application_info || DEFAULT_APPLICATION_INFO,
    ),
    eduBackground: sanitizeDeep(
      (source?.eduBackground as EduBackgroundFormType | undefined) || source?.edu_background || DEFAULT_EDU_BACKGROUND,
    ),
    workExperience: sanitizeDeep(
      (source?.workExperience as WorkExperienceFormType | undefined) || source?.work_experience || DEFAULT_WORK_EXPERIENCE,
    ),
    internshipExperience: sanitizeDeep(
      (source?.internshipExperience as InternshipExperienceFormType | undefined)
      || source?.internship_experience
      || DEFAULT_INTERNSHIP_EXPERIENCE,
    ),
    campusExperience: sanitizeDeep(
      (source?.campusExperience as CampusExperienceFormType | undefined)
      || source?.campus_experience
      || DEFAULT_CAMPUS_EXPERIENCE,
    ),
    projectExperience: sanitizeDeep(
      (source?.projectExperience as ProjectExperienceFormType | undefined)
      || source?.project_experience
      || DEFAULT_PROJECT_EXPERIENCE,
    ),
    skillSpecialty: sanitizeDeep(
      (source?.skillSpecialty as SkillSpecialtyFormType | undefined)
      || source?.skill_specialty
      || DEFAULT_SKILL_SPECIALTY,
    ),
    honorsCertificates: sanitizeDeep(
      (source?.honorsCertificates as HonorsCertificatesFormType | undefined)
      || source?.honors_certificates
      || DEFAULT_HONORS_CERTIFICATES,
    ),
    selfEvaluation: sanitizeDeep(
      (source?.selfEvaluation as SelfEvaluationFormType | undefined)
      || source?.self_evaluation
      || DEFAULT_SELF_EVALUATION,
    ),
    hobbies: sanitizeDeep((source?.hobbies as HobbiesFormType | undefined) || DEFAULT_HOBBIES),
    order: sanitizeDeep((source?.order as ORDERType[] | undefined) || source?.order || DEFAULT_ORDER),
    visibility: sanitizeDeep(
      (source?.visibility as Record<VisibilityItemsType, boolean> | undefined) || DEFAULT_VISIBILITY,
    ),
    type: source?.type || 'basic',
  }
}

function buildOfflinePayload(state: ResumeState) {
  return {
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
    order: state.order,
    visibility: state.visibility,
    type: state.type,
  }
}

export default useResumeStore
