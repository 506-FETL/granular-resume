import type { Message, PeerId, PeerMetadata } from '@automerge/automerge-repo'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { NetworkAdapter } from '@automerge/automerge-repo'
import supabase from '@/lib/supabase/client'

export interface CollaborationCallbacks {
  onPeerJoin?: (payload: { peerId: string, metadata?: Record<string, any> }) => void
  onPeerLeave?: (payload: { peerId: string }) => void
  onChannelReady?: (channelName: string) => void
  onControlMessage?: (payload: { type: string, data?: Record<string, any> }) => void
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
  // 本地 documentUrl（handle.url），用于在接收消息时将来自网络的 documentId 映射到本地 handle
  private localDocumentUrl: string | null = null
  private localDocumentId: string | null = null
  // 收到但尚未分派到本地文档的消息缓存（当本地文档信息未知时使用）
  private pendingMessages: Array<{ senderId: any, targetId: any, messageType: any, documentId: any, message: string }>
    = []

  /**
   * note: 使用 resumeId 而不是文档本地 URL 来生成频道名，resumeId 在不同浏览器/设备上是稳定的
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
   * 设置本地文档信息（Automerge handle.url + documentId），用于将远端消息映射到本地文档
   */
  setLocalDocumentInfo({ documentUrl, documentId }: { documentUrl: string | null, documentId: string | null }) {
    this.localDocumentUrl = documentUrl
    this.localDocumentId = documentId
    if (this.localDocumentId) {
      // 冲刷队列（最多 200 条以防内存泄漏）
      const toFlush = this.pendingMessages.splice(0, 200)
      toFlush.forEach(({ senderId, targetId, messageType, documentId, message }) => {
        try {
          const uint8Array = this.base64ToUint8Array(message)
          const resolvedDocumentId = this.localDocumentId || documentId
          const messageObj: Message = {
            type: messageType || 'message',
            senderId,
            targetId: targetId || this.peerId!,
            data: uint8Array,
          }
          // 设置消息的 documentId 和 channelId
          ;(messageObj as any).documentId = resolvedDocumentId
          ;(messageObj as any).channelId = resolvedDocumentId

          // debug: 打印将要发给 repo 的消息结构
          // eslint-disable-next-line no-console
          console.log('🧭 冲刷缓存并发给 repo', {
            emittedMessage: messageObj,
            originalDocumentId: documentId,
            mappedDocumentId: resolvedDocumentId,
          })

          // 发给 repo
          this.emit('message', messageObj)
        }
        catch {
          // ignore individual message errors
        }
      })
    }
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

      // 如果本地文档信息还未就绪，则缓存消息，等待 setLocalDocumentInfo 时冲刷
      if (!this.localDocumentId) {
        // 限制队列长度
        if (this.pendingMessages.length < 1000) {
          this.pendingMessages.push({ senderId, targetId, messageType, documentId, message })
        }

        // 记录并返回
        // eslint-disable-next-line no-console
        console.log('⚠️ localDocumentId 未就绪，已缓存同步消息', { senderId, targetId, documentId })
        return
      }

      const uint8Array = this.base64ToUint8Array(message)

      const messageObj: Message = {
        type: messageType || 'message',
        senderId,
        targetId: targetId || this.peerId!,
        data: uint8Array,
      }

      const resolvedDocumentId = this.localDocumentId || documentId || this.resumeId

      // 设置消息的 documentId 和 channelId，优先映射到本地文档 URL
      ;(messageObj as any).documentId = resolvedDocumentId
      ;(messageObj as any).channelId = resolvedDocumentId

      // debug: 打印接收到的消息
      // eslint-disable-next-line no-console
      console.log('🧭 接收并处理消息', {
        documentId,
        emittedMessage: messageObj,
      })

      // eslint-disable-next-line no-console
      console.log('🔄 正在触发 message 事件', {
        senderId,
        targetId: messageObj.targetId,
        bytes: uint8Array.length,
        messageType: messageObj.type,
        originalDocumentId: documentId,
        mappedDocumentId: resolvedDocumentId,
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
        // Supabase presence 的结构可能包含 key、session_id、metadata 等
        const remotePeerId = presence.key || presence.peerId || presence.metadata?.peerId

        if (remotePeerId && String(remotePeerId) !== String(this.peerId)) {
          // eslint-disable-next-line no-console
          console.log('🤝 发现新 peer，触发 peer-candidate', {
            remotePeerId,
            myPeerId: this.peerId,
            listenerCount: this.listenerCount('peer-candidate'),
          })

          this.emit('peer-candidate', {
            // PeerId 在类型上是一个品牌类型，做简单断言以兼容外部字符串
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

      // eslint-disable-next-line no-console
      console.log('🎛️ 收到协作控制消息', { type, data })

      if (type) {
        this.callbacks.onControlMessage?.({ type, data })
      }
    })

    // 监听 peer 离开
    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        const remotePeerId = presence.key || presence.peerId || presence.metadata?.peerId

        if (remotePeerId && String(remotePeerId) !== String(this.peerId)) {
          // eslint-disable-next-line no-console
          console.log('👋 Peer 离开', { remotePeerId })

          this.emit('peer-disconnected', { peerId: String(remotePeerId) as unknown as PeerId })
          this.callbacks.onPeerLeave?.({ peerId: String(remotePeerId) })
        }
      })
    })

    // 订阅频道
    this.channel.subscribe(async (status) => {
      // eslint-disable-next-line no-console
      console.log('📡 频道订阅状态变化', { status, channelName: this.channelName })

      if (status === 'SUBSCRIBED') {
        // 使用 key 字段作为 presence 的唯一标识，这与 useRealtimeCursors 的 track 调用一致
        await this.channel!.track({
          key: String(this.peerId),
          metadata: { ...(peerMetadata || {}), ...this.presenceMetadata, peerId: String(this.peerId) },
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

    // 优先使用 message 中携带的 documentId（通常由 automerge-repo 提供），若不存在则使用本地 known documentUrl，最后回退到 resumeId
    const outgoingDocumentId = (message as any).documentId || this.localDocumentId || this.resumeId

    this.channel.send({
      type: 'broadcast',
      event: 'automerge-sync',
      payload: {
        senderId: this.peerId,
        targetId: message.targetId,
        messageType: message.type,
        // 发送 resumeId 作为 documentId，确保频道内所有客户端都能识别这是同一个业务文档
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
