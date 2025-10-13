/**
 * 简历样式配置
 * 可以通过修改这个配置文件来统一调整简历的外观
 */

export interface ResumeTheme {
  // 主题颜色
  primaryColor: string // 主题色（标题、边框等）
  secondaryColor: string // 辅助色
  textPrimary: string // 主要文字颜色
  textSecondary: string // 次要文字颜色
  textMuted: string // 弱化文字颜色
  linkColor: string // 链接颜色
  linkHoverColor: string // 链接悬停颜色

  // 背景色
  progressBarBg: string // 进度条背景色
  progressBarFill: string // 进度条填充色
}

export interface ResumeSpacing {
  // 页面边距
  pagePadding: string // 页面内边距

  // 模块间距
  sectionMarginBottom: string // 模块下边距
  sectionTitleMarginBottom: string // 标题下边距

  // 内容间距
  itemSpacing: string // 列表项间距
  paragraphSpacing: string // 段落间距

  // 行间距
  lineHeight: number // 基础行高
  proseLineHeight: number // 富文本行高
}

export interface ResumeFontConfig {
  // 字体族
  fontFamily: string

  // 字体大小
  nameSize: string // 姓名
  jobIntentSize: string // 求职意向
  sectionTitleSize: string // 模块标题
  contentSize: string // 正文内容
  smallSize: string // 小号文字

  // 字重
  boldWeight: number
  mediumWeight: number
  normalWeight: number
}

// 预设主题
export const themes = {
  default: {
    primaryColor: '#111827',
    secondaryColor: '#374151',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    linkColor: '#2563eb',
    linkHoverColor: '#1d4ed8',
    progressBarBg: '#e5e7eb',
    progressBarFill: '#374151',
  },
  blue: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    linkColor: '#2563eb',
    linkHoverColor: '#1d4ed8',
    progressBarBg: '#dbeafe',
    progressBarFill: '#3b82f6',
  },
  green: {
    primaryColor: '#065f46',
    secondaryColor: '#059669',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    linkColor: '#059669',
    linkHoverColor: '#047857',
    progressBarBg: '#d1fae5',
    progressBarFill: '#10b981',
  },
  purple: {
    primaryColor: '#5b21b6',
    secondaryColor: '#7c3aed',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    linkColor: '#7c3aed',
    linkHoverColor: '#6d28d9',
    progressBarBg: '#ede9fe',
    progressBarFill: '#8b5cf6',
  },
  red: {
    primaryColor: '#991b1b',
    secondaryColor: '#dc2626',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    linkColor: '#dc2626',
    linkHoverColor: '#b91c1c',
    progressBarBg: '#fee2e2',
    progressBarFill: '#ef4444',
  },
} as const

// 默认配置
export const defaultTheme: ResumeTheme = themes.default

export const defaultSpacing: ResumeSpacing = {
  pagePadding: '1rem',
  sectionMarginBottom: '1rem',
  sectionTitleMarginBottom: '0.75rem',
  itemSpacing: '0.75rem',
  paragraphSpacing: '0.25rem',
  lineHeight: 1,
  proseLineHeight: 1.6,
}

export const defaultFont: ResumeFontConfig = {
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Microsoft YaHei', sans-serif`,
  nameSize: '1.875rem', // 30px
  jobIntentSize: '1rem', // 16px
  sectionTitleSize: '1rem', // 16px
  contentSize: '0.875rem', // 14px
  smallSize: '0.75rem', // 12px
  boldWeight: 700,
  mediumWeight: 600,
  normalWeight: 400,
}

// 技能熟练度映射
export const skillProficiencyMap = {
  精通: 100,
  擅长: 85,
  熟练: 70,
  良好: 55,
  了解: 40,
} as const
