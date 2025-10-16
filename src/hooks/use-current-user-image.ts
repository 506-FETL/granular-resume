import supabase from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserImage = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error(error)
      }

      setImage(data.session?.user.user_metadata.avatar_url ?? null)
    }
    fetchUserImage()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setImage(session?.user.user_metadata.avatar_url ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return image
}
