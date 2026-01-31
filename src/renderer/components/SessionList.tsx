import type { Session, SessionStatus } from '../App'

interface SessionListProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
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
}: SessionListProps) {
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
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full text-left p-3 rounded mb-1 transition-colors ${
              session.id === activeSessionId
                ? 'bg-bg-tertiary'
                : 'hover:bg-bg-tertiary/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${statusColors[session.status]}`}
                title={statusLabels[session.status]}
              />
              <span className="font-medium text-sm text-text-primary truncate">
                {session.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="truncate">{session.branch}</span>
            </div>
            <div className="text-xs text-text-secondary/60 mt-1 truncate">
              {statusLabels[session.status]}
            </div>
          </button>
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
