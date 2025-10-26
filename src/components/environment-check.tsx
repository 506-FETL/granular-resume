import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

export function EnvironmentCheck() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

    setIsConfigured(Boolean(supabaseUrl && supabaseKey))
  }, [])

  if (isConfigured === null) return null

  return (
    <Badge variant={isConfigured ? 'default' : 'destructive'} className='text-xs'>
      {isConfigured ? '配置正确' : '配置错误'}
    </Badge>
  )
}
