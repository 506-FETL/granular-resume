import type { ApplicationInfoFormType, BasicFormType, JobIntentFormType, ORDERType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_APPLICATION_INFO, DEFAULT_BASICS, DEFAULT_JOB_INTENT } from '@/lib/schema'

interface ResumeState {
  basics: BasicFormType
  jobIntent: JobIntentFormType
  applicationInfo: ApplicationInfoFormType
  activeTabId: ORDERType
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateBasics: (newBasics: BasicFormType) => void
  updateJobIntent: (newJobIntent: JobIntentFormType) => void
  updateApplicationInfo: (newApplicationInfo: ApplicationInfoFormType) => void
}

const useResumeStore = create<ResumeState>()(
  persist(
    set => ({
      basics: DEFAULT_BASICS,
      jobIntent: DEFAULT_JOB_INTENT,
      applicationInfo: DEFAULT_APPLICATION_INFO,
      activeTabId: 'basics',
      updateActiveTabId: newActiveTab => set(() => ({ activeTabId: newActiveTab })),
      updateJobIntent: newJobIntent => set(() => ({ jobIntent: newJobIntent })),
      updateBasics: newBasics => set(() => ({ basics: newBasics })),
      updateApplicationInfo: newApplicationInfo => set(() => ({ applicationInfo: newApplicationInfo })),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 5,
    },
  ),
)

export default useResumeStore
