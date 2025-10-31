import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'

export function useCurrentUserName() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileName = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error(error)
      }

      setName(data.session?.user.user_metadata.full_name ?? '?')
    }
    fetchProfileName()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setName(session?.user.user_metadata.full_name ?? '?')
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return name || '?'
}
