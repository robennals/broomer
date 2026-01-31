import { useEffect } from 'react'
import Layout from './components/Layout'
import SessionList from './components/SessionList'
import Terminal from './components/Terminal'
import FilePanel from './components/FilePanel'
import { useSessionStore, type Session, type SessionStatus } from './store/sessions'

// Re-export types for backwards compatibility
export type { Session, SessionStatus }

function App() {
  const {
    sessions,
    activeSessionId,
    isLoading,
    loadSessions,
    addSession,
    removeSession,
    setActiveSession,
    refreshAllBranches,
  } = useSessionStore()

  const [showFilePanel, setShowFilePanel] = React.useState(false)
  const [showUserTerminal, setShowUserTerminal] = React.useState(false)

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

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
      try {
        await addSession(folderPath)
      } catch (error) {
        console.error('Failed to add session:', error)
        // Could show an error toast here
      }
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
    <Layout
      showFilePanel={showFilePanel}
      showUserTerminal={showUserTerminal}
      sidebar={
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSession}
          onNewSession={handleNewSession}
          onDeleteSession={removeSession}
        />
      }
      mainTerminal={
        <div className="h-full w-full relative">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`absolute inset-0 ${session.id === activeSessionId ? '' : 'hidden'}`}
            >
              <Terminal sessionId={session.id} cwd={session.directory} />
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
      filePanel={showFilePanel ? <FilePanel directory={activeSession?.directory} /> : null}
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
      onToggleFilePanel={() => setShowFilePanel(!showFilePanel)}
      onToggleUserTerminal={() => setShowUserTerminal(!showUserTerminal)}
    />
  )
}

// Need to import React for useState
import React from 'react'

export default App
