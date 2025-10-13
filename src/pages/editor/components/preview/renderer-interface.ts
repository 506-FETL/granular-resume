/**
 * 简历渲染器基类
 * 定义了渲染简历各个模块的标准接口
 * 不同的简历模板只需要实现这个接口即可
 */

import type { ReactNode } from 'react'
import type { ResumeFontConfig, ResumeSpacing, ResumeTheme } from './resume-config'
import type {
  ApplicationInfoData,
  BasicsData,
  CampusExperienceData,
  EduBackgroundData,
  HobbiesData,
  HonorsCertificatesData,
  InternshipExperienceData,
  JobIntentData,
  ProjectExperienceData,
  ResumeData,
  SelfEvaluationData,
  SkillSpecialtyData,
  WorkExperienceData,
} from './types'

/**
 * 渲染上下文 - 包含主题、间距、字体等配置
 */
export interface RenderContext {
  theme: ResumeTheme
  spacing: ResumeSpacing
  font: ResumeFontConfig
  age?: number | string // 计算出的年龄,可能是数字或字符串
}

/**
 * 简历渲染器接口
 * 每个模板都需要实现这个接口
 */
export interface IResumeRenderer {
  /**
   * 渲染整个简历
   */
  renderResume(data: ResumeData, context: RenderContext): ReactNode

  /**
   * 渲染基本信息模块
   */
  renderBasics(data: BasicsData, jobIntent: JobIntentData, context: RenderContext): ReactNode

  /**
   * 渲染报考信息模块
   */
  renderApplicationInfo(data: ApplicationInfoData, context: RenderContext): ReactNode

  /**
   * 渲染教育背景模块
   */
  renderEduBackground(data: EduBackgroundData, context: RenderContext): ReactNode

  /**
   * 渲染工作经历模块
   */
  renderWorkExperience(data: WorkExperienceData, context: RenderContext): ReactNode

  /**
   * 渲染实习经验模块
   */
  renderInternshipExperience(data: InternshipExperienceData, context: RenderContext): ReactNode

  /**
   * 渲染项目经验模块
   */
  renderProjectExperience(data: ProjectExperienceData, context: RenderContext): ReactNode

  /**
   * 渲染校园经历模块
   */
  renderCampusExperience(data: CampusExperienceData, context: RenderContext): ReactNode

  /**
   * 渲染技能特长模块
   */
  renderSkillSpecialty(data: SkillSpecialtyData, context: RenderContext): ReactNode

  /**
   * 渲染荣誉证书模块
   */
  renderHonorsCertificates(data: HonorsCertificatesData, context: RenderContext): ReactNode

  /**
   * 渲染自我评价模块
   */
  renderSelfEvaluation(data: SelfEvaluationData, context: RenderContext): ReactNode

  /**
   * 渲染兴趣爱好模块
   */
  renderHobbies(data: HobbiesData, context: RenderContext): ReactNode

  /**
   * 渲染富文本内容
   */
  renderRichText(html: string | undefined, context: RenderContext): ReactNode
}

/**
 * 抽象基类 - 提供一些通用的辅助方法
 */
export abstract class BaseResumeRenderer implements IResumeRenderer {
  abstract renderResume(data: ResumeData, context: RenderContext): ReactNode
  abstract renderBasics(data: BasicsData, jobIntent: JobIntentData, context: RenderContext): ReactNode
  abstract renderApplicationInfo(data: ApplicationInfoData, context: RenderContext): ReactNode
  abstract renderEduBackground(data: EduBackgroundData, context: RenderContext): ReactNode
  abstract renderWorkExperience(data: WorkExperienceData, context: RenderContext): ReactNode
  abstract renderInternshipExperience(data: InternshipExperienceData, context: RenderContext): ReactNode
  abstract renderProjectExperience(data: ProjectExperienceData, context: RenderContext): ReactNode
  abstract renderCampusExperience(data: CampusExperienceData, context: RenderContext): ReactNode
  abstract renderSkillSpecialty(data: SkillSpecialtyData, context: RenderContext): ReactNode
  abstract renderHonorsCertificates(data: HonorsCertificatesData, context: RenderContext): ReactNode
  abstract renderSelfEvaluation(data: SelfEvaluationData, context: RenderContext): ReactNode
  abstract renderHobbies(data: HobbiesData, context: RenderContext): ReactNode
  abstract renderRichText(html: string | undefined, context: RenderContext): ReactNode

  /**
   * 格式化时间段
   */
  protected formatDuration(duration?: [string, string?]): string | undefined {
    if (!duration?.[0]) return undefined
    return `${duration[0]} - ${duration[1] || '至今'}`
  }

  /**
   * 检查内容是否为空
   */
  protected isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    return false
  }

  /**
   * 根据模块类型渲染对应模块
   */
  protected renderModuleByType(moduleType: string, data: ResumeData, context: RenderContext): ReactNode {
    switch (moduleType) {
      case 'basics':
        return this.renderBasics(data.basics, data.jobIntent, context)
      case 'jobIntent':
        return null // 已合并到 basics 中
      case 'applicationInfo':
        return data.applicationInfo.isHidden ? null : this.renderApplicationInfo(data.applicationInfo, context)
      case 'eduBackground':
        return data.eduBackground.isHidden ? null : this.renderEduBackground(data.eduBackground, context)
      case 'workExperience':
        return data.workExperience.isHidden ? null : this.renderWorkExperience(data.workExperience, context)
      case 'internshipExperience':
        return data.internshipExperience.isHidden
          ? null
          : this.renderInternshipExperience(data.internshipExperience, context)
      case 'projectExperience':
        return data.projectExperience.isHidden ? null : this.renderProjectExperience(data.projectExperience, context)
      case 'campusExperience':
        return data.campusExperience.isHidden ? null : this.renderCampusExperience(data.campusExperience, context)
      case 'skillSpecialty':
        return data.skillSpecialty.isHidden ? null : this.renderSkillSpecialty(data.skillSpecialty, context)
      case 'honorsCertificates':
        return data.honorsCertificates.isHidden ? null : this.renderHonorsCertificates(data.honorsCertificates, context)
      case 'selfEvaluation':
        return data.selfEvaluation.isHidden ? null : this.renderSelfEvaluation(data.selfEvaluation, context)
      case 'hobbies':
        return data.hobbies.isHidden ? null : this.renderHobbies(data.hobbies, context)
      default:
        return null
    }
  }
}
