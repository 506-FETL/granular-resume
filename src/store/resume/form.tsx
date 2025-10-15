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
import { createJSONStorage, persist } from 'zustand/middleware'

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
  toggleVisibility: (id: VisibilityItemsType) => void
  getVisibility: (id: VisibilityItemsType) => boolean
  setVisibility: (id: VisibilityItemsType, isHidden: boolean) => void
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataMap>(key: K, data: Partial<FormDataMap[K]>) => void
  updateOrder: (newOrder: ORDERType[]) => void
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
      updateOrder: (newOrder) => set(() => ({ order: newOrder })),
      updateActiveTabId: (newActiveTab) => set(() => ({ activeTabId: newActiveTab })),
      updateForm: (key, data) => set((state) => ({ [key]: { ...state[key], ...data } })),
      toggleVisibility: (id) => set((state) => ({ visibility: { ...state.visibility, [id]: !state.visibility[id] } })),
      getVisibility: (id) => get().visibility[id],
      setVisibility: (id, isHidden) => set((state) => ({ visibility: { ...state.visibility, [id]: isHidden } })),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 11,
    },
  ),
)

export default useResumeStore
