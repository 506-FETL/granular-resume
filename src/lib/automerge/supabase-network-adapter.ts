/*
 * @Author: lll 347552878@qq.com
 * @Date: 2025-10-28 18:57:34
 * @LastEditors: lll 347552878@qq.com
 * @LastEditTime: 2025-11-08 13:05:16
 * @FilePath: /resume/src/lib/automerge/supabase-network-adapter.ts
 * @Description: 使用 Supabase Realtime 作为 Automerge 的网络传输层，并允许按会话隔离协作。
 */
import type { Message, PeerId, PeerMetadata } from '@automerge/automerge-repo'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { NetworkAdapter } from '@automerge/automerge-repo'
import { logger } from '@/lib/logger'
import supabase from '@/lib/supabase/client'
import { base64ToUint8Array, uint8ArrayToBase64 } from './binary-utils'

export interface CollaborationCallbacks {
  onPeerJoin?: (payload: { peerId: string, metadata?: Record<string, any> }) => void
  onPeerLeave?: (payload: { peerId: string }) => void
  onChannelReady?: (channelName: string) => void
  onControlMessage?: (payload: { type: string, data?: Record<string, any> }) => void
  presenceMetadata?: Record<string, any>
}

export class SupabaseNetworkAdapter extends NetworkAdapter {
  private channel: RealtimeChannel | null = null
  peerId?: PeerId = undefined
  peerMetadata?: PeerMetadata = undefined
  private readonly resumeId: string
  private readonly sessionId: string
  private readonly callbacks: CollaborationCallbacks
  private readonly channelName: string
  private readonly presenceMetadata: Record<string, any>
  private ready = false
  private localDocumentId: string | null = null
  private pendingMessages: Array<{ senderId: any, targetId: any, messageType: any, documentId: any, message: string }> = []

  /**
   * 使用 resumeId 来生成频道名
   */
  constructor(resumeId: string, sessionId: string, callbacks: CollaborationCallbacks = {}) {
    super()
    this.resumeId = resumeId
    this.sessionId = sessionId
    this.callbacks = callbacks
    // 使用 resumeId 作为频道标识的一部分，保证不同浏览器加入相同的频道
    this.channelName = `automerge:resume:${this.resumeId}:${this.sessionId}`
    this.presenceMetadata = callbacks.presenceMetadata || {}
  }

  /**
   * 设置本地文档信息,用于将远端消息映射到本地文档
   */
  setLocalDocumentInfo({ documentId }: { documentUrl: string | null, documentId: string | null }) {
    this.localDocumentId = documentId

    if (!this.localDocumentId) {
      return
    }

    // 冲刷缓存消息队列 (最多 200 条)
    const toFlush = this.pendingMessages.splice(0, 200)
    toFlush.forEach(({ senderId, targetId, messageType, documentId, message }) => {
      try {
        const uint8Array = base64ToUint8Array(message)
        const resolvedDocumentId = this.localDocumentId || documentId

        const messageObj: Message = {
          type: messageType || 'message',
          senderId,
          targetId: targetId || this.peerId!,
          data: uint8Array,
        }
        ;(messageObj as any).documentId = resolvedDocumentId
        ;(messageObj as any).channelId = resolvedDocumentId

        logger.automerge.network('冲刷缓存消息', {
          originalDocumentId: documentId,
          mappedDocumentId: resolvedDocumentId,
        })

        this.emit('message', messageObj)
      }
      catch {
        // 忽略单个消息错误
      }
    })
  }

  /**
   * 网络适配器是否就绪
   */
  isReady(): boolean {
    return this.ready
  }

