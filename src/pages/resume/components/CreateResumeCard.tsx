import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createNewResume } from '@/lib/supabase/resume/form'
import useCurrentResumeStore, { type ResumeType } from '@/store/resume/current'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

export function CreateResumeCard({ onUpdate }: { onUpdate: () => void }) {
  const { setCurrentResume } = useCurrentResumeStore()

  const [isCreating, setIsCreating] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState<ResumeType>('default')
  const [loading, setLoading] = useState(false)

  async function handleCreateResume(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    const createPromise = createNewResume(
      { display_name: displayName.trim(), description: description.trim() },
      selectedType,
    )
      .then((data) => {
        setCurrentResume(data.id, data.type)
        onUpdate()
        return data
      })
      .finally(() => {
        setLoading(false)
        handleCancel()
      })

    toast.promise(createPromise, {
      loading: '正在创建简历...',
      success: (data) => `简历创建成功：id:${data.id} type:${data.type}`,
      error: (error) => `创建简历失败: ${error.message}，请重试`,
    })
  }

  const handleCancel = () => {
    setDisplayName('')
    setDescription('')
    setSelectedType('default')
    setIsCreating(false)
  }

  return (
    <section>
      <Card
        className='hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 flex items-center justify-center min-h-[250px] hover:border-primary/50 hover:bg-primary/5 group relative overflow-hidden'
        onClick={() => setIsCreating(true)}
      >
        {/* 背景装饰 */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        <CardContent className='flex flex-col items-center justify-center gap-4 p-8 relative z-10'>
          <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300'>
            <Plus className='h-8 w-8 text-primary group-hover:rotate-90 transition-transform duration-300' />
          </div>
          <div className='text-center'>
            <p className='font-semibold text-lg group-hover:text-primary transition-colors'>创建新简历</p>
            <p className='text-sm text-muted-foreground mt-1'>开始制作你的专属简历</p>
          </div>
        </CardContent>
      </Card>
      {isCreating && (
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className='sm:max-w-[540px]'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>创建新简历</DialogTitle>
              <DialogDescription className='text-base'>
                填写简历信息，选择合适的模板开始制作你的专属简历
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateResume}>
              <div className='grid gap-6 py-6'>
                {/* 简历名称 */}
                <div className='grid gap-3'>
                  <Label htmlFor='display_name' className='text-sm font-semibold'>
                    简历名称
                  </Label>
                  <Input
                    id='display_name'
                    placeholder='例如: 前端开发工程师简历'
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={50}
                    className='h-11'
                  />
                  <p className='text-xs text-muted-foreground'>
                    为你的简历起一个容易识别的名称 ({displayName.length}/50)
                  </p>
                </div>

                {/* 简历描述 */}
                <div className='grid gap-3'>
                  <Label htmlFor='description' className='text-sm font-semibold'>
                    简历描述
                  </Label>
                  <Textarea
                    id='description'
                    placeholder='例如: 用于投递互联网公司的前端技术岗位'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className='resize-none'
                  />
                  <p className='text-xs text-muted-foreground'>简要描述这份简历的用途 ({description.length}/200)</p>
                </div>

                {/* TODO 暂时先写成这样 */}
                {/* 模板类型 */}
                <div className='grid gap-3'>
                  <Label htmlFor='template_type' className='text-sm font-semibold'>
                    模板类型
                  </Label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ResumeType)}>
                    <SelectTrigger className='h-11' id='template_type'>
                      <SelectValue placeholder='选择模板类型' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>可用模板</SelectLabel>
                        <SelectItem value='default'>
                          <div className='flex flex-col items-start'>
                            <span className='font-medium'>默认模板</span>
                            <span className='text-xs text-muted-foreground'>经典简洁的简历样式</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='modern'>
                          <div className='flex flex-col items-start'>
                            <span className='font-medium'>现代模板</span>
                            <span className='text-xs text-muted-foreground'>时尚现代的设计风格</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='simple'>
                          <div className='flex flex-col items-start'>
                            <span className='font-medium'>简约模板</span>
                            <span className='text-xs text-muted-foreground'>极简风格突出内容</span>
                          </div>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type='button' variant='outline' onClick={handleCancel} disabled={loading}>
                  取消
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? '创建中...' : '创建简历'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}
