import type {
  ApplicationInfoForm,
  ApplicationInfoFormExcludeHidden,
  BasicForm,
  JobIntentForm,
  JobIntentFormExcludeHidden,
  ORDERType,
} from '@/lib/schema'
import type { CampusExperienceForm, CampusExperienceFormExcludeHidden } from '@/lib/schema/resume/campusExperience'
import type { EduBackgroundForm, EduBackgroundFormExcludeHidden } from '@/lib/schema/resume/eduBackground'
import type { InternshipExperienceForm, InternshipExperienceFormExcludeHidden } from '@/lib/schema/resume/internshipExperience'
import type { ProjectExperienceForm, ProjectExperienceFormExcludeHidden } from '@/lib/schema/resume/projectExperience'
import type { SkillSpecialtyForm, SkillSpecialtyFormExcludeHidden } from '@/lib/schema/resume/skillSpecialty'
import type { WorkExperienceForm, WorkExperienceFormExcludeHidden } from '@/lib/schema/resume/workExperience'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEFAULT_APPLICATION_INFO, DEFAULT_BASICS, DEFAULT_JOB_INTENT, DEFAULT_ORDER } from '@/lib/schema'
import { DEFAULT_CAMPUS_EXPERIENCE } from '@/lib/schema/resume/campusExperience'
import { DEFAULT_EDU_BACKGROUND } from '@/lib/schema/resume/eduBackground'
import { DEFAULT_INTERNSHIP_EXPERIENCE } from '@/lib/schema/resume/internshipExperience'
import { DEFAULT_PROJECT_EXPERIENCE } from '@/lib/schema/resume/projectExperience'
import { DEFAULT_SKILL_SPECIALTY } from '@/lib/schema/resume/skillSpecialty'
import { DEFAULT_WORK_EXPERIENCE } from '@/lib/schema/resume/workExperience'

interface FormDataMap {
  basics: BasicForm
  jobIntent: JobIntentForm
  applicationInfo: ApplicationInfoForm
  eduBackground: EduBackgroundForm
  workExperience: WorkExperienceForm
  internshipExperience: InternshipExperienceForm
  campusExperience: CampusExperienceForm
  projectExperience: ProjectExperienceForm
  skillSpecialty: SkillSpecialtyForm
}

interface FormDataUpdateMap {
  basics: BasicForm
  jobIntent: JobIntentFormExcludeHidden
  applicationInfo: ApplicationInfoFormExcludeHidden
  eduBackground: EduBackgroundFormExcludeHidden
  workExperience: WorkExperienceFormExcludeHidden
  internshipExperience: InternshipExperienceFormExcludeHidden
  campusExperience: CampusExperienceFormExcludeHidden
  projectExperience: ProjectExperienceFormExcludeHidden
  skillSpecialty: SkillSpecialtyFormExcludeHidden
}

interface ResumeState extends FormDataMap {
  activeTabId: ORDERType
  order: ORDERType[]
  updateActiveTabId: (newActiveTab: ORDERType) => void
  updateForm: <K extends keyof FormDataUpdateMap>(key: K, data: Partial<FormDataUpdateMap[K]>) => void
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
      workExperience: DEFAULT_WORK_EXPERIENCE,
      internshipExperience: DEFAULT_INTERNSHIP_EXPERIENCE,
      campusExperience: DEFAULT_CAMPUS_EXPERIENCE,
      projectExperience: DEFAULT_PROJECT_EXPERIENCE,
      skillSpecialty: DEFAULT_SKILL_SPECIALTY,
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
      version: 7,
    },
  ),
)

export default useResumeStore
