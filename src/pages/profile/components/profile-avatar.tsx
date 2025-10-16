import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { IconCamera } from '@tabler/icons-react'
import { useRef } from 'react'

interface ProfileAvatarProps {
  image: string | null
  name: string
  uploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileAvatar({ image, name, uploading, onFileChange }: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='relative'>
      <Avatar className='h-24 w-24'>
        {image && <AvatarImage src={image} alt={name} />}
        <AvatarFallback className='text-2xl'>
          {name
            ?.split(' ')
            ?.map((word) => word[0])
            ?.join('')
            ?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <button
        onClick={handleAvatarClick}
        disabled={uploading}
        className='bg-primary text-primary-foreground hover:bg-primary/90 absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-colors disabled:opacity-50'
        title='更换头像'
      >
        {uploading ? <Spinner className='h-4 w-4' /> : <IconCamera className='h-4 w-4' />}
      </button>
      <input ref={fileInputRef} type='file' accept='image/*' onChange={onFileChange} className='hidden' />
    </div>
  )
}
