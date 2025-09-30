import type { BasicFormType } from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_BASICS } from '@/lib/schema'

interface ResumeState {
  basics: BasicFormType
  updateBasics: (newBasics: BasicFormType) => void
}

const useResumeStore = create<ResumeState>()(
  persist(
    set => ({
      basics: DEFAULT_BASICS,
      updateBasics: newBasics => set(state => ({ basics: { ...state.basics, ...newBasics } })),
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useResumeStore
