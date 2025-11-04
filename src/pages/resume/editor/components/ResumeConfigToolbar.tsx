import type { PropsWithChildren } from 'react'
import { Palette, Space, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useIsMobile } from '@/hooks/use-mobile'
import { fontFamilyOptions, fontSizeOptions, themeOptions } from '@/lib/schema'
import { cn } from '@/lib/utils'
import useResumeConfigStore from '@/store/resume/config'

export function ResumeConfigToolbar({ children }: PropsWithChildren) {
  const isMobile = useIsMobile()
  const { spacing, font, theme, updateSpacing, updateFont, updateTheme } = useResumeConfigStore()

  return (
    <div className="flex flex-row md:flex-col gap-2 p-2 md:p-4">
      {/* 间距设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? 'icon' : 'default'}
            className={cn(isMobile && 'h-9 w-9')}
          >
            <Space className={cn(isMobile ? 'h-4 w-4' : 'h-4 w-4')} />
            {!isMobile && <span className="ml-2">间距</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn('w-80 max-w-[calc(100vw-2rem)]', isMobile && 'w-[calc(100vw-10rem)]')}
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuLabel className="text-base md:text-sm">间距设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-3 md:p-4 space-y-4 md:space-y-6">
            {/* 模块上下间距 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">模块上下间距</Label>
                <span className="text-sm font-semibold text-muted-foreground">
                  {spacing.sectionSpacing}
                  px
                </span>
              </div>
              <Slider
                value={[spacing.sectionSpacing]}
                onValueChange={([value]) => updateSpacing({ sectionSpacing: value })}
                min={0}
                max={100}
                step={2}
                className="w-full"
              />
            </div>

            {/* 行间距 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">行间距</Label>
                <span className="text-sm font-semibold text-muted-foreground">{spacing.lineHeight.toFixed(1)}</span>
              </div>
              <Slider
                value={[spacing.lineHeight * 10]}
                onValueChange={([value]) => updateSpacing({ lineHeight: value / 10 })}
                min={10}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* 页面边距 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">页面边距</Label>
                <span className="text-sm font-semibold text-muted-foreground">
                  {spacing.pageMargin}
                  px
                </span>
              </div>
              <Slider
                value={[spacing.pageMargin]}
                onValueChange={([value]) => updateSpacing({ pageMargin: value })}
                min={0}
                max={100}
                step={2}
                className="w-full"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 字体设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? 'icon' : 'default'}
            className={cn(isMobile && 'h-9 w-9')}
          >
            <Type className={cn(isMobile ? 'h-4 w-4' : 'h-4 w-4')} />
            {!isMobile && <span className="ml-2">字体</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn('w-80 max-w-[calc(100vw-2rem)]', isMobile && 'w-[calc(100vw-10rem)]')}
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuLabel className="text-base md:text-sm">字体设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-3 md:p-4 space-y-4">
            {/* 字体样式 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">字体样式</Label>
              <Select
                value={font.fontFamily}
                onValueChange={value =>
                  updateFont({
                    fontFamily: value as typeof font.fontFamily,
                  })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="选择字体" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 文字大小 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">文字大小</Label>
              <Select
                value={font.fontSize.toString()}
                onValueChange={value =>
                  updateFont({
                    fontSize: Number.parseInt(value),
                  })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="选择大小" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 皮肤设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={isMobile ? 'icon' : 'default'}
            className={cn(isMobile && 'h-9 w-9')}
          >
            <Palette className={cn(isMobile ? 'h-4 w-4' : 'h-4 w-4')} />
            {!isMobile && <span className="ml-2">皮肤</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={cn('w-80 max-w-[calc(100vw-2rem)]', isMobile && 'w-[calc(100vw-10rem)]')}
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          <DropdownMenuLabel className="text-base md:text-sm">皮肤设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-3 md:p-4 space-y-2">
            <Label className="text-sm font-medium">选择主题</Label>
            <Select
              value={theme.theme}
              onValueChange={value =>
                updateTheme({
                  theme: value as typeof theme.theme,
                })}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {children}
    </div>
  )
}
