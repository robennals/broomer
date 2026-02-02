import type { Session, SessionStatus, WaitingType } from '../store/sessions'

interface SessionListProps {
  sessions: Session[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

const statusLabels: Record<SessionStatus, string> = {
  working: 'Working',
  waiting: 'Waiting',
  idle: 'Idle',
  error: 'Error',
}

const waitingTypeIcons: Record<NonNullable<WaitingType>, { icon: string; label: string }> = {
  tool: { icon: '!', label: 'Tool approval needed' },
  question: { icon: '?', label: 'Question' },
  prompt: { icon: '>', label: 'Ready for input' },
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function StatusIndicator({ status, isUnread }: { status: SessionStatus; isUnread: boolean }) {
  if (status === 'working') {
    return <Spinner className="text-status-working" />
  }

  if (status === 'waiting') {
    return (
      <span
        className={`w-3 h-3 rounded-full bg-status-waiting ${
          isUnread ? 'animate-pulse shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]' : ''
        }`}
      />
    )
  }

  if (status === 'error') {
    return <span className="w-2 h-2 rounded-full bg-status-error" />
  }

  // idle
  return <span className="w-2 h-2 rounded-full bg-status-idle" />
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
        {sessions.map((session) => {
          const isUnread = session.isUnread && session.id !== activeSessionId
          const waitingInfo = session.waitingType ? waitingTypeIcons[session.waitingType] : null
          const needsAttention = session.status === 'waiting' && isUnread

          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`group relative w-full text-left p-3 rounded mb-1 transition-all cursor-pointer ${
                session.id === activeSessionId ? 'bg-bg-tertiary' : 'hover:bg-bg-tertiary/50'
              } ${needsAttention ? 'bg-status-waiting/10 border-l-2 border-status-waiting' : ''} ${
                isUnread && !needsAttention ? 'border-l-2 border-status-waiting/50' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Status indicator */}
                <StatusIndicator status={session.status} isUnread={isUnread} />
                <span className={`font-medium text-sm truncate flex-1 ${
                  needsAttention ? 'text-status-waiting font-semibold' :
                  isUnread ? 'text-text-primary font-semibold' : 'text-text-primary'
                }`}>
                  {session.name}
                </span>
                {/* Waiting type indicator */}
                {waitingInfo && session.status === 'waiting' && (
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                      needsAttention
                        ? 'bg-status-waiting text-bg-primary animate-pulse'
                        : 'bg-status-waiting/20 text-status-waiting'
                    }`}
                    title={waitingInfo.label}
                  >
                    {waitingInfo.icon}
                  </span>
                )}
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
              {/* Last message preview */}
              {session.lastMessage ? (
                <div className={`text-xs mt-1 truncate ${
                  needsAttention ? 'text-status-waiting/80' :
                  isUnread ? 'text-text-secondary' : 'text-text-secondary/60'
                }`}>
                  "{session.lastMessage}"
                </div>
              ) : (
                <div className="text-xs text-text-secondary/60 mt-1 truncate">
                  {statusLabels[session.status]}
                </div>
              )}
            </div>
          )
        })}

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
