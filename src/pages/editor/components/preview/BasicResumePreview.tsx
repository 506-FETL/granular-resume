/**
 * 基础简历预览组件 - 使用新的渲染器架构
 *
 * 使用说明:
 * 1. 一键切换主题: 修改 ACTIVE_THEME = 'default' | 'blue' | 'green' | 'purple' | 'red'
 * 2. 一键调整间距: 修改 CUSTOM_SPACING 对象
 * 3. 一键更换字体: 修改 CUSTOM_FONT 对象
 * 4. 创建新模板: 实现 IResumeRenderer 接口,然后替换 BasicTemplateRenderer
 */

import useAge from '@/hooks/useAge'
import useResumeStore from '@/store/resume/form'
import type { RenderContext } from './renderer-interface'
import { defaultFont, defaultSpacing, themes, type ResumeFontConfig, type ResumeSpacing } from './resume-config'
import { BasicTemplateRenderer } from './templates/BasicTemplate'
import type { ResumeData } from './types'

// ============ 配置区 - 一键修改主题/间距/字体 ============
const ACTIVE_THEME: keyof typeof themes = 'green' // 可选: default, blue, green, purple, red
const CUSTOM_SPACING: Partial<ResumeSpacing> = {} // 可以覆盖默认间距,例如: { pagePadding: '40mm' }
const CUSTOM_FONT: Partial<ResumeFontConfig> = {} // 可以覆盖默认字体,例如: { nameSize: '2.5rem' }

// 创建渲染器实例(模块级别,只创建一次)
const renderer = new BasicTemplateRenderer()

function BasicResumePreview() {
  // 从 store 获取数据
  const storeData = useResumeStore()
  const age = useAge(storeData.basics.birthMonth)

  // 合并配置
  const theme = themes[ACTIVE_THEME]
  const spacing: ResumeSpacing = { ...defaultSpacing, ...CUSTOM_SPACING }
  const font: ResumeFontConfig = { ...defaultFont, ...CUSTOM_FONT }

  // 准备渲染上下文
  const context: RenderContext = {
    theme,
    spacing,
    font,
    age,
  }

  // 将 store 数据转换为 ResumeData 格式
  const resumeData: ResumeData = {
    basics: storeData.basics,
    jobIntent: storeData.jobIntent,
    applicationInfo: storeData.applicationInfo,
    eduBackground: storeData.eduBackground,
    workExperience: storeData.workExperience,
    internshipExperience: storeData.internshipExperience,
    campusExperience: storeData.campusExperience,
    projectExperience: storeData.projectExperience,
    skillSpecialty: storeData.skillSpecialty,
    honorsCertificates: storeData.honorsCertificates,
    selfEvaluation: storeData.selfEvaluation,
    hobbies: storeData.hobbies,
    order: storeData.order,
  } as ResumeData

  // 使用渲染器渲染简历
  return <>{renderer.renderResume(resumeData, context)}</>
}

export default BasicResumePreview
