import type { CollaborationCallbacks } from '@/lib/automerge/supabase-network-adapter'
import { toast } from 'sonner'
import { create } from 'zustand'
import { clearStoredSession, rememberSessionRole } from '@/lib/collaboration/session-storage'
import { logger } from '@/lib/logger'
import useResumeStore from '@/store/resume/form'

type CollaborationRole = 'host' | 'guest'

interface Participant {
  peerId: string
  metadata?: Record<string, any>
  joinedAt: number
}

interface StartShareParams {
  resumeId: string
  userId: string
  userName: string
}

interface JoinShareParams extends StartShareParams {
  sessionId: string
}

interface CollaborationState {
  isSharing: boolean
  isConnecting: boolean
  role: CollaborationRole | null
  sessionId: string | null
  shareUrl: string | null
  channelName: string | null
  resumeId: string | null
  roomName: string | null
  participants: Record<string, Participant>
  error: string | null
  selfPeerId: string | null
  selfColor: string | null
  selfUserId: string | null
  shareEndedByRemote: boolean

  startSharing: (params: StartShareParams) => Promise<void>
  joinSession: (params: JoinShareParams) => Promise<void>
  resumeHosting: (params: JoinShareParams) => Promise<void>
  stopSharing: (options?: { silent?: boolean }) => void
  handleRemoteShareEnd: () => void
  acknowledgeRemoteShareEnd: () => void
}

/**
 * 生成协作参与者颜色
 */
