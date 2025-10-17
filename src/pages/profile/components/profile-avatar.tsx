import { CurrentUserAvatar } from '@/components/current-user-avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { IconCamera } from '@tabler/icons-react'
import { useRef } from 'react'

interface ProfileAvatarProps {
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileAvatar({ uploading, onFileChange }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='relative'>
      <CurrentUserAvatar className='h-24 w-24' />
      <Button
        onClick={handleAvatarClick}
        disabled={uploading}
        variant='default'
        size='icon'
        className='absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full shadow-lg'
        title='更换头像'
      >
        {uploading ? <Spinner className='h-4 w-4' /> : <IconCamera className='h-4 w-4' />}
      </Button>
      <input ref={fileInputRef} type='file' accept='image/*' onChange={onFileChange} className='hidden' />
    </div>
  )
}
