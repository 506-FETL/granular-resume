import type { Degree, EduBackgroundFormExcludeHidden } from '@/lib/schema/resume/eduBackground'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconMichelinBibGourmand } from '@tabler/icons-react'
import { Baby, Delete, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
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
import { eduBackgroundFormSchemaExcludeHidden } from '@/lib/schema/resume/eduBackground'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

const degreeOptions: Degree[] = ['不填', '初中', '高中', '中专', '大专', '本科', '学士', '硕士', '博士', 'MBA', 'EMBA', '其他']

function EduBackgroundForm({ className }: { className?: string }) {
  const eduBackground = useResumeStore(state => state.eduBackground)
  const updateForm = useResumeStore(state => state.updateForm)
  const isMobile = useIsMobile()

  const form = useForm<EduBackgroundFormExcludeHidden>({
    resolver: zodResolver(eduBackgroundFormSchemaExcludeHidden),
    defaultValues: eduBackground,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'eduInfo',
  })

  const [open, setOpen] = useState({ start: false, end: false })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm('eduBackground', value as EduBackgroundFormExcludeHidden)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  function onAddField() {
    append({ content: '' })
  }

  return (
    <Form {...form}>
      <form id="edu-background-form" className={cn(className)}>
        <section className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            name="schoolName"
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
            name="professional"
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
            name="duration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>就读时间</FormLabel>
                <div className="flex items-center gap-2 w-8">
                  <Popover open={open.start} onOpenChange={() => setOpen(prev => ({ ...prev, start: !prev.start }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {field.value?.[0] || '入学年月'}
                        <Baby />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto">
                      <Calendar
                        defaultMonth={new Date(2015, 1, 1)}
                        mode="single"
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setOpen(() => ({ ...open, start: false }))
                          field.onChange([date && date.toLocaleDateString(), field.value?.[1]])
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Separator />
                  <Popover open={open.end} onOpenChange={() => setOpen(prev => ({ ...prev, end: !prev.end }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {field.value?.[1] || '毕业年月'}
                        <IconMichelinBibGourmand className="ml-auto" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto">
                      <Calendar
                        defaultMonth={new Date(2015, 1, 1)}
                        mode="single"
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setOpen(() => ({ ...open, end: false }))
                          field.onChange([field.value?.[0], date && date.toLocaleDateString()])
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormItem>
            )}
          />

          <FormField
            name="degree"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>学历</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Separator className="mt-6" />
        <Button type="button" variant="outline" size={isMobile ? 'icon' : 'sm'} onClick={onAddField} className="mt-6">
          <Plus />
          { !isMobile && '添加教育经历' }
        </Button>
        <div className="mt-4 space-y-4 w-full">
          {fields.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <FormField
                name={`eduInfo.${index}.content`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SimpleEditor
                        content={field.value}
                        onChange={(editor) => {
                          field.onChange(editor.getHTML())
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                size={isMobile ? 'sm' : 'default'}
                className="sm:w-auto w-full sm:self-start sm:mt-0"
              >
                <Delete />
                {!isMobile && '删除'}
              </Button>
            </motion.div>
          ),
          )}
        </div>
      </form>
    </Form>
  )
}

export default EduBackgroundForm
