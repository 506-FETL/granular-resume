import type { ReactNode } from 'react'
import type { SupabaseUser } from './../../types'

export interface CollaborationPanelContextValue {
  isMobile: boolean
  isSyncing: boolean
  pendingChanges: boolean
  lastSyncTime: number | null
  isSharing: boolean
  isCollabConnecting: boolean
  collabDisabledReason: string | null
  shareButtonTooltip: string
  participantCount: number
  shareUrl: string | null
  collaborationRole: 'host' | 'guest' | null
  collaborationError: string | null
  canStartSharing: boolean
  collabDialogOpen: boolean
  onManualSync: () => void
  onCopyShareLink: () => void
  onStartSharing: () => Promise<void>
  onStopSharing: () => void
  openCollaborationDialog: () => void
  closeCollaborationDialog: () => void
  setCollaborationDialogOpen: (open: boolean) => void
}

export interface CollaborationPanelProviderProps {
  currentUser: SupabaseUser
  activeResumeId?: string
  userDisplayName: string
  children: ReactNode
}
