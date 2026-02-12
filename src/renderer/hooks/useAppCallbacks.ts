import { useCallback } from 'react'
import { useSessionStore, type Session, type LayoutSizes } from '../store/sessions'
import { useErrorStore } from '../store/errors'
import { PANEL_IDS } from '../panels'
import type { AgentConfig } from '../store/agents'

interface AppCallbacksDeps {
  sessions: Session[]
  activeSessionId: string | undefined
  agents: AgentConfig[]
  addSession: (directory: string, agentId: string | null, extra?: { repoId?: string; issueNumber?: number; issueTitle?: string; name?: string; sessionType?: 'default' | 'review'; prNumber?: number; prTitle?: string; prUrl?: string; prBaseBranch?: string }) => Promise<void>
  setActiveSession: (id: string | null) => void
  togglePanel: (sessionId: string, panelId: string) => void
  updateLayoutSize: (id: string, key: keyof LayoutSizes, value: number) => void
  setFileViewerPosition: (id: string, position: 'top' | 'left') => void
  updatePrState: (sessionId: string, prState: string | null, prNumber?: number, prUrl?: string) => void
  setShowNewSessionDialog: (show: boolean) => void
}

export function useAppCallbacks({
  sessions,
  activeSessionId,
  agents,
  addSession,
  setActiveSession,
  togglePanel,
  updateLayoutSize,
  setFileViewerPosition,
  updatePrState,
  setShowNewSessionDialog,
}: AppCallbacksDeps) {
  const { addError } = useErrorStore()

  const handleNewSession = useCallback(() => {
    setShowNewSessionDialog(true)
  }, [setShowNewSessionDialog])

  const handleNewSessionComplete = useCallback(async (
    directory: string,
    agentId: string | null,
    extra?: { repoId?: string; issueNumber?: number; issueTitle?: string; name?: string; sessionType?: 'default' | 'review'; prNumber?: number; prTitle?: string; prUrl?: string; prBaseBranch?: string }
  ) => {
    try {
      await addSession(directory, agentId, extra)
    } catch (error) {
      addError(`Failed to add session: ${error instanceof Error ? error.message : String(error)}`)
    }
    setShowNewSessionDialog(false)
  }, [addSession, addError, setShowNewSessionDialog])

  const handleCancelNewSession = useCallback(() => {
    setShowNewSessionDialog(false)
  }, [setShowNewSessionDialog])

  const refreshPrStatus = useCallback(async () => {
    for (const session of sessions) {
      try {
        const prResult = await window.gh.prStatus(session.directory)
        if (prResult) {
          updatePrState(session.id, prResult.state, prResult.number, prResult.url)
        } else {
          updatePrState(session.id, null)
        }
      } catch {
        // Ignore errors for individual sessions
      }
    }
  }, [sessions, updatePrState])

  const getAgentCommand = useCallback((session: Session) => {
    if (!session.agentId) return undefined
    const agent = agents.find((a) => a.id === session.agentId)
    return agent?.command
  }, [agents])

  const getAgentEnv = useCallback((session: Session) => {
    if (!session.agentId) return undefined
    const agent = agents.find((a) => a.id === session.agentId)
    return agent?.env
  }, [agents])

  const handleLayoutSizeChange = useCallback((key: keyof LayoutSizes, value: number) => {
    if (activeSessionId) {
      updateLayoutSize(activeSessionId, key, value)
    }
  }, [activeSessionId, updateLayoutSize])

  const handleFileViewerPositionChange = useCallback((position: 'top' | 'left') => {
    if (activeSessionId) {
      setFileViewerPosition(activeSessionId, position)
    }
  }, [activeSessionId, setFileViewerPosition])

  const handleSelectSession = useCallback((id: string) => {
    setActiveSession(id)
    requestAnimationFrame(() => {
      const container = document.querySelector(`[data-panel-id="${PANEL_IDS.AGENT_TERMINAL}"]`)
      if (!container) return
      const xtermTextarea = container.querySelector('.xterm-helper-textarea')
      if (xtermTextarea) {
        xtermTextarea.focus()
      }
    })
  }, [setActiveSession])

  const handleTogglePanel = useCallback((panelId: string) => {
    if (activeSessionId) {
      togglePanel(activeSessionId, panelId)
    }
  }, [activeSessionId, togglePanel])

  const handleToggleFileViewer = useCallback(() => {
    if (activeSessionId) {
      togglePanel(activeSessionId, PANEL_IDS.FILE_VIEWER)
    }
  }, [activeSessionId, togglePanel])

  return {
    handleNewSession,
    handleNewSessionComplete,
    handleCancelNewSession,
    refreshPrStatus,
    getAgentCommand,
    getAgentEnv,
    handleLayoutSizeChange,
    handleFileViewerPositionChange,
    handleSelectSession,
    handleTogglePanel,
    handleToggleFileViewer,
  }
}
