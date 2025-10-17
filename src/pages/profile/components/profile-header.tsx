import { Badge } from '@/components/ui/badge'
import { IconMail, IconShield } from '@tabler/icons-react'
import { ProfileAvatar } from './profile-avatar'

interface ProfileHeaderProps {
  name: string
  email: string
  emailConfirmed: boolean
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileHeader({ name, email, emailConfirmed, uploading, onFileChange }: ProfileHeaderProps) {
  return (
    <div className='flex items-center gap-6'>
      <ProfileAvatar uploading={uploading} onFileChange={onFileChange} />
      <div className='space-y-1'>
        <h3 className='text-2xl font-semibold'>{name}</h3>
        <p className='text-muted-foreground flex items-center gap-2'>
          <IconMail className='h-4 w-4' />
          {email}
        </p>
        <Badge variant={emailConfirmed ? 'outline' : 'destructive'} className='mt-2 gap-1'>
          <IconShield className='h-3 w-3' />
          {emailConfirmed ? '邮箱已验证' : '邮箱未验证'}
        </Badge>
      </div>
    </div>
  )
}
