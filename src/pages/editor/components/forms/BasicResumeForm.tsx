import type { BasicFormType, Gender, MaritalStatus, PoliticalStatus, WorkYears } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { ChevronDownIcon, Delete, Plus } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import { ResumeSchema } from '@/lib/schema'
import { cn } from '@/lib/utils'
import useResumeStore from '@/store/resume/form'

const genderOptions: Gender[] = ['不填', '男', '女', '其他']
const workYearsOptions: WorkYears[] = ['不填', '应届', '1年', '2年', '3-5年', '5-10年', '10年以上']
const maritalStatusOptions: MaritalStatus[] = ['不填', '未婚', '已婚', '离异', '已婚已育']
const politicalStatusOptions: PoliticalStatus[] = ['不填', '中共党员', '中共预备党员', '共青团员', '群众', '其他']

function BasicResumeForm({ className }: { className?: string }) {
  const basics = useResumeStore(state => state.basics)
  const updateBasics = useResumeStore(state => state.updateBasics)
  const isMobile = useIsMobile()

  const form = useForm<BasicFormType>({
    resolver: zodResolver(ResumeSchema.shape.basics),
    defaultValues: basics,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: 'customFields',
  })
  function onAddField() {
    append({ label: '', value: '' })
  }
  const [open, setOpen] = useState(false)

  form.watch((value) => {
    updateBasics(value)
  })

  return (
    <Form {...form}>
      <form id="basic-resume-form" className={cn(className)}>
        <section className="grid gap-4 justify-items-start sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>您的姓名</FormLabel>
                <FormControl><Input placeholder="输入您的姓名" {...field} /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>性别</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="不填" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genderOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthMonth"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>出生年月</FormLabel>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="date"
                        >
                          {field.value ? field.value : '选择日期'}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          defaultMonth={new Date(2002, 1, 1)}
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setOpen(false)
                            field.onChange(date && date.toLocaleDateString())
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name="workYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>工作年限</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="不填" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workYearsOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>

              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系方式</FormLabel>
                <FormControl><Input placeholder="手机号" {...field} /></FormControl>

              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>联系邮箱</FormLabel>
                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>婚姻状况</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="不填" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maritalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>

              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heightCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>身高(cm)</FormLabel>
                <FormControl>
                  <InputOTP
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.value ? String(field.value) : ''}
                    onChange={(v) => { field.onChange(Number(v)) }}
                    maxLength={3}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>体重(kg)</FormLabel>
                <FormControl>
                  <FormControl>
                    <InputOTP
                      pattern={REGEXP_ONLY_DIGITS}
                      value={field.value ? String(field.value) : ''}
                      onChange={(v) => { field.onChange(Number(v)) }}
                      maxLength={3}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                </FormControl>

              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>民族</FormLabel>
                <FormControl><Input placeholder="请输入民族" {...field} /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nativePlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>籍贯</FormLabel>
                <FormControl><Input placeholder="四川 / 江苏南京" {...field} /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="politicalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>政治面貌</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="共青团员" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {politicalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </section>
        <Separator className="mt-6" />
        <Button type="button" size={isMobile ? 'icon' : 'sm'} onClick={onAddField} className="mt-6">
          <Plus />
          { !isMobile && '添加自定义字段' }
        </Button>
        <div className="mt-6 grid gap-4 justify-items-start sm:grid-cols-2 md:grid-cols-3">
          {fields.map((item, index) => (
            <div key={item.id} className="flex gap-2 items-end">
              <FormField
                control={form.control}
                name={`customFields.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标签</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="标签" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`customFields.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>值</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="值" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size={isMobile ? 'icon' : 'sm'}
                onClick={() => remove(index)}
              >
                <Delete />
                {!isMobile && '删除'}
              </Button>
            </div>
          ))}
        </div>
      </form>
    </Form>
  )
}

export default BasicResumeForm
