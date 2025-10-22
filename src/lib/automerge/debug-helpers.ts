/* eslint-disable no-console */
/**
 * Automerge 调试辅助工具
 */

import type { DocHandle } from '@automerge/automerge-repo'
import type { AutomergeResumeDocument } from './schema'

/**
 * 打印文档句柄的详细信息
 */
export function logHandleInfo(handle: DocHandle<AutomergeResumeDocument>, label = '文档信息') {
  const doc = handle.doc()

  console.log(`📋 ${label}:`, {
    url: handle.url,
    isReady: handle.isReady(),
    hasDoc: !!doc,
    docContent: doc
      ? {
          basics: doc.basics,
          metadata: doc._metadata,
        }
      : null,
    changeListeners: (handle as any).listenerCount?.('change') || 'unknown',
    deleteListeners: (handle as any).listenerCount?.('delete') || 'unknown',
  })
}

/**
 * 监控网络适配器的活动
 */
export function monitorNetworkAdapter(adapter: any, label = '网络适配器') {
  const events = ['peer-candidate', 'peer-disconnected', 'message']

  events.forEach((event) => {
    adapter.on(event, (...args: any[]) => {
      console.log(`🌐 ${label} - ${event}:`, ...args)
    })
  })
}

/**
 * 验证两个文档是否同步
 */
export function compareDocuments(doc1: AutomergeResumeDocument | null, doc2: AutomergeResumeDocument | null) {
  if (!doc1 || !doc2) {
    console.error('❌ 无法比较：其中一个文档为空', { doc1: !!doc1, doc2: !!doc2 })
    return false
  }

  const isSame = JSON.stringify(doc1) === JSON.stringify(doc2)

  console.log('🔍 文档比较:', {
    isSame,
    doc1Basics: doc1.basics,
    doc2Basics: doc2.basics,
    doc1Version: doc1._metadata?.version,
    doc2Version: doc2._metadata?.version,
  })

  return isSame
}
