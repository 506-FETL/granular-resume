import supabase from '@/lib/supabase/client'
import { getCurrentUser } from '@/lib/supabase/user'
import { useEffect, useState } from 'react'

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    // 获取初始用户头像
    const fetchUserImage = async () => {
      const data = await getCurrentUser()
      setImage(data.session?.user.user_metadata.avatar_url ?? null)
    }
    fetchUserImage()

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setImage(session?.user.user_metadata.avatar_url ?? null)
    })

    // 清理监听器
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return image
}
