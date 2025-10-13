import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ProjectExperienceFormExcludeHidden } from '@/lib/schema/resume/projectExperience'
import {
  DEFAULT_PROJECT_EXPERIENCE,
  projectExperienceFormSchemaExcludeHidden,
} from '@/lib/schema/resume/projectExperience'
import type { ShallowPartial } from '@/lib/utils'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDoorExit } from '@tabler/icons-react'
import { Laptop, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

function ProjectExperienceForm({ className }: { className?: string }) {
  const projectExperience = useResumeStore((state) => state.projectExperience)
  const updateForm = useResumeStore((state) => state.updateForm)
  const isMobile = useIsMobile()

  const form = useForm({
    resolver: zodResolver(projectExperienceFormSchemaExcludeHidden),
    defaultValues: {
      items: projectExperience.items || DEFAULT_PROJECT_EXPERIENCE.items,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm('projectExperience', value as ShallowPartial<ProjectExperienceFormExcludeHidden>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  function onAddItem() {
    append(DEFAULT_PROJECT_EXPERIENCE.items![0])
  }

  return (
    <Form {...form}>
      <form id='project-experience-form' className={cn('space-y-6', className)}>
        {fields.map((item, index) => (
          <motion.div key={item.id} layout>
            {index > 0 && <Separator className='my-6' />}

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium text-muted-foreground'>
                  项目经验
                  {fields.length > 1 ? `#${index + 1}` : ''}
                </h3>
                {fields.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => remove(index)}
                    className='h-8 text-destructive hover:text-destructive'
                  >
                    <Trash2 className='h-4 w-4' />
                    {!isMobile && <span className='ml-1'>删除</span>}
                  </Button>
                )}
              </div>

              <section className='grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                <FormField
                  name={`items.${index}.projectName`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目名称</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入项目名称' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.participantRole`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>参与角色</FormLabel>
                      <FormControl>
                        <Input placeholder='请输入参与角色' {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.projectDuration`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>项目时间</FormLabel>
                      <div className='flex items-center gap-2 flex-wrap sm:flex-nowrap'>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant='outline' className='w-full sm:w-auto justify-start text-left font-normal'>
                              {field.value?.[0] || '开始时间'}
                              <Laptop className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align='start' className='w-auto p-0'>
                            <Calendar
                              mode='single'
                              captionLayout='dropdown'
                              defaultMonth={new Date(field.value?.[0] || '2002-1-1')}
                              disabled={(date) => date > new Date()}
                              selected={field.value?.[0] ? new Date(field.value[0]) : undefined}
                              onSelect={(date) => {
                                field.onChange([date?.toLocaleDateString(), field.value?.[1]])
                              }}
                            />
                          </PopoverContent>
                        </Popover>

                        <span className='text-muted-foreground hidden sm:inline'>-</span>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant='outline' className='w-full sm:w-auto justify-start text-left font-normal'>
                              {field.value?.[1] || '结束时间'}
                              <IconDoorExit className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align='start' className='w-auto p-0'>
                            <Calendar
                              mode='single'
                              captionLayout='dropdown'
                              defaultMonth={new Date(field.value?.[1] || '2002-1-1')}
                              selected={field.value?.[1] ? new Date(field.value[1]) : undefined}
                              disabled={(date) => date > new Date()}
                              onSelect={(date) => {
                                field.onChange([field.value?.[0], date?.toLocaleDateString()])
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                name={`items.${index}.projectInfo`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目经验描述</FormLabel>
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
            </div>
          </motion.div>
        ))}

        <Button
          type='button'
          variant='outline'
          size={isMobile ? 'sm' : 'default'}
          onClick={onAddItem}
          className='w-full sm:w-auto'
        >
          <Plus className='h-4 w-4' />
          {!isMobile && <span className='ml-2'>添加项目经验</span>}
        </Button>
      </form>
    </Form>
  )
}

export default ProjectExperienceForm
