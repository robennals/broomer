/**
 * Reusable error banner displayed at app, panel, or dialog level.
 *
 * Shows a human-friendly error message with click-to-expand detail and a dismiss button.
 * Mirrors the existing SCPrBanner git-op error styling (red border/background).
 */
import { useErrorStore, type AppError } from '../store/errors'
import { humanizeError } from '../utils/knownErrors'

interface ErrorBannerProps {
  error: AppError
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  const { dismissError, showErrorDetail } = useErrorStore()

  return (
    <div className="px-3 py-2 border-b border-red-500/30 bg-red-500/10 flex items-center gap-2">
      <button
        onClick={() => showErrorDetail(error)}
        className="flex-1 text-xs text-red-400 cursor-pointer hover:text-red-300 truncate text-left"
        title="Click to view full error"
      >
        {error.displayMessage}
      </button>
      <button
        onClick={() => dismissError(error.id)}
        className="text-red-400 hover:text-red-300 text-xs shrink-0 px-1"
        title="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}

/**
 * Thin wrapper for dialog views that use local `useState<string | null>` for errors.
 *
 * Adapts the local string error state into an AppError shape, runs it through
 * humanizeError, and renders the same banner styling. Replaces the inline
 * `<div className="text-xs text-red-400 ...">` pattern used in dialog views.
 */
interface DialogErrorBannerProps {
  error: string
  onDismiss: () => void
}

export function DialogErrorBanner({ error, onDismiss }: DialogErrorBannerProps) {
  const displayMessage = humanizeError(error)
  const { showErrorDetail } = useErrorStore()

  const handleClick = () => {
    showErrorDetail({
      id: 'dialog-error',
      message: error,
      displayMessage,
      detail: displayMessage !== error ? error : undefined,
      scope: 'app',
      dismissed: false,
      timestamp: Date.now(),
    })
  }

  return (
    <div className="px-3 py-2 border border-red-500/30 bg-red-500/10 rounded flex items-center gap-2">
      <button
        onClick={handleClick}
        className="flex-1 text-xs text-red-400 cursor-pointer hover:text-red-300 text-left whitespace-pre-wrap"
        title="Click to view full error"
      >
        {displayMessage}
      </button>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 text-xs shrink-0 px-1"
        title="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}
