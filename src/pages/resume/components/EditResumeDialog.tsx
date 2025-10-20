import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import supabase from '@/lib/supabase/client'
import { useState, useEffect, type FormEvent } from 'react'
import { toast } from 'sonner'
import { updateResumeConfig } from '@/lib/supabase/resume'

interface Resume {
  id: string
  display_name?: string
  description?: string
}

interface EditResumeDialogProps {
  resume: Resume
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditResumeDialog({ resume, open, onOpenChange, onSuccess }: EditResumeDialogProps) {
  const [displayName, setDisplayName] = useState(resume.display_name || '')
  const [description, setDescription] = useState(resume.description || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setDisplayName(resume.display_name || '')
      setDescription(resume.description || '')
    }
  }, [open, resume])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateResumeConfig(resume.id, {
        display_name: displayName.trim() || null,
        description: description.trim() || null,
      })

      toast.success('简历信息更新成功')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>编辑简历信息</DialogTitle>
          <DialogDescription>更新简历的名称和描述信息</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='display_name'>简历名称</Label>
              <Input
                id='display_name'
                placeholder='例如: 前端工程师简历'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
              <p className='text-xs text-muted-foreground'>为你的简历起一个容易识别的名称</p>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>简历描述</Label>
              <Textarea
                id='description'
                placeholder='例如: 用于投递互联网公司的技术岗位'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={200}
              />
              <p className='text-xs text-muted-foreground'>简要描述这份简历的用途 ({description.length}/200)</p>
            </div>
          </div>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
