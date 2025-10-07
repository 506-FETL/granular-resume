import type { ApplicationInfoFormType } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ResumeSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

function ApplicationInfoForm({ className }: { className?: string }) {
  const applicationInfo = useResumeStore(state => state.applicationInfo)
  const updateApplicationInfo = useResumeStore(state => state.updateApplicationInfo)

  const form = useForm<ApplicationInfoFormType>({
    resolver: zodResolver(ResumeSchema.shape.applicationInfo),
    defaultValues: applicationInfo,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  form.watch((value) => {
    updateApplicationInfo(value)
  })

  return (
    <Form {...form}>
      <form id="application-info-form" className={cn(className)}>
        <section className="grid gap-4 justify-items-start sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="applicationSchool"
            render={({ field }) => (
              <FormItem>
                <FormLabel>报考院校</FormLabel>
                <FormControl>
                  <Input placeholder="例如：清华大学 / 北京大学" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationMajor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>报考专业</FormLabel>
                <FormControl>
                  <Input placeholder="例如：计算机科学与技术 / 软件工程" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </section>
      </form>
    </Form>
  )
}

export default ApplicationInfoForm
