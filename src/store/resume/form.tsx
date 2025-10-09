import type { ApplicationInfoFormExcludeHidden, ApplicationInfoFormType, BasicFormType, JobIntentFormExcludeHidden, JobIntentFormType, ORDERType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_APPLICATION_INFO, DEFAULT_BASICS, DEFAULT_JOB_INTENT, DEFAULT_ORDER } from '@/lib/schema'

interface ResumeState {
  basics: BasicFormType
  jobIntent: JobIntentFormType
  applicationInfo: ApplicationInfoFormType
  activeTabId: ORDERType
  order: ORDERType[]
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateBasics: (newBasics: BasicFormType) => void
  updateJobIntent: (newJobIntent: JobIntentFormExcludeHidden) => void
  updateApplicationInfo: (newApplicationInfo: ApplicationInfoFormExcludeHidden) => void
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
      order: DEFAULT_ORDER,
      activeTabId: 'basics',
      updateOrder: newOrder => set(() => ({ order: newOrder })),
      updateActiveTabId: newActiveTab => set(() => ({ activeTabId: newActiveTab })),
      updateJobIntent: newJobIntent => set(state => ({ jobIntent: { ...state.jobIntent, ...newJobIntent } })),
      updateBasics: newBasics => set(state => ({ basics: { ...state.basics, ...newBasics } })),
      updateApplicationInfo: newApplicationInfo => set(state => ({ applicationInfo: { ...state.applicationInfo, ...newApplicationInfo } })),
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
