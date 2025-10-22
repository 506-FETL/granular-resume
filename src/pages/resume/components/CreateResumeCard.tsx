import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
import { createOfflineResume } from '@/lib/offline-resume-manager'
import useCurrentResumeStore, { type ResumeType } from '@/store/resume/current'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'

interface CreateResumeCardProps {
  isOnline: boolean
  onResumeCreated?: (resume: {
    resume_id: string
    created_at: string
    type: ResumeType
    display_name?: string
    description?: string
    isOffline?: boolean
  }) => void
}

export function CreateResumeCard({ isOnline, onResumeCreated }: CreateResumeCardProps) {
  const { setCurrentResume } = useCurrentResumeStore()

  const [isCreating, setIsCreating] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState<ResumeType>('default')
  const [loading, setLoading] = useState(false)

  async function handleCreateResume(e: FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (isOnline) {
        // 在线模式：创建云端简历
        const createPromise = createNewResume(
          { display_name: displayName.trim(), description: description.trim() },
          selectedType,
        )
          .then((data) => {
            setCurrentResume(data.resume_id, data.type)
            onResumeCreated?.({
              resume_id: data.resume_id,
              created_at: data.created_at,
              type: data.type,
              display_name: data.display_name,
              description: data.description,
              isOffline: false,
            })
            return data
          })
          .finally(() => {
            setLoading(false)
            handleCancel()
          })

        toast.promise(createPromise, {
          loading: '正在创建简历...',
          success: '简历创建成功',
          error: (error) => `创建简历失败: ${error.message}，请重试`,
        })
      } else {
        // 离线模式：创建本地简历
        const resumeId = await createOfflineResume({
          display_name: displayName.trim(),
          description: description.trim(),
          type: selectedType,
        })

        setCurrentResume(resumeId, selectedType)
        onResumeCreated?.({
          resume_id: resumeId,
          created_at: new Date().toISOString(),
          type: selectedType,
          display_name: displayName.trim(),
          description: description.trim(),
          isOffline: true,
        })

        toast.success('本地简历创建成功')
        setLoading(false)
        handleCancel()
      }
    } catch (error: any) {
      setLoading(false)
      toast.error(`创建失败: ${error.message}`)
    }
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
        className='hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 hover:border-primary/50 h-full flex flex-col'
        onClick={() => setIsCreating(true)}
      >
        <CardHeader className='flex justify-center'>
          <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center'>
            <Plus className='h-8 w-8' />
          </div>
        </CardHeader>
        <CardContent className='flex justify-center'>
          <p className='font-semibold text-lg'>创建新简历</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-muted-foreground'>开始制作你的专属简历</p>
        </CardFooter>
      </Card>
      {isCreating && (
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className='sm:max-w-[540px]'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>创建新简历</DialogTitle>
              <DialogDescription className='text-base'>
                {isOnline
                  ? '填写简历信息，选择合适的模板。简历将保存到云端。'
                  : '填写简历信息，选择合适的模板。简历将保存在本地。'}
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
                        <SelectItem value='default'>默认</SelectItem>
                        <SelectItem value='modern'>现代</SelectItem>
                        <SelectItem value='simple'>简约</SelectItem>
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
