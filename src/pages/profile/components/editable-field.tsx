import type { ReactNode } from 'react'
import { IconCheck, IconEdit, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface EditableFieldProps {
  id: string
  label: string
  icon: ReactNode
  value: string
  type?: string
  isEditing: boolean
  isSaving: boolean
  onValueChange: (value: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
}

export function EditableField({
  id,
  label,
  icon,
  value,
  type = 'text',
  isEditing,
  isSaving,
  onValueChange,
  onEdit,
  onSave,
  onCancel,
}: EditableFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={e => onValueChange(e.target.value)}
          disabled={!isEditing || isSaving}
          className={!isEditing ? 'bg-muted' : ''}
        />
        {!isEditing
          ? (
              <Button variant="outline" size="icon" onClick={onEdit}>
                <IconEdit className="h-4 w-4" />
              </Button>
            )
          : (
              <>
                <Button variant="outline" size="icon" onClick={onSave} disabled={isSaving}>
                  {isSaving ? <Spinner className="h-4 w-4" /> : <IconCheck className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={onCancel} disabled={isSaving}>
                  <IconX className="h-4 w-4" />
                </Button>
              </>
            )}
      </div>
    </div>
  )
}
