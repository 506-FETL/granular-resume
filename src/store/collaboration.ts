import { toast } from 'sonner'
import { create } from 'zustand'

import type { CollaborationCallbacks } from '@/lib/automerge/supabase-network-adapter'
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

  startSharing: (params: StartShareParams) => Promise<void>
  joinSession: (params: JoinShareParams) => Promise<void>
  stopSharing: (options?: { silent?: boolean }) => void
  handleRemoteShareEnd: () => void
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

  startSharing: async ({ resumeId, userId, userName }) => {
    const docManager = useResumeStore.getState().docManager
    if (!docManager) {
      throw new Error('文档尚未初始化，无法开启协作')
    }

    const existingSession = get().sessionId
    if (existingSession) {
      get().stopSharing({ silent: true })
    }

    const sessionId = createSessionId()
    const documentUrl = docManager.getDocumentUrl()
    const shareUrl = buildShareUrl(resumeId, sessionId, documentUrl ?? undefined)
    const color = get().selfColor ?? generateParticipantColor()

    // eslint-disable-next-line no-console
    console.log('🚀 开启协作会话', { sessionId, documentUrl, resumeId })

    set({
      isConnecting: true,
      error: null,
      selfColor: color,
    })

    let adapterPeerId: string | null = null

    const callbacks: CollaborationCallbacks = {
      presenceMetadata: {
        userId,
        userName,
        color,
        role: 'host',
      },
      onChannelReady: (channelName) => {
        set({ channelName })
      },
      onPeerJoin: ({ peerId, metadata }) => {
        if (peerId === adapterPeerId) return
        const displayName = metadata?.userName || metadata?.name || `协作者 ${peerId.slice(-4)}`
        toast.success(`${displayName} 加入协作`, { description: '已同步最新内容' })
        set((state) => ({
          participants: {
            ...state.participants,
            [peerId]: {
              peerId,
              metadata,
              joinedAt: Date.now(),
            },
          },
        }))
      },
      onPeerLeave: ({ peerId }) => {
        set((state) => {
          const updated = { ...state.participants }
          delete updated[peerId]
          return { participants: updated }
        })
        if (peerId !== adapterPeerId) {
          toast.info('协作者已离开', { description: `Peer ${peerId.slice(-4)}` })
        }
      },
      onControlMessage: ({ type }) => {
        if (type === 'share-ended' && get().role !== 'host') {
          get().handleRemoteShareEnd()
        }
      },
    }

    try {
      const adapter = docManager.enableCollaboration(sessionId, callbacks)
      adapterPeerId = adapter.peerId || null

      set({
        isSharing: true,
        isConnecting: false,
        role: 'host',
        sessionId,
        shareUrl,
        resumeId,
        roomName: buildRoomName(docManager.getDocumentUrl() ?? '', sessionId),
        participants: adapterPeerId
          ? {
              [adapterPeerId]: {
                peerId: adapterPeerId,
                metadata: {
                  userId,
                  userName,
                  color,
                  role: 'host',
                },
                joinedAt: Date.now(),
              },
            }
          : {},
        selfPeerId: adapterPeerId,
        error: null,
      })

      toast.success('已开启实时协作', { description: '现在可以将链接分享给他人了' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '开启协作失败'
      set({ isConnecting: false, error: message })
      toast.error(message)
      throw error
    }
  },

  joinSession: async ({ sessionId, resumeId, userId, userName }) => {
    const docManager = useResumeStore.getState().docManager
    if (!docManager) {
      throw new Error('文档尚未初始化，无法加入协作')
    }

    if (get().sessionId === sessionId && get().isSharing) {
      return
    }

    const color = get().selfColor ?? generateParticipantColor()

    // eslint-disable-next-line no-console
    console.log('🔗 加入协作会话', { sessionId, resumeId, documentUrl: docManager.getDocumentUrl() })

    set({
      isConnecting: true,
      error: null,
      selfColor: color,
    })

    let adapterPeerId: string | null = null

    const callbacks: CollaborationCallbacks = {
      presenceMetadata: {
        userId,
        userName,
        color,
        role: 'guest',
      },
      onChannelReady: (channelName) => {
        set({ channelName })
      },
      onPeerJoin: ({ peerId, metadata }) => {
        if (peerId === adapterPeerId) return
        const displayName = metadata?.userName || metadata?.name || `协作者 ${peerId.slice(-4)}`
        toast.success(`${displayName} 加入协作`, { description: '已同步最新内容' })
        set((state) => ({
          participants: {
            ...state.participants,
            [peerId]: {
              peerId,
              metadata,
              joinedAt: Date.now(),
            },
          },
        }))
      },
      onPeerLeave: ({ peerId }) => {
        set((state) => {
          const updated = { ...state.participants }
          delete updated[peerId]
          return { participants: updated }
        })
        if (peerId !== adapterPeerId) {
          toast.info('协作者已离开', { description: `Peer ${peerId.slice(-4)}` })
        }
      },
      onControlMessage: ({ type }) => {
        if (type === 'share-ended' && get().role !== 'host') {
          get().handleRemoteShareEnd()
        }
      },
    }

    try {
      const adapter = docManager.enableCollaboration(sessionId, callbacks)
      adapterPeerId = adapter.peerId || null

      set({
        isSharing: true,
        isConnecting: false,
        role: 'guest',
        sessionId,
        shareUrl: buildShareUrl(resumeId, sessionId, docManager.getDocumentUrl() ?? undefined),
        resumeId,
        roomName: buildRoomName(docManager.getDocumentUrl() ?? '', sessionId),
        participants: adapterPeerId
          ? {
              [adapterPeerId]: {
                peerId: adapterPeerId,
                metadata: {
                  userId,
                  userName,
                  color,
                  role: 'guest',
                },
                joinedAt: Date.now(),
              },
            }
          : {},
        selfPeerId: adapterPeerId,
        error: null,
      })

      toast.info('已加入实时协作', { description: '正在与发起者同步内容' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '加入协作失败'
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
    } catch (error: any) {
      toast.error('关闭协作时出错，请重试', error.message)
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
    })

    if (!silent) {
      toast.success(state.role === 'host' ? '已关闭实时协作' : '已退出实时协作')
    }
  },

  handleRemoteShareEnd: () => {
    const { role } = get()
    if (!role) return

    const docManager = useResumeStore.getState().docManager
    docManager?.disableCollaboration()

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
    })

    toast.warning('协作已结束', { description: '发起者已关闭实时协作' })
  },
}))

function createSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '').slice(0, 16)
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint8Array(12)
      crypto.getRandomValues(buffer)
      return Array.from(buffer, (byte) => byte.toString(36)[0])
        .join('')
        .slice(0, 16)
    }
  } catch {
    // ignore
  }
  return Math.random().toString(36).slice(2, 18)
}

function buildShareUrl(resumeId: string, sessionId: string, documentUrl?: string) {
  const url = new URL(window.location.origin + '/editor')
  url.searchParams.set('resumeId', resumeId)
  url.searchParams.set('collabSession', sessionId)
  if (documentUrl) {
    url.searchParams.set('docUrl', documentUrl)
  }
  return url.toString()
}

function buildRoomName(documentUrl: string, sessionId: string) {
  // 使用文档URL的hash作为房间标识，确保相同文档的协作者在同一房间
  const docHash = documentUrl.split('/').pop() || documentUrl
  return `resume-collab:${docHash}:${sessionId}`
}

function generateParticipantColor() {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, 85%, 65%)`
}

export default useCollaborationStore
