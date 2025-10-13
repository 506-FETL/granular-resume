/**
 * 简历数据类型定义
 * 这里定义所有简历数据的接口，与渲染方式无关
 */

export interface ResumeData {
  basics: BasicsData
  jobIntent: JobIntentData
  applicationInfo: ApplicationInfoData
  eduBackground: EduBackgroundData
  workExperience: WorkExperienceData
  internshipExperience: InternshipExperienceData
  projectExperience: ProjectExperienceData
  campusExperience: CampusExperienceData
  skillSpecialty: SkillSpecialtyData
  honorsCertificates: HonorsCertificatesData
  selfEvaluation: SelfEvaluationData
  hobbies: HobbiesData
  order: string[]
}

export interface BasicsData {
  name?: string
  gender?: string
  birthMonth?: string
  nation?: string
  maritalStatus?: string
  heightCm?: number
  weightKg?: number
  workYears?: string
  politicalStatus?: string
  nativePlace?: string
  phone?: string
  email?: string
  customFields?: Array<{ label: string; value: string } | null>
}

export interface JobIntentData {
  jobIntent?: string
  intentionalCity?: string
  expectedSalary?: string | number
  dateEntry?: string
  isHidden?: boolean
}

export interface ApplicationInfoData {
  applicationSchool?: string
  applicationMajor?: string
  isHidden?: boolean
}

export interface EduBackgroundData {
  items: Array<{
    schoolName: string
    professional: string
    degree?: string
    duration?: [string, string?]
    eduInfo?: string
  }>
  isHidden?: boolean
}

export interface WorkExperienceData {
  items: Array<{
    companyName: string
    position?: string
    workDuration?: [string, string?]
    workInfo?: string
  }>
  isHidden?: boolean
}

export interface InternshipExperienceData {
  items: Array<{
    companyName: string
    position?: string
    internshipDuration?: [string, string?]
    internshipInfo?: string
  }>
  isHidden?: boolean
}

export interface ProjectExperienceData {
  items: Array<{
    projectName: string
    participantRole?: string
    projectDuration?: [string, string?]
    projectInfo?: string
  }>
  isHidden?: boolean
}

export interface CampusExperienceData {
  items: Array<{
    experienceName: string
    role?: string
    duration?: [string, string?]
    campusInfo?: string
  }>
  isHidden?: boolean
}

export interface SkillSpecialtyData {
  description?: string
  skills?: Array<{
    label: string
    proficiencyLevel: string
    displayType?: 'text' | 'percentage'
  }>
  isHidden?: boolean
}

export interface HonorsCertificatesData {
  description?: string
  certificates?: Array<{
    name: string
  }>
  isHidden?: boolean
}

export interface SelfEvaluationData {
  content?: string
  isHidden?: boolean
}

export interface HobbiesData {
  description?: string
  hobbies?: Array<{
    name: string
  }>
  isHidden?: boolean
}

// 模块类型枚举
export type ModuleType =
  | 'basics'
  | 'jobIntent'
  | 'applicationInfo'
  | 'eduBackground'
  | 'workExperience'
  | 'internshipExperience'
  | 'projectExperience'
  | 'campusExperience'
  | 'skillSpecialty'
  | 'honorsCertificates'
  | 'selfEvaluation'
  | 'hobbies'
