import type { InternshipExperienceFormExcludeHidden } from '@/lib/schema/resume/internshipExperience'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDoorExit } from '@tabler/icons-react'
import { Delete, Laptop, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { internshipExperienceFormSchemaExcludeHidden } from '@/lib/schema/resume/internshipExperience'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

function InternshipExperienceForm({ className }: { className?: string }) {
  const internshipExperience = useResumeStore(state => state.internshipExperience)
  const updateForm = useResumeStore(state => state.updateForm)
  const isMobile = useIsMobile()

  const form = useForm<InternshipExperienceFormExcludeHidden>({
    resolver: zodResolver(internshipExperienceFormSchemaExcludeHidden),
    defaultValues: {
      companyName: internshipExperience.companyName,
      position: internshipExperience.position,
      internshipDuration: internshipExperience.internshipDuration,
      internshipInfo: internshipExperience.internshipInfo,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'internshipInfo',
  })

  const [open, setOpen] = useState({ start: false, end: false })

  // Auto-save form changes, excluding isHidden
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name) {
        return
      }

      updateForm('internshipExperience', value)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  function onAddField() {
    append({ content: '' })
  }

  return (
    <Form {...form}>
      <form id="internship-experience-form" className={cn(className)}>
        <section className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            name="companyName"
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
            name="position"
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
            name="internshipDuration"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>实习时间</FormLabel>
                <div className="flex items-center gap-1 w-2">
                  <Popover open={open.start} onOpenChange={() => setOpen(prev => ({ ...prev, start: !prev.start }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {field.value?.[0] || '开始时间'}
                        <Laptop />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        defaultMonth={new Date(field.value?.[0] || '2002-1-1')}
                        disabled={date => date > new Date()}
                        selected={field.value?.[0] ? new Date(field.value[0]) : undefined}
                        onSelect={(date) => {
                          field.onChange([date && date.toLocaleDateString(), field.value?.[1]])
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Separator className="w-4 shrink-0" />
                  <Popover open={open.end} onOpenChange={() => setOpen(prev => ({ ...prev, end: !prev.end }))}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {field.value?.[1] || '结束时间'}
                        <IconDoorExit />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        defaultMonth={new Date(field.value?.[1] || '2002-1-1')}
                        selected={field.value?.[1] ? new Date(field.value[1]) : undefined}
                        disabled={date => date > new Date()}
                        onSelect={(date) => {
                          field.onChange([field.value?.[0], date && date.toLocaleDateString()])
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </FormItem>
            )}
          />
        </section>
        <Separator className="mt-6" />
        <Button type="button" variant="outline" size={isMobile ? 'icon' : 'sm'} onClick={onAddField} className="mt-6">
          <Plus />
          {!isMobile && '添加实习经历'}
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
                name={`internshipInfo.${index}.content`}
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
                size={isMobile ? 'sm' : 'sm'}
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

export default InternshipExperienceForm
