import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  realtime: {
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
    logLevel: import.meta.env.DEV ? 'info' : 'error',
  },
  // 全局配置
  global: {
    headers: {
      'x-client-info': 'resume-app',
    },
  },
})

export default supabase
