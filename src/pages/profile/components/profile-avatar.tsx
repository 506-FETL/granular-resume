import { CurrentUserAvatar } from '@/components/current-user-avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { changeAvatar } from '@/lib/supabase/user'
import { IconCamera } from '@tabler/icons-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'

export function ProfileAvatar() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    setUploading(true)
    try {
      await changeAvatar(file)
      toast.success('头像更新成功')
    } catch (error) {
      toast.error('头像上传失败，请稍后重试' + error)
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className='relative transition-all duration-300'>
      <CurrentUserAvatar className='h-24 w-24' />
      <Button
        onClick={handleAvatarClick}
        disabled={uploading}
        size='icon'
        className='absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full hover:shadow-md hover:cursor-pointer'
        title='更换头像'
      >
        {uploading ? <Spinner className='h-4 w-4' /> : <IconCamera className='h-4 w-4' />}
      </Button>
      <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
    </div>
  )
}
