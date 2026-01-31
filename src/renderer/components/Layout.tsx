import { ReactNode } from 'react'

interface LayoutProps {
  sidebar: ReactNode
  mainTerminal: ReactNode
  filePanel: ReactNode | null
  userTerminal: ReactNode | null
  showFilePanel: boolean
  showUserTerminal: boolean
  onToggleFilePanel: () => void
  onToggleUserTerminal: () => void
}

export default function Layout({
  sidebar,
  mainTerminal,
  filePanel,
  userTerminal,
  showFilePanel,
  showUserTerminal,
  onToggleFilePanel,
  onToggleUserTerminal,
}: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      {/* Title bar / toolbar - draggable region */}
      <div
        className="h-10 flex items-center justify-between px-4 bg-bg-secondary border-b border-border"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 pl-16">
          <span className="text-sm font-medium text-text-primary">Agent Manager</span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={onToggleUserTerminal}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showUserTerminal
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={onToggleFilePanel}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showFilePanel
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
          >
            Files
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-border bg-bg-secondary overflow-y-auto">
          {sidebar}
        </div>

        {/* Center + Right panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main terminal + File panel row */}
          <div className="flex-1 flex min-h-0">
            {/* Main terminal */}
            <div className="flex-1 min-w-0 bg-bg-primary">
              {mainTerminal}
            </div>

            {/* File panel (togglable) */}
            {filePanel && (
              <div className="w-80 flex-shrink-0 border-l border-border bg-bg-secondary overflow-y-auto">
                {filePanel}
              </div>
            )}
          </div>

          {/* User terminal (togglable) */}
          {userTerminal && (
            <div className="h-48 flex-shrink-0 border-t border-border bg-bg-primary">
              {userTerminal}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
