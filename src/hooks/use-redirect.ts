import supabase from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export const alreadyLoggedRedirect = (redirect: string = '/') => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        toast.info('您已登录，正在跳转到首页...')
        navigate(redirect)
      }
    }
    checkUser()
  }, [])
}
