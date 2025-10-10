import type {
  ApplicationInfoForm,
  ApplicationInfoFormExcludeHidden,
  BasicForm,
  JobIntentForm,
  JobIntentFormExcludeHidden,
  ORDERType,
} from '@/lib/schema'
import type { EduBackgroundForm, EduBackgroundFormExcludeHidden } from '@/lib/schema/resume/eduBackground'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_APPLICATION_INFO, DEFAULT_BASICS, DEFAULT_JOB_INTENT, DEFAULT_ORDER } from '@/lib/schema'
import { DEFAULT_EDU_BACKGROUND } from '@/lib/schema/resume/eduBackground'

interface FormDataMap {
  basics: BasicForm
  jobIntent: JobIntentForm
  applicationInfo: ApplicationInfoForm
  eduBackground: EduBackgroundForm
}

interface FormDataUpdateMap {
  basics: BasicForm
  jobIntent: JobIntentFormExcludeHidden
  applicationInfo: ApplicationInfoFormExcludeHidden
  eduBackground: EduBackgroundFormExcludeHidden
}

interface ResumeState extends FormDataMap {
  activeTabId: ORDERType
  order: ORDERType[]
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataUpdateMap>(key: K, data: FormDataUpdateMap[K]) => void
  updateOrder: (newOrder: ORDERType[]) => void
  revertIsHidden: (id: Exclude<ORDERType, 'basics'>) => void
  getIsHidden: (id: Exclude<ORDERType, 'basics'>) => boolean
}

const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      basics: DEFAULT_BASICS,
      jobIntent: DEFAULT_JOB_INTENT,
      applicationInfo: DEFAULT_APPLICATION_INFO,
      eduBackground: DEFAULT_EDU_BACKGROUND,
      order: DEFAULT_ORDER,
      activeTabId: 'basics',
      updateOrder: newOrder => set(() => ({ order: newOrder })),
      updateActiveTabId: newActiveTab => set(() => ({ activeTabId: newActiveTab })),
      updateForm: (key, data) => set(state => ({ [key]: { ...state[key], ...data } })),
      revertIsHidden: id =>
        set(state => ({
          [id]: {
            ...state[id],
            isHidden: !state[id].isHidden,
          },
        })),
      getIsHidden: (id) => {
        const state = get()
        return state[id].isHidden
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 6,
    },
  ),
)

export default useResumeStore
