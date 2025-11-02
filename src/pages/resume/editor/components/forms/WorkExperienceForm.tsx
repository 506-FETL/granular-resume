import type { WorkExperienceFormType } from '@/lib/schema'
import type { ShallowPartial } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDoorExit } from '@tabler/icons-react'
import { Laptop, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { DEFAULT_WORK_EXPERIENCE, workExperienceFormSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

function WorkExperienceForm({ className }: { className?: string }) {
  const workExperience = useResumeStore(state => state.workExperience)
  const [isUptoNow, setIsUptoNow] = useState(() => workExperience.items?.some(item => item.workDuration?.[1] === '至今') || false)
  const updateForm = useResumeStore(state => state.updateForm)
  const isMobile = useIsMobile()

  const form = useForm({
    resolver: zodResolver(workExperienceFormSchema),
    defaultValues: {
      items: workExperience.items || DEFAULT_WORK_EXPERIENCE.items,
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
      updateForm('workExperience', value as ShallowPartial<WorkExperienceFormType>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  function onAddItem() {
    append(DEFAULT_WORK_EXPERIENCE.items![0])
  }

  return (
    <Form {...form}>
      <form id="work-experience-form" className={cn('space-y-6', className)}>
        {fields.map((item, index) => (
          <motion.div key={item.id} layout>
            {index > 0 && <Separator className="my-6" />}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  工作经历
                  {fields.length > 1 ? `#${index + 1}` : ''}
                </h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {!isMobile && <span className="ml-1">删除</span>}
                  </Button>
                )}
              </div>

              <section className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <FormField
                  name={`items.${index}.companyName`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>公司名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入公司名称" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.position`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>职位</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入职位" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.workDuration`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>工作时间</FormLabel>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                              {field.value?.[0] || '入职时间'}
                              <Laptop className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              defaultMonth={new Date(field.value?.[0] || '2002-1-1')}
                              disabled={date => date > new Date()}
                              selected={field.value?.[0] ? new Date(field.value[0]) : undefined}
                              onSelect={(date) => {
                                field.onChange([date?.toLocaleDateString(), field.value?.[1]])
                              }}
                            />
                          </PopoverContent>
                        </Popover>

                        <span className="text-muted-foreground hidden sm:inline">-</span>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button disabled={isUptoNow} variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                              {field.value?.[1] || '离职时间'}
                              <IconDoorExit className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              defaultMonth={new Date(field.value?.[1] || '2002-1-1')}
                              endMonth={new Date(2035, 11)}
                              selected={field.value?.[1] ? new Date(field.value[1]) : undefined}
                              onSelect={(date) => {
                                field.onChange([field.value?.[0], date?.toLocaleDateString()])
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="up-to-now">至今</Label>
                          <Checkbox
                            id="up-to-now"
                            checked={isUptoNow}
                            onCheckedChange={(checked) => {
                              setIsUptoNow(!!checked)
                              if (checked) {
                                field.onChange([field.value?.[0], '至今'])
                              }
                              else {
                                field.onChange([field.value?.[0], ''])
                              }
                            }}
                          />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                name={`items.${index}.workInfo`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>工作描述</FormLabel>
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
          type="button"
          variant="outline"
          size={isMobile ? 'sm' : 'default'}
          onClick={onAddItem}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {!isMobile && <span className="ml-2">添加工作经历</span>}
        </Button>
      </form>
    </Form>
  )
}

export default WorkExperienceForm