function generateParticipantColor() {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 85%, 65%)`
}

/**
 * 生成会话ID
 */
function createSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint8Array(12)
      crypto.getRandomValues(buffer)
      return Array.from(buffer, byte => byte.toString(36)[0]).join('').slice(0, 16)
    }
  }
  catch {
    // ignore
  }
  return Math.random().toString(36).slice(2, 18)
}

/**
 * 构建分享URL
 */
function buildShareUrl(resumeId: string, sessionId: string) {
  const url = new URL(`${window.location.origin}/resume/editor`)
  url.searchParams.set('resumeId', resumeId)
  url.searchParams.set('collabSession', sessionId)
  return url.toString()
}

/**
 * 构建房间名称
 */
function buildRoomName(resumeId: string, sessionId: string) {
  return `resume-collab:${resumeId}:${sessionId}`
}

/**
 * 创建协作回调配置 - 统一的逻辑提取
 */
function createCollaborationCallbacks(params: {
  role: CollaborationRole
  userId: string
  userName: string
  color: string
  get: () => CollaborationState
  set: (state: Partial<CollaborationState> | ((state: CollaborationState) => Partial<CollaborationState>)) => void
  adapterPeerIdRef: { current: string | null }
}): CollaborationCallbacks {
  const { role, userId, userName, color, get, set, adapterPeerIdRef } = params

  return {
    presenceMetadata: { userId, userName, color, role },

    onChannelReady: (channelName) => {
      set({ channelName })
    },

    onPeerJoin: ({ peerId, metadata }) => {
      if (peerId === adapterPeerIdRef.current)
        return

      const displayName = metadata?.userName || metadata?.name || `协作者 ${peerId.slice(-4)}`
      toast.success(`${displayName} 加入协作`, { description: '已同步最新内容' })

      set(state => ({
        participants: {
          ...state.participants,
          [peerId]: { peerId, metadata, joinedAt: Date.now() },
        },
      }))
    },

    onPeerLeave: ({ peerId }) => {
      set((state) => {
        const updated = { ...state.participants }
        delete updated[peerId]
        return { participants: updated }
      })

      if (peerId !== adapterPeerIdRef.current) {
        toast.info('协作者已离开', { description: `Peer ${peerId.slice(-4)}` })
      }
    },

    onControlMessage: ({ type }) => {
      if (type === 'share-ended' && get().role !== 'host') {
        get().handleRemoteShareEnd()
      }
    },
  }
}

/**
 * 通用的协作启用逻辑
 */
async function enableCollaboration(params: {
  sessionId: string
  resumeId: string
  userId: string
  userName: string
  role: CollaborationRole
  shouldSaveSnapshot?: boolean
  get: () => CollaborationState
  set: (state: Partial<CollaborationState> | ((state: CollaborationState) => Partial<CollaborationState>)) => void
}) {
  const { sessionId, resumeId, userId, userName, role, shouldSaveSnapshot = false, get, set } = params

  const docManager = useResumeStore.getState().docManager
  if (!docManager) {
    throw new Error('文档尚未初始化，无法开启协作')
  }

  const color = get().selfColor ?? generateParticipantColor()
  set({ isConnecting: true, error: null, selfColor: color })

  const adapterPeerIdRef = { current: null as string | null }
  const callbacks = createCollaborationCallbacks({
    role,
    userId,
    userName,
    color,
    get,
    set,
    adapterPeerIdRef,
  })

  const adapter = await docManager.enableCollaboration(sessionId, callbacks)
  adapterPeerIdRef.current = adapter.peerId || null

  // 发起者保存最新快照到数据库
  if (shouldSaveSnapshot && docManager.getHandle()) {
    await docManager.saveToSupabase(docManager.getHandle()!)
  }

  const shareUrl = buildShareUrl(resumeId, sessionId)
  const roomName = buildRoomName(resumeId, sessionId)

  set({
    isSharing: true,
    isConnecting: false,
    role,
    sessionId,
    shareUrl,
    resumeId,
    roomName,
    participants: adapterPeerIdRef.current
      ? {
          [adapterPeerIdRef.current]: {
            peerId: adapterPeerIdRef.current,
            metadata: { userId, userName, color, role },
            joinedAt: Date.now(),
          },
        }
      : {},
    selfPeerId: adapterPeerIdRef.current,
    selfUserId: userId,
    error: null,
    shareEndedByRemote: false,
  })

  rememberSessionRole({ sessionId, resumeId, userId, role })
}

const useCollaborationStore = create<CollaborationState>()((set, get) => ({
  isSharing: false,
  isConnecting: false,
  role: null,
  sessionId: null,
  shareUrl: null,
  channelName: null,
  resumeId: null,
  roomName: null,
  participants: {},
  error: null,
  selfPeerId: null,
  selfColor: null,
  selfUserId: null,
  shareEndedByRemote: false,

  startSharing: async ({ resumeId, userId, userName }) => {
    const existingSession = get().sessionId
    if (existingSession) {
      get().stopSharing({ silent: true })
    }

    const sessionId = createSessionId()
    logger.automerge.collab('开启协作会话', { sessionId, resumeId })

    try {
      await enableCollaboration({
        sessionId,
        resumeId,
        userId,
        userName,
        role: 'host',
        shouldSaveSnapshot: true,
        get,
        set,
      })

      toast.success('已开启实时协作', { description: '现在可以将链接分享给他人了' })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : '开启协作失败'
      set({ isConnecting: false, error: message })
      toast.error(message)
      throw error
    }
  },

  joinSession: async ({ sessionId, resumeId, userId, userName }) => {
    if (get().sessionId === sessionId && get().isSharing) {
      return
    }

    logger.automerge.collab('加入协作会话', { sessionId, resumeId })

    try {
      await enableCollaboration({
        sessionId,
        resumeId,
        userId,
        userName,
        role: 'guest',
        shouldSaveSnapshot: false,
        get,
        set,
      })

      toast.info('已加入实时协作', { description: '正在与发起者同步内容' })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : '加入协作失败'
      set({ isConnecting: false, error: message })
      toast.error(message)
      throw error
    }
  },

  resumeHosting: async ({ sessionId, resumeId, userId, userName }) => {
    logger.automerge.collab('恢复协作会话', { sessionId, resumeId })

    try {
      await enableCollaboration({
        sessionId,
        resumeId,
        userId,
        userName,
        role: 'host',
        shouldSaveSnapshot: false,
        get,
        set,
      })

      toast.success('已恢复实时协作', { description: '协作者可以继续编辑' })
    }
    catch (error) {
      const message = error instanceof Error ? error.message : '恢复协作失败'
      set({ isConnecting: false, error: message })
      toast.error(message)
      throw error
    }
  },

  stopSharing: ({ silent } = {}) => {
    const state = get()

    if (!state.isSharing && !state.sessionId) {
      return
    }

    const docManager = useResumeStore.getState().docManager
    if (state.role === 'host' && state.sessionId && docManager) {
      docManager.broadcastCollaborationEvent('share-ended', { reason: 'host_closed' })
    }

    try {
      docManager?.disableCollaboration()
    }
    catch (error: any) {
      toast.error('关闭协作时出错，请重试', error.message)
    }

    if (state.sessionId && state.resumeId && state.selfUserId) {
      clearStoredSession(state.sessionId, state.resumeId, state.selfUserId)
    }

    set({
      isSharing: false,
      isConnecting: false,
      role: null,
      sessionId: null,
      shareUrl: null,
      channelName: null,
      resumeId: null,
      roomName: null,
      participants: {},
      error: null,
      selfPeerId: null,
      selfUserId: null,
      shareEndedByRemote: false,
    })

    if (!silent) {
      toast.success(state.role === 'host' ? '已关闭实时协作' : '已退出实时协作')
    }
  },

  handleRemoteShareEnd: () => {
    const { role, sessionId, resumeId, selfUserId } = get()
    if (!role)
      return

    const docManager = useResumeStore.getState().docManager
    docManager?.disableCollaboration()

    if (sessionId && resumeId && selfUserId) {
      clearStoredSession(sessionId, resumeId, selfUserId)
    }

    set({
      isSharing: false,
      isConnecting: false,
      sessionId: null,
      shareUrl: null,
      channelName: null,
      resumeId: null,
      roomName: null,
      participants: {},
      role: null,
      selfPeerId: null,
      selfUserId: null,
      shareEndedByRemote: true,
    })

    toast.warning('协作已结束', { description: '发起者已关闭实时协作' })
  },

  acknowledgeRemoteShareEnd: () => {
    if (get().shareEndedByRemote) {
      set({ shareEndedByRemote: false })
    }
  },
}))

export default useCollaborationStore
