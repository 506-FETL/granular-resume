import type { BasicFormType, Gender, MaritalStatus, PoliticalStatus, WorkYears } from '@/lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ResumeSchema } from '@/lib/schema'
import useResumeStore from '@/store/resume/form'

const genderOptions: Gender[] = ['不填', '男', '女', '其他']
const workYearsOptions: WorkYears[] = ['不填', '应届', '1年', '2年', '3-5年', '5-10年', '10年以上']
const maritalStatusOptions: MaritalStatus[] = ['不填', '未婚', '已婚', '离异', '已婚已育']
const politicalStatusOptions: PoliticalStatus[] = ['不填', '中共党员', '中共预备党员', '共青团员', '群众', '其他']

function BasicResumeForm({ className }: { className?: string }) {
  const basics = useResumeStore(state => state.basics)
  const updateBasics = useResumeStore(state => state.updateBasics)

  const form = useForm<BasicFormType>({
    resolver: zodResolver(ResumeSchema.shape.basics),
    defaultValues: basics,
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const [open, setOpen] = useState(false)

  form.watch((data) => {
    updateBasics(data)
  })

  return (
    <Form {...form}>
      <section className={`mx-auto w-200  ${className}`}>
        <form id="basic-resume-form" className="grid grid-cols-4 grid-rows-3 gap-4 items-start justify-items-start sm:grid-rows-3 md:grid-rows-3 lg:grid-rows-4">
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
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="cm"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>

              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>体重</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="kg"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
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
        </form>
      </section>
    </Form>
  )
}

export default BasicResumeForm
