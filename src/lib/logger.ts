/* eslint-disable no-console */
/*
 * @Author: lll 347552878@qq.com
 * @Date: 2025-11-08 12:13:59
 * @LastEditors: lll 347552878@qq.com
 * @LastEditTime: 2025-11-08 14:14:39
 * @FilePath: /resume/src/lib/logger.ts
 * @Description: 统一的日志工具
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none'
const isDev = import.meta.env.DEV

const LOG_LEVEL: LogLevel = isDev ? import.meta.env.VITE_LOG_LEVEL : 'none'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4,
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL]
}

export const logger = {
  debug: (message: string, meta?: Record<string, any>) => {
    if (shouldLog('debug')) {
      console.log(`🔍 ${message}`, meta || '')
    }
  },

  info: (message: string, meta?: Record<string, any>) => {
    if (shouldLog('info')) {
      console.log(`ℹ️ ${message}`, meta || '')
    }
  },

  warn: (message: string, meta?: Record<string, any>) => {
    if (shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, meta || '')
    }
  },

  error: (message: string, meta?: Record<string, any>) => {
    if (shouldLog('error')) {
      console.error(`❌ ${message}`, meta || '')
    }
  },

  // 特定领域的日志器
  automerge: {
    sync: (message: string, meta?: Record<string, any>) => {
      if (shouldLog('debug')) {
        console.log(`🔄 [Automerge] ${message}`, meta || '')
      }
    },
    network: (message: string, meta?: Record<string, any>) => {
      if (shouldLog('debug')) {
        console.log(`🌐 [Network] ${message}`, meta || '')
      }
    },
    collab: (message: string, meta?: Record<string, any>) => {
      if (shouldLog('info')) {
        console.log(`🤝 [Collab] ${message}`, meta || '')
      }
    },
  },
}
