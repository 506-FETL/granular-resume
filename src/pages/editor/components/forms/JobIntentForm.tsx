import type { DateEntry } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { jobIntentFormSchemaExcludeHidden } from '@/lib/schema/resume/jobIntent'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

const dateEntryOptions: DateEntry[] = ['不填', '随时到岗', '15天内', '1个月内', '2个月内', '3个月内', '到岗时间另行商议']

function JobIntentForm({ className }: { className?: string }) {
  const jobIntent = useResumeStore(state => state.jobIntent)
  const updateForm = useResumeStore(state => state.updateForm)

  const form = useForm({
    resolver: zodResolver(jobIntentFormSchemaExcludeHidden),
    defaultValues: jobIntent,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      // 确保所有字段都已定义后再更新
      if (value && typeof value === 'object') {
        updateForm('jobIntent', {
          jobIntent: value.jobIntent,
          intentionalCity: value.intentionalCity,
          expectedSalary: value.expectedSalary,
          dateEntry: value.dateEntry,
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  return (
    <Form {...form}>
      <form id="job-intent-form" className={cn(className)}>
        <motion.div layout className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="jobIntent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>期望岗位</FormLabel>
                <FormControl>
                  <Input placeholder="例如：前端开发 / 全栈" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intentionalCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>意向城市</FormLabel>
                <FormControl>
                  <Input placeholder="例如：上海 / 杭州 / 远程" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>期望薪资 (K/月)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern={REGEXP_ONLY_DIGITS}
                    placeholder="例如：20"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      field.onChange(v === '' ? undefined : Number(v))
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateEntry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>到岗时间</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="不填" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dateEntryOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </motion.div>
      </form>
    </Form>
  )
}

export default JobIntentForm
