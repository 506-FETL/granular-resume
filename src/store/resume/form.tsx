import type { BasicFormType, JobIntentFormType, ORDERType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_BASICS, DEFAULT_JOB_INTENT } from '@/lib/schema'

interface ResumeState {
  basics: BasicFormType
  jobIntent: JobIntentFormType
  activeTabId: ORDERType
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateBasics: (newBasics: BasicFormType) => void
  updateJobIntent: (newJobIntent: JobIntentFormType) => void
}

const useResumeStore = create<ResumeState>()(
  persist(
    set => ({
      basics: DEFAULT_BASICS,
      jobIntent: DEFAULT_JOB_INTENT,
      activeTabId: 'basics',
      updateActiveTabId: newActiveTab => set(() => ({ activeTabId: newActiveTab })),
      updateJobIntent: newJobIntent => set(state => ({ jobIntent: { ...state.jobIntent, ...newJobIntent } })),
      updateBasics: newBasics => set(state => ({ basics: { ...state.basics, ...newBasics } })),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 4,
    },
  ),
)

export default useResumeStore
