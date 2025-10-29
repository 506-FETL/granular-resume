import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OfflineResume {
  resume_id: string
  display_name: string
  description?: string
  type: string
  created_at: string
}

interface SyncResumesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offlineResumes: OfflineResume[]
  onSync: (selectedIds: string[]) => Promise<void>
  isSyncing?: boolean
}

export function SyncResumesDialog({
  open,
  onOpenChange,
  offlineResumes,
  onSync,
  isSyncing = false,
}: SyncResumesDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [initialIds, setInitialIds] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setInitialIds((prev) => (prev.length ? prev : offlineResumes.map((r) => r.resume_id)))
      setSelectedIds((prev) => (prev.length ? prev : offlineResumes.map((r) => r.resume_id)))
    } else {
      setInitialIds([])
      setSelectedIds([])
    }
  }, [open, offlineResumes])

  const handleToggle = (resumeId: string) => {
    setSelectedIds((prev) => (prev.includes(resumeId) ? prev.filter((id) => id !== resumeId) : [...prev, resumeId]))
  }

  const handleToggleAll = () => {
    if (selectedIds.length === offlineResumes.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(offlineResumes.map((r) => r.resume_id))
    }
  }

  const handleSync = async () => {
    if (selectedIds.length === 0) return
    await onSync(selectedIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>同步本地简历到云端</DialogTitle>
          <DialogDescription>
            检测到 <Badge variant='secondary'>{offlineResumes.length}</Badge> 个本地简历，选择需要同步到云端的简历
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* 全选按钮 */}
          <div className='flex items-center space-x-2 pb-2 border-b'>
            <Checkbox
              id='select-all'
              checked={selectedIds.length === offlineResumes.length && offlineResumes.length > 0}
              onCheckedChange={handleToggleAll}
              disabled={isSyncing}
            />
            <label
              htmlFor='select-all'
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
            >
              全选 ({selectedIds.length}/{offlineResumes.length})
            </label>
          </div>

          {/* 简历列表 */}
          <ScrollArea className='h-[400px] pr-4'>
            <div className='space-y-3'>
              {offlineResumes.map((resume) => {
                const isSelected = selectedIds.includes(resume.resume_id)
                return (
                  <Card
                    key={resume.resume_id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => !isSyncing && handleToggle(resume.resume_id)}
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start gap-3'>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggle(resume.resume_id)}
                            disabled={isSyncing}
                          />
                        </div>
                        <FileText className='h-5 w-5 text-primary mt-0.5' />
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='text-base truncate'>{resume.display_name}</CardTitle>
                          {resume.description && (
                            <CardDescription className='text-sm mt-1 line-clamp-2'>
                              {resume.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0 pl-12'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        <span>{new Date(resume.created_at).toLocaleDateString('zh-CN')}</span>
                        <Badge variant='outline' className='text-xs'>
                          {resume.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className='flex items-center justify-between sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            已选择 <span className='font-semibold text-foreground'>{selectedIds.length}</span> 个简历
          </p>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSyncing}>
              稍后同步
            </Button>
            <Button onClick={handleSync} disabled={selectedIds.length === 0 || isSyncing}>
              {isSyncing ? '同步中...' : `同步 ${selectedIds.length} 个简历`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
