import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { hobbiesFormSchema, PRESET_HOBBIES, type HobbiesFormType } from '@/lib/schema'
import type { ShallowPartial } from '@/lib/utils'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'

function HobbiesForm({ className }: { className?: string }) {
  const hobbies = useResumeStore((state) => state.hobbies)
  const updateForm = useResumeStore((state) => state.updateForm)
  const isMobile = useIsMobile()
  const [customHobbyInput, setCustomHobbyInput] = useState('')

  const form = useForm({
    resolver: zodResolver(hobbiesFormSchema),
    defaultValues: {
      description: hobbies.description || '',
      hobbies: hobbies.hobbies || [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'hobbies',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm('hobbies', value as ShallowPartial<HobbiesFormType>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  // 检查预设爱好是否已添加
  const isPresetHobbyAdded = (hobby: string) => {
    return fields.some((field) => field.name === hobby)
  }

  // 切换预设爱好
  const togglePresetHobby = (hobby: string) => {
    const existingIndex = fields.findIndex((field) => field.name === hobby)
    if (existingIndex >= 0) {
      remove(existingIndex)
    } else {
      append({ name: hobby })
    }
  }

  // 添加自定义爱好
  const addCustomHobby = () => {
    const trimmedValue = customHobbyInput.trim()
    if (!trimmedValue) {
      toast.warning('爱好名称不能为空', {
        description: '请输入有效的爱好名称',
      })
      return
    }

    // 检查是否已存在
    if (fields.some((field) => field.name === trimmedValue)) {
      toast.error('爱好已存在', {
        description: `"${trimmedValue}" 已经添加过了`,
      })
      return
    }

    append({ name: trimmedValue })
    setCustomHobbyInput('')
  }

  return (
    <Form {...form}>
      <form id='hobbies-form'>
        <div className={cn('space-y-6', className)}>
          <FormField
            name='description'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>兴趣爱好描述</FormLabel>
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

          {/* 预设爱好标签 */}
          <div className='space-y-4'>
            <FormLabel>快速添加爱好</FormLabel>
            <div className='flex flex-wrap gap-2'>
              {PRESET_HOBBIES.map((hobby) => (
                <Button
                  key={hobby}
                  type='button'
                  variant={isPresetHobbyAdded(hobby) ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => togglePresetHobby(hobby)}
                  className='h-8'
                >
                  {hobby}
                  {isPresetHobbyAdded(hobby) && <X className='ml-1 h-3 w-3' />}
                </Button>
              ))}
            </div>
          </div>

          {/* 自定义爱好输入 */}
          <div className='space-y-4'>
            <FormLabel>添加自定义爱好</FormLabel>
            <div className='flex gap-2 max-w-md'>
              <Input
                placeholder='输入爱好名称'
                value={customHobbyInput}
                onChange={(e) => setCustomHobbyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomHobby()
                  }
                }}
                className='flex-1'
              />
              <Button type='button' variant='outline' size={isMobile ? 'sm' : 'default'} onClick={addCustomHobby}>
                <Plus className='h-4 w-4' />
                {!isMobile && <span className='ml-2'>添加</span>}
              </Button>
            </div>
          </div>

          {/* 爱好列表 */}
          {fields.length > 0 && (
            <div className='space-y-4'>
              <FormLabel>已添加的爱好</FormLabel>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3'>
                {fields.map((item, index) => {
                  const hobbyValue = form.watch(`hobbies.${index}.name`)
                  return (
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
                      className='flex items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow'
                    >
                      <span className='font-medium text-base truncate flex-1'>{hobbyValue}</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          remove(index)
                        }}
                        className='h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}

export default HobbiesForm
