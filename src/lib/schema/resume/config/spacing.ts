import { z } from 'zod'

/**
 * 间距配置 Schema
 */
export const spacingConfigSchema = z.object({
  // 模块上下间距 (单位: px)
  sectionSpacing: z.number().min(0).max(100).default(20),
  // 行间距 (倍数)
  lineHeight: z.number().min(1).max(3).default(1.6),
  // 页面边距 (单位: px)
  pageMargin: z.number().min(0).max(100).default(16),
})

export type SpacingConfigType = z.infer<typeof spacingConfigSchema>

export const DEFAULT_SPACING_CONFIG: SpacingConfigType = {
  sectionSpacing: 20,
  lineHeight: 1.6,
  pageMargin: 16,
}
