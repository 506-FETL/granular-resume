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
import useResumeConfigStore from '@/store/resume/config'
import { Palette, Space, Type } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ResumeConfigToolbar() {
  const isMobile = useIsMobile()
  const { spacing, font, theme, updateSpacing, updateFont, updateTheme } = useResumeConfigStore()

  return (
    <div className='flex flex-row md:flex-col gap-2 p-4'>
      {/* 间距设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size={isMobile ? 'icon' : 'default'}
            className={cn('shadow-md', isMobile && 'h-10 w-10')}
          >
            <Space className='h-4 w-4' />
            {!isMobile && <span className='ml-2'>间距</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80' side='right' align='start'>
          <DropdownMenuLabel>间距设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className='p-4 space-y-6'>
            {/* 模块上下间距 */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm'>模块上下间距</Label>
                <span className='text-sm text-muted-foreground'>{spacing.sectionSpacing}px</span>
              </div>
              <Slider
                value={[spacing.sectionSpacing]}
                onValueChange={([value]) => updateSpacing({ sectionSpacing: value })}
                min={0}
                max={100}
                step={2}
                className='w-full'
              />
            </div>

            {/* 行间距 */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm'>行间距</Label>
                <span className='text-sm text-muted-foreground'>{spacing.lineHeight.toFixed(1)}</span>
              </div>
              <Slider
                value={[spacing.lineHeight * 10]}
                onValueChange={([value]) => updateSpacing({ lineHeight: value / 10 })}
                min={10}
                max={30}
                step={1}
                className='w-full'
              />
            </div>

            {/* 页面边距 */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-sm'>页面边距</Label>
                <span className='text-sm text-muted-foreground'>{spacing.pageMargin}px</span>
              </div>
              <Slider
                value={[spacing.pageMargin]}
                onValueChange={([value]) => updateSpacing({ pageMargin: value })}
                min={0}
                max={100}
                step={2}
                className='w-full'
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 字体设置 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size={isMobile ? 'icon' : 'default'}
            className={cn('shadow-md', isMobile && 'h-10 w-10')}
          >
            <Type className='h-4 w-4' />
            {!isMobile && <span className='ml-2'>字体</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80' side='right' align='start'>
          <DropdownMenuLabel>字体设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className='p-4 space-y-4'>
            {/* 字体样式 */}
            <div className='space-y-2'>
              <Label className='text-sm'>字体样式</Label>
              <Select
                value={font.fontFamily}
                onValueChange={(value) =>
                  updateFont({
                    fontFamily: value as typeof font.fontFamily,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择字体' />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 文字大小 */}
            <div className='space-y-2'>
              <Label className='text-sm'>文字大小</Label>
              <Select
                value={font.fontSize.toString()}
                onValueChange={(value) =>
                  updateFont({
                    fontSize: parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择大小' />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((option) => (
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
            variant='outline'
            size={isMobile ? 'icon' : 'default'}
            className={cn('shadow-md', isMobile && 'h-10 w-10')}
          >
            <Palette className='h-4 w-4' />
            {!isMobile && <span className='ml-2'>皮肤</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-80' side='right' align='start'>
          <DropdownMenuLabel>皮肤设置</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className='p-4 space-y-2'>
            <Label className='text-sm'>选择主题</Label>
            <Select
              value={theme.theme}
              onValueChange={(value) =>
                updateTheme({
                  theme: value as typeof theme.theme,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='选择主题' />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
