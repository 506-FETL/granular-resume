import type {
  DisplayType,
  ProficiencyLevel,
  SkillSpecialtyFormExcludeHidden,
} from '@/lib/schema/resume/skillSpecialty'
import type { ShallowPartial } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  PRESET_SKILLS,
  PROFICIENCY_PERCENTAGE_MAP,
  skillSpecialtyFormSchemaExcludeHidden,
} from '@/lib/schema/resume/skillSpecialty'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

const proficiencyLevels: ProficiencyLevel[] = ['一般', '良好', '熟练', '擅长', '精通']
const displayTypes: { value: DisplayType, label: string }[] = [
  { value: 'text', label: '文字' },
  { value: 'percentage', label: '百分比' },
]

function SkillSpecialtyForm({ className }: { className?: string }) {
  const skillSpecialty = useResumeStore(state => state.skillSpecialty)
  const updateForm = useResumeStore(state => state.updateForm)
  const isMobile = useIsMobile()
  const [customSkillInput, setCustomSkillInput] = useState('')

  const form = useForm({
    resolver: zodResolver(skillSpecialtyFormSchemaExcludeHidden),
    defaultValues: {
      description: skillSpecialty.description || '',
      skills: skillSpecialty.skills || [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'skills',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm('skillSpecialty', value as ShallowPartial<SkillSpecialtyFormExcludeHidden>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  // 检查预设技能是否已添加
  const isPresetSkillAdded = (skillLabel: string) => {
    return fields.some(field => field.label === skillLabel)
  }

  // 切换预设技能
  const togglePresetSkill = (skillLabel: string) => {
    const existingIndex = fields.findIndex(field => field.label === skillLabel)
    if (existingIndex >= 0) {
      remove(existingIndex)
    }
    else {
      append({
        label: skillLabel,
        proficiencyLevel: '熟练',
        displayType: 'percentage',
      })
    }
  }

  // 添加自定义技能
  const addCustomSkill = () => {
    const trimmedLabel = customSkillInput.trim()
    if (!trimmedLabel) {
      toast.warning('技能名称不能为空', {
        description: '请输入有效的技能名称',
      })
      return
    }

    // 检查是否已存在
    if (fields.some(field => field.label === trimmedLabel)) {
      toast.error('技能已存在', {
        description: `"${trimmedLabel}" 已经添加过了`,
      })
      return
    }

    append({
      label: trimmedLabel,
      proficiencyLevel: '熟练',
      displayType: 'percentage',
    })
    setCustomSkillInput('')
  }

  return (
    <Form {...form}>
      <form id="skill-specialty-form" className={cn('space-y-6', className)}>
        {/* 技能特长描述 */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>技能特长描述</FormLabel>
              <FormControl>
                <SimpleEditor
                  content={field.value || ''}
                  onChange={(editor) => {
                    field.onChange(editor.getHTML())
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        {/* 预设技能标签 */}
        <div className="space-y-4">
          <FormLabel>快速添加技能</FormLabel>
          <div className="flex flex-wrap gap-2">
            {PRESET_SKILLS.map(skill => (
              <Button
                key={skill}
                type="button"
                variant={isPresetSkillAdded(skill) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePresetSkill(skill)}
                className="h-8"
              >
                {skill}
                {isPresetSkillAdded(skill) && <X className="ml-1 h-3 w-3" />}
              </Button>
            ))}
          </div>
        </div>

        {/* 自定义技能输入 */}
        <div className="space-y-4">
          <FormLabel>添加自定义技能</FormLabel>
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="输入技能名称"
              value={customSkillInput}
              onChange={e => setCustomSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCustomSkill()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size={isMobile ? 'sm' : 'default'}
              onClick={addCustomSkill}
            >
              <Plus className="h-4 w-4" />
              {!isMobile && <span className="ml-2">添加</span>}
            </Button>
          </div>
        </div>

        {/* 技能列表 */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <FormLabel>技能列表</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fields.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -20 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  layout
                  className="flex flex-col gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  {/* 技能标签和删除按钮 */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-base truncate">{item.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 熟练程度和展示方式 */}
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      name={`skills.${index}.proficiencyLevel`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs text-muted-foreground">熟练程度</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {proficiencyLevels.map(level => (
                                  <SelectItem key={level} value={level}>
                                    {level}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      name={`skills.${index}.displayType`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs text-muted-foreground">展示方式</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {displayTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 显示预览 */}
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <span className="text-sm font-semibold text-primary">
                      {(() => {
                        const proficiency = form.watch(`skills.${index}.proficiencyLevel`)
                        const displayTypeValue = form.watch(`skills.${index}.displayType`)
                        return displayTypeValue === 'percentage' && proficiency
                          ? `${PROFICIENCY_PERCENTAGE_MAP[proficiency]}%`
                          : proficiency || '熟练'
                      })()}
                    </span>
                    <Progress
                      value={PROFICIENCY_PERCENTAGE_MAP[form.watch(`skills.${index}.proficiencyLevel`)!]}
                      className="h-2"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Form>
  )
}

export default SkillSpecialtyForm
