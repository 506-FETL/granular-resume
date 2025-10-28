import { createContext, useContext } from 'react'

import type { CollaborationPanelContextValue, CollaborationPanelProviderProps } from './collaboration-types'
import { useCollaborationPanelValue } from '../hooks/useCollaborationPanelValue'

const CollaborationPanelContext = createContext<CollaborationPanelContextValue | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useCollaborationPanel() {
  const context = useContext(CollaborationPanelContext)

  if (!context) {
    throw new Error('useCollaborationPanel must be used within CollaborationPanelProvider')
  }
  return context
}

export function CollaborationPanelProvider({
  currentUser,
  activeResumeId,
  userDisplayName,
  children,
}: CollaborationPanelProviderProps) {
  const value = useCollaborationPanelValue({ currentUser, activeResumeId, userDisplayName })

  return <CollaborationPanelContext value={value}>{children}</CollaborationPanelContext>
}
