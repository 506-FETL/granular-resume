import type { BasicFormType, JobIntentFormType, ORDERType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_BASICS, DEFAULT_JOB_INTENT, DEFAULT_ORDER } from '@/lib/schema'

interface ResumeState {
  basics: BasicFormType
  jobIntent: JobIntentFormType
  order: ORDERType[]
  updateBasics: (newBasics: BasicFormType) => void
  updateJobIntent: (newJobIntent: JobIntentFormType) => void
  updateOrder: (newOrder: ORDERType[]) => void
}

const useResumeStore = create<ResumeState>()(
  persist(
    set => ({
      basics: DEFAULT_BASICS,
      jobIntent: DEFAULT_JOB_INTENT,
      order: DEFAULT_ORDER,
      updateJobIntent: newJobIntent => set(state => ({ jobIntent: { ...state.jobIntent, ...newJobIntent } })),
      updateBasics: newBasics => set(state => ({ basics: { ...state.basics, ...newBasics } })),
      updateOrder: newOrder => set(() => ({ order: newOrder })),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      version: 3,
    },
  ),
)

export default useResumeStore
