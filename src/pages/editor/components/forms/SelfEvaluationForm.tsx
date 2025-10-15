import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { selfEvaluationFormSchema, type SelfEvaluationFormType } from '@/lib/schema'
import type { ShallowPartial } from '@/lib/utils'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

function SelfEvaluationForm({ className }: { className?: string }) {
  const selfEvaluation = useResumeStore((state) => state.selfEvaluation)
  const updateForm = useResumeStore((state) => state.updateForm)

  const form = useForm({
    resolver: zodResolver(selfEvaluationFormSchema),
    defaultValues: {
      content: selfEvaluation.content || '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateForm('selfEvaluation', value as ShallowPartial<SelfEvaluationFormType>)
    })
    return () => subscription.unsubscribe()
  }, [form, updateForm])

  return (
    <Form {...form}>
      <form id='self-evaluation-form'>
        <div className={cn('space-y-6', className)}>
          <FormField
            name='content'
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>自我评价</FormLabel>
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
      </form>
    </Form>
  )
}

export default SelfEvaluationForm
