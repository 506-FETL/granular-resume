import type { ReactNode } from 'react'
import { FileText, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExportPdf: () => void
  onExportDoc: () => void
  trigger: ReactNode
}

export function ExportDialog({ open, onOpenChange, onExportPdf, onExportDoc, trigger }: ExportDialogProps) {
  const handleExportPdf = () => {
    onOpenChange(false)
    onExportPdf()
  }

  const handleExportDoc = () => {
    onOpenChange(false)
    onExportDoc()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>导出简历</DialogTitle>
          <DialogDescription>选择导出格式，导出内容将与页面预览保持一致。</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleExportPdf}>
            <Printer className="mr-2 h-4 w-4" />
            导出 PDF
          </Button>
          <Button onClick={handleExportDoc}>
            <FileText className="mr-2 h-4 w-4" />
            导出 Word
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
