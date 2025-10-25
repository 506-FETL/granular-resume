import supabase from '@/lib/supabase/client'
import { NetworkAdapter, type Message, type PeerId, type PeerMetadata } from '@automerge/automerge-repo'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface CollaborationCallbacks {
  onPeerJoin?: (payload: { peerId: string; metadata?: Record<string, any> }) => void
  onPeerLeave?: (payload: { peerId: string }) => void
  onChannelReady?: (channelName: string) => void
  onControlMessage?: (payload: { type: string; data?: Record<string, any> }) => void
  presenceMetadata?: Record<string, any>
}

/**
 * Supabase Realtime Network Adapter for Automerge
 * 使用 Supabase Realtime 作为 Automerge 的网络传输层，并允许按会话隔离协作。
 */
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

  constructor(resumeId: string, sessionId: string, callbacks: CollaborationCallbacks = {}) {
    super()
    this.resumeId = resumeId
    this.sessionId = sessionId
    this.callbacks = callbacks
    this.channelName = `automerge:${this.resumeId}:${this.sessionId}`
    this.presenceMetadata = callbacks.presenceMetadata || {}
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

      const handlePeerCandidate = () => {
        off()
      }

      this.once('peer-candidate', handlePeerCandidate)
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
    this.channel = supabase.channel(this.channelName)

    // 监听其他 peer 的消息
    this.channel.on('broadcast', { event: 'automerge-sync' }, (payload: any) => {
      const { senderId, targetId, messageType, documentId, message } = payload.payload

      // eslint-disable-next-line no-console
      console.log('📨 收到同步消息', {
        from: senderId,
        to: targetId,
        myPeerId: this.peerId,
        messageType,
        documentId,
        messageLength: message?.length || 0,
        hasListeners: this.listenerCount('message'),
      })

      // 只处理发给自己的消息或广播消息
      if (targetId && targetId !== this.peerId) {
        // eslint-disable-next-line no-console
        console.log('⏭️ 跳过消息（不是发给我的）', { targetId, myPeerId: this.peerId })
        return
      }

      const uint8Array = this.base64ToUint8Array(message)

      const messageObj: Message = {
        type: messageType || 'message',
        senderId,
        targetId: targetId || this.peerId!,
        data: uint8Array,
      }

      if (documentId) {
        ;(messageObj as any).documentId = documentId
      }

      // eslint-disable-next-line no-console
      console.log('🔄 正在触发 message 事件', {
        senderId,
        targetId: messageObj.targetId,
        bytes: uint8Array.length,
        messageType: messageObj.type,
        documentId,
        listenerCount: this.listenerCount('message'),
      })

      this.emit('message', messageObj)

      // eslint-disable-next-line no-console
      console.log('✅ message 事件已触发')
    })

    // 监听 peer 加入
    this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      // eslint-disable-next-line no-console
      console.log('👋 有新用户加入', {
        count: newPresences.length,
        presences: newPresences,
        myPeerId: this.peerId,
      })

      newPresences.forEach((presence: any) => {
        const remotePeerId = presence.peerId

        if (remotePeerId && remotePeerId !== this.peerId) {
          // eslint-disable-next-line no-console
          console.log('🤝 发现新 peer，触发 peer-candidate', {
            remotePeerId,
            myPeerId: this.peerId,
            listenerCount: this.listenerCount('peer-candidate'),
          })

          this.emit('peer-candidate', {
            peerId: remotePeerId,
            peerMetadata: presence.metadata || {},
          })

          this.callbacks.onPeerJoin?.({
            peerId: remotePeerId,
            metadata: presence.metadata || {},
          })
        }
      })
    })

    // 监听控制消息
    this.channel.on('broadcast', { event: 'automerge-control' }, (payload: any) => {
      const { type, data } = payload.payload || {}

      // eslint-disable-next-line no-console
      console.log('🎛️ 收到协作控制消息', { type, data })

      if (type) {
        this.callbacks.onControlMessage?.({ type, data })
      }
    })

    // 监听 peer 离开
    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        const remotePeerId = presence.peerId

        if (remotePeerId && remotePeerId !== this.peerId) {
          // eslint-disable-next-line no-console
          console.log('👋 Peer 离开', { remotePeerId })

          this.emit('peer-disconnected', { peerId: remotePeerId })
          this.callbacks.onPeerLeave?.({ peerId: remotePeerId })
        }
      })
    })

    // 订阅频道
    this.channel.subscribe(async (status) => {
      // eslint-disable-next-line no-console
      console.log('📡 频道订阅状态变化', { status, channelName: this.channelName })

      if (status === 'SUBSCRIBED') {
        await this.channel!.track({
          peerId: this.peerId,
          metadata: { ...(peerMetadata || {}), ...this.presenceMetadata },
          online_at: new Date().toISOString(),
          sessionId: this.sessionId,
        })

        this.ready = true

        // eslint-disable-next-line no-console
        console.log('🔗 Automerge 网络适配器已连接', {
          channelName: this.channelName,
          peerId: this.peerId,
          messageListeners: this.listenerCount('message'),
          peerCandidateListeners: this.listenerCount('peer-candidate'),
        })

        this.callbacks.onChannelReady?.(this.channelName)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.channel) {
      this.channel.unsubscribe()
      this.channel = null
    }
    this.ready = false

    // eslint-disable-next-line no-console
    console.log('🔌 Automerge 网络适配器已断开', { peerId: this.peerId })
  }

  /**
   * 发送消息给其他 peer
   */
  send(message: Message): void {
    if (!this.channel || !this.ready) {
      // eslint-disable-next-line no-console
      console.warn('⚠️ 网络适配器未就绪，无法发送消息')
      return
    }

    if (!message.data) {
      return
    }

    const base64Message = this.uint8ArrayToBase64(message.data)

    // eslint-disable-next-line no-console
    console.log('📤 发送同步消息', {
      type: message.type,
      to: message.targetId,
      documentId: (message as any).documentId,
      dataLength: message.data.length,
      base64Length: base64Message.length,
    })

    this.channel.send({
      type: 'broadcast',
      event: 'automerge-sync',
      payload: {
        senderId: this.peerId,
        targetId: message.targetId,
        messageType: message.type,
        documentId: (message as any).documentId,
        message: base64Message,
        sessionId: this.sessionId,
      },
    })
  }

  getChannelName() {
    return this.channelName
  }

  broadcastControlMessage(type: string, data: Record<string, any> = {}) {
    if (!this.channel) return

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

  /**
   * Uint8Array 转 Base64
   */
  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...Array.from(uint8Array)))
  }

  /**
   * Base64 转 Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64)
    const uint8Array = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    return uint8Array
  }
}
