import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  realtime: {
    // 增加心跳间隔，避免Vercel超时
    heartbeatIntervalMs: 30000,
    // 增加重连延迟
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
    // 启用调试日志（仅开发环境）
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
