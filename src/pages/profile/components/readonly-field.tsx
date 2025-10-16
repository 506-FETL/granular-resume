import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ReactNode } from 'react'

interface ReadonlyFieldProps {
  id: string
  label: string
  icon: ReactNode
  value: string
}

export function ReadonlyField({ id, label, icon, value }: ReadonlyFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id} className='flex items-center gap-2'>
        {icon}
        {label}
      </Label>
      <Input id={id} value={value} disabled className='bg-muted' />
    </div>
  )
}
