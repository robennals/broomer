import { ReactNode, useEffect } from 'react'
import ErrorIndicator from './ErrorIndicator'

// Detect if we're on Mac for keyboard shortcut display
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

interface LayoutProps {
  sidebar: ReactNode
  agentTerminal: ReactNode
  userTerminal: ReactNode
  fileTree: ReactNode | null
  diffPanel: ReactNode | null
  settingsPanel: ReactNode | null
  showSidebar: boolean
  showFileTree: boolean
  showAgentTerminal: boolean
  showUserTerminal: boolean
  showDiff: boolean
  showSettings: boolean
  onToggleSidebar: () => void
  onToggleFileTree: () => void
  onToggleAgentTerminal: () => void
  onToggleUserTerminal: () => void
  onToggleDiff: () => void
  onToggleSettings: () => void
}

// Keyboard shortcut helper
const formatShortcut = (key: string) => {
  const modifier = isMac ? '⌘' : 'Ctrl+'
  return `${modifier}${key}`
}

export default function Layout({
  sidebar,
  agentTerminal,
  userTerminal,
  fileTree,
  diffPanel,
  settingsPanel,
  showSidebar,
  showFileTree,
  showAgentTerminal,
  showUserTerminal,
  showDiff,
  showSettings,
  onToggleSidebar,
  onToggleFileTree,
  onToggleAgentTerminal,
  onToggleUserTerminal,
  onToggleDiff,
  onToggleSettings,
}: LayoutProps) {
  // Keyboard shortcuts - use capture phase to intercept before terminal gets them
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows/Linux)
      if (!(e.metaKey || e.ctrlKey)) return

      // Ignore if typing in a regular input (but allow in terminal)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '1':
          e.preventDefault()
          e.stopPropagation()
          onToggleSidebar()
          break
        case '2':
          e.preventDefault()
          e.stopPropagation()
          onToggleFileTree()
          break
        case '3':
          e.preventDefault()
          e.stopPropagation()
          onToggleAgentTerminal()
          break
        case '4':
          e.preventDefault()
          e.stopPropagation()
          onToggleUserTerminal()
          break
        case '5':
          e.preventDefault()
          e.stopPropagation()
          onToggleDiff()
          break
        case '6':
          e.preventDefault()
          e.stopPropagation()
          onToggleSettings()
          break
      }
    }

    // Use capture phase to get events before terminal
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onToggleSidebar, onToggleFileTree, onToggleAgentTerminal, onToggleUserTerminal, onToggleDiff, onToggleSettings])

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
          {/* Buttons ordered left-to-right matching UI layout */}
          <button
            onClick={onToggleSidebar}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showSidebar
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`Sessions (${formatShortcut('1')})`}
          >
            Sessions
          </button>
          <button
            onClick={onToggleFileTree}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showFileTree
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`File Explorer (${formatShortcut('2')})`}
          >
            Files
          </button>
          <button
            onClick={onToggleAgentTerminal}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showAgentTerminal
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`Agent Terminal (${formatShortcut('3')})`}
          >
            Agent
          </button>
          <button
            onClick={onToggleUserTerminal}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showUserTerminal
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`User Terminal (${formatShortcut('4')})`}
          >
            Terminal
          </button>
          <button
            onClick={onToggleDiff}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showDiff
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`Git Changes (${formatShortcut('5')})`}
          >
            Diff
          </button>
          <ErrorIndicator />
          <button
            onClick={onToggleSettings}
            className={`p-1.5 rounded transition-colors ${
              showSettings
                ? 'bg-accent text-white'
                : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
            }`}
            title={`Settings (${formatShortcut('6')})`}
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-56 flex-shrink-0 border-r border-border bg-bg-secondary overflow-y-auto">
            {sidebar}
          </div>
        )}

        {/* Center + Right panels */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main row: terminals + side panels */}
          <div className="flex-1 flex min-h-0">
            {/* Left side panels (File Tree) */}
            {fileTree && (
              <div className="w-64 flex-shrink-0 border-r border-border bg-bg-secondary overflow-y-auto">
                {fileTree}
              </div>
            )}

            {/* Center: terminals or settings */}
            <div className="flex-1 flex flex-col min-w-0">
              {settingsPanel ? (
                <div className="flex-1 min-w-0 bg-bg-secondary overflow-y-auto">
                  {settingsPanel}
                </div>
              ) : (
                <>
                  {/* Agent terminal */}
                  <div
                    className={`flex-1 min-w-0 bg-bg-primary ${
                      showAgentTerminal ? '' : 'hidden'
                    }`}
                  >
                    {agentTerminal}
                  </div>

                  {/* User terminal */}
                  <div
                    className={`h-48 flex-shrink-0 border-t border-border bg-bg-primary ${
                      showUserTerminal ? '' : 'hidden'
                    }`}
                  >
                    {userTerminal}
                  </div>

                  {/* Show placeholder if both terminals are hidden */}
                  {!showAgentTerminal && !showUserTerminal && (
                    <div className="flex-1 flex items-center justify-center bg-bg-primary text-text-secondary">
                      <div className="text-center">
                        <p>No panels visible</p>
                        <p className="text-sm mt-2">
                          Press {formatShortcut('3')} for Agent or {formatShortcut('4')} for Terminal
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right side panels (Diff) */}
            {diffPanel && (
              <div className="w-80 flex-shrink-0 border-l border-border bg-bg-secondary overflow-y-auto">
                {diffPanel}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
