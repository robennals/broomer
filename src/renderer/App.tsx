import React, { useEffect } from 'react'
import Layout from './components/Layout'
import SessionList from './components/SessionList'
import Terminal from './components/Terminal'
import Explorer from './components/Explorer'
import FileViewer from './components/FileViewer'
import DiffPanel from './components/DiffPanel'
import AgentSettings from './components/AgentSettings'
import NewSessionDialog from './components/NewSessionDialog'
import { useSessionStore, type Session, type SessionStatus, type LayoutSizes } from './store/sessions'
import { useAgentStore } from './store/agents'
import { useErrorStore } from './store/errors'

// Re-export types for backwards compatibility
export type { Session, SessionStatus }

// Default layout sizes for when there's no active session
const DEFAULT_LAYOUT_SIZES: LayoutSizes = {
  explorerWidth: 256,
  fileViewerSize: 300,
  userTerminalHeight: 192,
  diffPanelWidth: 320,
}

function App() {
  const {
    sessions,
    activeSessionId,
    isLoading,
    showSidebar,
    sidebarWidth,
    loadSessions,
    addSession,
    removeSession,
    setActiveSession,
    refreshAllBranches,
    toggleSidebar,
    setSidebarWidth,
    toggleAgentTerminal,
    toggleUserTerminal,
    toggleExplorer,
    toggleFileViewer,
    toggleDiff,
    selectFile,
    setFileViewerPosition,
    updateLayoutSize,
  } = useSessionStore()

  const { agents, loadAgents } = useAgentStore()
  const { addError } = useErrorStore()

  const [showSettings, setShowSettings] = React.useState(false)
  const [pendingFolderPath, setPendingFolderPath] = React.useState<string | null>(null)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Load sessions and agents on mount
  useEffect(() => {
    loadSessions()
    loadAgents()
  }, [loadSessions, loadAgents])

  // Poll for branch changes every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessions.length > 0) {
        refreshAllBranches()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessions.length, refreshAllBranches])

  const handleNewSession = async () => {
    const folderPath = await window.dialog.openFolder()
    if (folderPath) {
      setPendingFolderPath(folderPath)
    }
  }

  const handleAgentSelect = async (agentId: string | null) => {
    if (pendingFolderPath) {
      try {
        await addSession(pendingFolderPath, agentId)
      } catch (error) {
        addError(`Failed to add session: ${error instanceof Error ? error.message : error}`)
      }
      setPendingFolderPath(null)
    }
  }

  const handleCancelNewSession = () => {
    setPendingFolderPath(null)
  }

  const getAgentCommand = (session: Session) => {
    if (!session.agentId) return undefined
    const agent = agents.find((a) => a.id === session.agentId)
    return agent?.command
  }

  const handleLayoutSizeChange = (key: keyof LayoutSizes, value: number) => {
    if (activeSessionId) {
      updateLayoutSize(activeSessionId, key, value)
    }
  }

  const handleFileViewerPositionChange = (position: 'top' | 'left') => {
    if (activeSessionId) {
      setFileViewerPosition(activeSessionId, position)
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Layout
        showSidebar={showSidebar}
        showExplorer={activeSession?.showExplorer ?? false}
        showFileViewer={activeSession?.showFileViewer ?? false}
        showAgentTerminal={activeSession?.showAgentTerminal ?? true}
        showUserTerminal={activeSession?.showUserTerminal ?? false}
        showDiff={activeSession?.showDiff ?? false}
        showSettings={showSettings}
        fileViewerPosition={activeSession?.fileViewerPosition ?? 'top'}
        sidebarWidth={sidebarWidth}
        layoutSizes={activeSession?.layoutSizes ?? DEFAULT_LAYOUT_SIZES}
        onSidebarWidthChange={setSidebarWidth}
        onLayoutSizeChange={handleLayoutSizeChange}
        sidebar={
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSession}
            onNewSession={handleNewSession}
            onDeleteSession={removeSession}
          />
        }
        agentTerminal={
          <div className="h-full w-full relative">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`absolute inset-0 ${session.id === activeSessionId ? '' : 'hidden'}`}
              >
                <Terminal
                  sessionId={session.id}
                  cwd={session.directory}
                  command={getAgentCommand(session)}
                />
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="h-full w-full flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <p>No sessions yet.</p>
                  <p className="text-sm mt-2">Click "+ New Session" to add a git repository.</p>
                </div>
              </div>
            )}
          </div>
        }
        userTerminal={
          <div className="h-full w-full relative">
            {sessions.map((session) => (
              <div
                key={`user-${session.id}`}
                className={`absolute inset-0 ${session.id === activeSessionId ? '' : 'hidden'}`}
              >
                <Terminal sessionId={`user-${session.id}`} cwd={session.directory} />
              </div>
            ))}
          </div>
        }
        explorer={
          activeSession?.showExplorer ? (
            <Explorer
              directory={activeSession?.directory}
              onFileSelect={(filePath) => activeSessionId && selectFile(activeSessionId, filePath)}
              selectedFilePath={activeSession?.selectedFilePath}
            />
          ) : null
        }
        fileViewer={
          activeSession?.showFileViewer ? (
            <FileViewer
              filePath={activeSession?.selectedFilePath ?? null}
              position={activeSession?.fileViewerPosition ?? 'top'}
              onPositionChange={handleFileViewerPositionChange}
              onClose={() => activeSessionId && toggleFileViewer(activeSessionId)}
            />
          ) : null
        }
        diffPanel={
          activeSession?.showDiff ? (
            <DiffPanel directory={activeSession?.directory} />
          ) : null
        }
        settingsPanel={showSettings ? <AgentSettings onClose={() => setShowSettings(false)} /> : null}
        onToggleSidebar={toggleSidebar}
        onToggleExplorer={() => activeSessionId && toggleExplorer(activeSessionId)}
        onToggleFileViewer={() => activeSessionId && toggleFileViewer(activeSessionId)}
        onToggleAgentTerminal={() => activeSessionId && toggleAgentTerminal(activeSessionId)}
        onToggleUserTerminal={() => activeSessionId && toggleUserTerminal(activeSessionId)}
        onToggleDiff={() => activeSessionId && toggleDiff(activeSessionId)}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* New Session Dialog */}
      {pendingFolderPath && (
        <NewSessionDialog
          folderPath={pendingFolderPath}
          onSelect={handleAgentSelect}
          onCancel={handleCancelNewSession}
        />
      )}
    </>
  )
}

export default App
