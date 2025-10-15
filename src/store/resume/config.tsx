import {
  DEFAULT_FONT_CONFIG,
  DEFAULT_SPACING_CONFIG,
  DEFAULT_THEME_CONFIG,
  type FontConfigType,
  type SpacingConfigType,
  type ThemeConfigType,
} from '@/lib/schema'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ResumeConfigState {
  // 间距配置
  spacing: SpacingConfigType
  // 字体配置
  font: FontConfigType
  // 主题配置
  theme: ThemeConfigType

  // 更新间距配置
  updateSpacing: (data: Partial<SpacingConfigType>) => void
  // 更新字体配置
  updateFont: (data: Partial<FontConfigType>) => void
  // 更新主题配置
  updateTheme: (data: Partial<ThemeConfigType>) => void
  // 重置所有配置
  resetConfig: () => void
}

const useResumeConfigStore = create<ResumeConfigState>()(
  persist(
    (set) => ({
      spacing: DEFAULT_SPACING_CONFIG,
      font: DEFAULT_FONT_CONFIG,
      theme: DEFAULT_THEME_CONFIG,

      updateSpacing: (data) => set((state) => ({ spacing: { ...state.spacing, ...data } })),
      updateFont: (data) => set((state) => ({ font: { ...state.font, ...data } })),
      updateTheme: (data) => set((state) => ({ theme: { ...state.theme, ...data } })),
      resetConfig: () =>
        set({
          spacing: DEFAULT_SPACING_CONFIG,
          font: DEFAULT_FONT_CONFIG,
          theme: DEFAULT_THEME_CONFIG,
        }),
    }),
    {
      name: 'resume-config-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

export default useResumeConfigStore
