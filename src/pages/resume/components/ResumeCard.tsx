import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { FileText, X, Edit2 } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { EditResumeDialog } from './EditResumeDialog'
import { DeleteResumeDialog } from './DeleteResumeDialog'
import type { ResumeType } from '@/store/resume/current'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

interface Resume {
  resume_id: string
  created_at: string
  type: ResumeType
  display_name?: string
  description?: string
}

interface ResumeCardProps {
  resume: Resume
  onEdit: (resume: Resume) => void
  onDelete: (id: string) => Promise<void>
}

export function ResumeCard({ resume, onEdit, onDelete }: ResumeCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

  const handleCardClick = () => {
    onEdit(resume)
  }

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowEditDialog(true)
  }

  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    await onDelete(resume.resume_id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <Card
        className='hover:shadow-lg transition-all duration-300 cursor-pointer relative h-full flex flex-col'
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 删除按钮 */}
        <Button
          onClick={handleDeleteClick}
          size='icon'
          className={cn(
            'absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:cursor-pointer',
            isMobile
              ? 'opacity-100 scale-100 rotate-0'
              : isHovered
                ? 'opacity-100 scale-100 rotate-0'
                : 'opacity-0 scale-0 rotate-90',
          )}
          aria-label='删除简历'
        >
          <X className='h-4 w-4' />
        </Button>

        <CardHeader>
          <div className='flex items-center justify-between'>
            <FileText className='h-8 w-8 text-primary' />
            <span className='text-xs text-muted-foreground'>{new Date(resume.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent className='flex-1'>
          <CardTitle>{resume.display_name || `未命名简历`}</CardTitle>
          <CardDescription>{resume.description || '点击编辑简历内容'}</CardDescription>
        </CardContent>
        <CardFooter>
          <Button variant='outline' onClick={handleEditClick} className='w-full'>
            <Edit2 />
            编辑简历信息
          </Button>
        </CardFooter>
      </Card>

      {/* 编辑对话框 */}
      <EditResumeDialog resume={resume} open={showEditDialog} onOpenChange={setShowEditDialog} />

      {/* 删除确认对话框 */}
      <DeleteResumeDialog
        resumeName={resume.display_name || '未命名简历'}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
