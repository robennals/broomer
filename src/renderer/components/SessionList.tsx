import type { Session, SessionStatus } from '../store/sessions'

interface SessionListProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

const statusColors: Record<SessionStatus, string> = {
  working: 'bg-status-working',
  waiting: 'bg-status-waiting',
  idle: 'bg-status-idle',
  error: 'bg-status-error',
}

const statusLabels: Record<SessionStatus, string> = {
  working: 'Working',
  waiting: 'Waiting',
  idle: 'Idle',
  error: 'Error',
}

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionListProps) {
  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    onDeleteSession(sessionId)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onNewSession}
          className="w-full py-2 px-3 bg-accent hover:bg-accent/80 text-white text-sm font-medium rounded transition-colors"
        >
          + New Session
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group relative w-full text-left p-3 rounded mb-1 transition-colors cursor-pointer ${
              session.id === activeSessionId ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${statusColors[session.status]}`}
                title={statusLabels[session.status]}
              />
              <span className="font-medium text-sm text-text-primary truncate flex-1">
                {session.name}
              </span>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-status-error transition-opacity p-1 -m-1"
                title="Delete session"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="truncate">{session.branch}</span>
            </div>
            <div className="text-xs text-text-secondary/60 mt-1 truncate">
              {statusLabels[session.status]}
            </div>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-text-secondary text-sm py-8">
            No sessions yet.
            <br />
            Click "+ New Session" to start.
          </div>
        )}
      </div>
    </div>
  )
}
