import { Badge } from '@/components/ui/badge'
import { IconMail, IconShield } from '@tabler/icons-react'
import { ProfileAvatar } from './profile-avatar'

interface ProfileHeaderProps {
  image: string | null
  name: string
  email: string
  emailConfirmed: boolean
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileHeader({ image, name, email, emailConfirmed, uploading, onFileChange }: ProfileHeaderProps) {
  return (
    <div className='flex items-center gap-6'>
      <ProfileAvatar image={image} name={name} uploading={uploading} onFileChange={onFileChange} />
      <div className='space-y-1'>
        <h3 className='text-2xl font-semibold'>{name}</h3>
        <p className='text-muted-foreground flex items-center gap-2'>
          <IconMail className='h-4 w-4' />
          {email}
        </p>
        {emailConfirmed && (
          <Badge variant='secondary' className='mt-2 gap-1'>
            <IconShield className='h-3 w-3' />
            邮箱已验证
          </Badge>
        )}
      </div>
    </div>
  )
}
