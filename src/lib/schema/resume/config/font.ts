import { z } from 'zod'

/**
 * 字体选项
 */
export const fontFamilyOptions = [
  { label: '系统默认', value: 'system' },
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '楷体', value: 'KaiTi' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
] as const

export const fontFamilyEnum = z.enum([
  'system',
  'Microsoft YaHei',
  'SimSun',
  'SimHei',
  'KaiTi',
  'Arial',
  'Times New Roman',
  'Georgia',
])

/**
 * 文字大小选项
 */
export const fontSizeOptions = [
  { label: '小号 (12px)', value: 12 },
  { label: '正常 (14px)', value: 14 },
  { label: '中等 (16px)', value: 16 },
  { label: '大号 (18px)', value: 18 },
  { label: '特大 (20px)', value: 20 },
] as const

/**
 * 字体配置 Schema
 */
export const fontConfigSchema = z.object({
  // 字体样式
  fontFamily: fontFamilyEnum.default('system'),
  // 文字大小 (单位: px)
  fontSize: z.number().min(10).max(24).default(14),
})

export type FontConfigType = z.infer<typeof fontConfigSchema>

export const DEFAULT_FONT_CONFIG: FontConfigType = {
  fontFamily: 'system',
  fontSize: 14,
}

/**
 * 获取字体的CSS值
 */
export function getFontFamilyCSS(fontFamily: FontConfigType['fontFamily']): string {
  const fallback = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif`

  switch (fontFamily) {
    case 'system':
      return fallback
    case 'SimSun':
      return `'SimSun', '宋体', 'STSong', serif, ${fallback}`
    case 'SimHei':
      return `'SimHei', '黑体', 'STHeiti', 'Microsoft YaHei', sans-serif, ${fallback}`
    case 'KaiTi':
      return `'KaiTi', '楷体', 'STKaiti', 'KaiTi_GB2312', serif, ${fallback}`
    case 'Microsoft YaHei':
      return `'Microsoft YaHei', '微软雅黑', sans-serif, ${fallback}`
    default:
      return `'${fontFamily}', ${fallback}`
  }
}
