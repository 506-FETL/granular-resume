import type { Degree, EduBackgroundFormExcludeHidden } from '@/lib/schema/resume/eduBackground'
import type { ShallowPartial } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMichelinBibGourmand } from '@tabler/icons-react'
import { Baby, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { DEFAULT_EDU_BACKGROUND, eduBackgroundFormSchemaExcludeHidden } from '@/lib/schema/resume/eduBackground'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

const degreeOptions: Degree[] = ['不填', '初中', '高中', '中专', '大专', '本科', '学士', '硕士', '博士', 'MBA', 'EMBA', '其他']

function EduBackgroundForm({ className }: { className?: string }) {
  const eduBackground = useResumeStore(state => state.eduBackground)
  const updateForm = useResumeStore(state => state.updateForm)
  const isMobile = useIsMobile()

  const form = useForm({
    resolver: zodResolver(eduBackgroundFormSchemaExcludeHidden),
    defaultValues: {
      items: eduBackground.items || DEFAULT_EDU_BACKGROUND.items,
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
      updateForm('eduBackground', value as ShallowPartial<EduBackgroundFormExcludeHidden>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  function onAddItem() {
    append(DEFAULT_EDU_BACKGROUND.items![0])
  }

  return (
    <Form {...form}>
      <form id="edu-background-form" className={cn('space-y-6', className)}>
        {fields.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1.0],
            }}
            layout
          >
            {index > 0 && <Separator className="my-6" />}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  教育背景
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

              <section className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <FormField
                  name={`items.${index}.schoolName`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>学校</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学校名称" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.professional`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>专业</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入所学专业" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name={`items.${index}.duration`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>就读时间</FormLabel>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                              {field.value?.[0] || '入学年月'}
                              <Baby className="ml-auto h-4 w-4 opacity-50" />
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
                            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                              {field.value?.[1] || '毕业年月'}
                              <IconMichelinBibGourmand className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown"
                              defaultMonth={new Date(field.value?.[1] || '2002-1-1')}
                              selected={field.value?.[1] ? new Date(field.value[1]) : undefined}
                              disabled={date => date > new Date()}
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

                <FormField
                  name={`items.${index}.degree`}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>学历</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择学历" />
                          </SelectTrigger>
                          <SelectContent>
                            {degreeOptions.map(option => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>

              <FormField
                name={`items.${index}.eduInfo`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>教育背景描述</FormLabel>
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
          {!isMobile && <span className="ml-2">添加教育背景</span>}
        </Button>
      </form>
    </Form>
  )
}

export default EduBackgroundForm