  /**
   * 等待网络适配器就绪
   */
  whenReady(): Promise<void> {
    if (this.ready) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const off = () => {
        this.off('peer-candidate', handlePeerCandidate)
        this.off('close', off)
        resolve()
      }

      this.once('peer-candidate', handlePeerCandidate)

      function handlePeerCandidate() {
        off()
      }

      this.once('close', off)
    })
  }

  /**
   * 连接到 Supabase Realtime 频道
   */
  connect(peerId: PeerId, peerMetadata?: PeerMetadata): void {
    this.peerId = peerId
    this.peerMetadata = peerMetadata

    // 创建频道，使用 resumeId + sessionId 作为房间名，确保每次分享都是独立会话
    // 配置 broadcast 选项以避免回退到 REST API
    this.channel = supabase.channel(this.channelName, {
      config: {
        broadcast: {
          self: true, // 允许接收自己发送的消息
          ack: false, // 不需要确认机制，提高性能
        },
      },
    })

    // 监听其他 peer 的消息
    this.channel.on('broadcast', { event: 'automerge-sync' }, (payload: any) => {
      const { senderId, targetId, messageType, documentId, message } = payload.payload

      logger.automerge.network('收到同步消息', {
        from: senderId,
        to: targetId,
        messageType,
        documentId,
      })

      // 只处理发给自己的消息或广播消息
      if (targetId && targetId !== this.peerId) {
        return
      }

      // 如果本地文档信息还未就绪，则缓存消息
      if (!this.localDocumentId) {
        if (this.pendingMessages.length < 1000) {
          this.pendingMessages.push({ senderId, targetId, messageType, documentId, message })
        }
        logger.automerge.network('localDocumentId 未就绪，已缓存消息', { senderId, targetId })
        return
      }

      const uint8Array = base64ToUint8Array(message)
      const resolvedDocumentId = this.localDocumentId || documentId || this.resumeId

      const messageObj: Message = {
        type: messageType || 'message',
        senderId,
        targetId: targetId || this.peerId!,
        data: uint8Array,
      }
      ;(messageObj as any).documentId = resolvedDocumentId
      ;(messageObj as any).channelId = resolvedDocumentId

      logger.automerge.network('处理同步消息', {
        originalDocumentId: documentId,
        mappedDocumentId: resolvedDocumentId,
      })

      this.emit('message', messageObj)
    })

    // 监听 peer 加入
    this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      logger.automerge.collab('新用户加入', { count: newPresences.length })

      newPresences.forEach((presence: any) => {
        const remotePeerId = presence.key || presence.peerId || presence.metadata?.peerId

        if (remotePeerId && String(remotePeerId) !== String(this.peerId)) {
          logger.automerge.collab('发现新 peer', { remotePeerId })

          this.emit('peer-candidate', {
            peerId: String(remotePeerId) as unknown as PeerId,
            peerMetadata: presence.metadata || {},
          })

          this.callbacks.onPeerJoin?.({
            peerId: String(remotePeerId),
            metadata: presence.metadata || {},
          })
        }
      })
    })

    // 监听控制消息
    this.channel.on('broadcast', { event: 'automerge-control' }, (payload: any) => {
      const { type, data } = payload.payload || {}
      logger.automerge.collab('收到控制消息', { type })

      if (type) {
        this.callbacks.onControlMessage?.({ type, data })
      }
    })

    // 监听 peer 离开
    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        const remotePeerId = presence.key || presence.peerId || presence.metadata?.peerId

        if (remotePeerId && String(remotePeerId) !== String(this.peerId)) {
          logger.automerge.collab('Peer 离开', { remotePeerId })

          this.emit('peer-disconnected', { peerId: String(remotePeerId) as unknown as PeerId })
          this.callbacks.onPeerLeave?.({ peerId: String(remotePeerId) })
        }
      })
    })

    // 订阅频道
    this.channel.subscribe(async (status) => {
      logger.automerge.network('频道订阅状态变化', { status, channelName: this.channelName })

      if (status === 'SUBSCRIBED') {
        await this.channel!.track({
          key: String(this.peerId),
          metadata: { ...(peerMetadata || {}), ...this.presenceMetadata, peerId: String(this.peerId) },
          online_at: new Date().toISOString(),
          sessionId: this.sessionId,
        })

        this.ready = true
        logger.automerge.network('Automerge 网络适配器已连接', { channelName: this.channelName, peerId: this.peerId })
        this.callbacks.onChannelReady?.(this.channelName)
      }
    })
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
    this.ready = false
    logger.automerge.network('Automerge 网络适配器已断开', { peerId: this.peerId })
  }

  send(message: Message): void {
    if (!this.channel || !this.ready) {
      logger.warn('网络适配器未就绪，无法发送消息')
      return
    }

    if (!message.data) {
      return
    }

    const base64Message = uint8ArrayToBase64(message.data)
    const outgoingDocumentId = (message as any).documentId || this.localDocumentId || this.resumeId

    logger.automerge.network('发送同步消息', {
      type: message.type,
      to: message.targetId,
      documentId: outgoingDocumentId,
    })

    this.channel.send({
      type: 'broadcast',
      event: 'automerge-sync',
      payload: {
        senderId: this.peerId,
        targetId: message.targetId,
        messageType: message.type,
        documentId: outgoingDocumentId,
        message: base64Message,
        sessionId: this.sessionId,
      },
    })
  }

  getChannelName() {
    return this.channelName
  }

  broadcastControlMessage(type: string, data: Record<string, any> = {}) {
    if (!this.channel)
      return

    this.channel.send({
      type: 'broadcast',
      event: 'automerge-control',
      payload: {
        type,
        data,
        senderId: this.peerId,
        sessionId: this.sessionId,
      },
    })
  }
}
