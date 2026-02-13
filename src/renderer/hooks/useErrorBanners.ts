/**
 * Convenience hooks for accessing the most recent undismissed error at each scope level.
 */
import { useErrorStore, type AppError } from '../store/errors'

/** Most recent undismissed app-scope error, or null. */
export function useAppBannerError(): AppError | null {
  return useErrorStore((state) =>
    state.errors.find((e) => !e.dismissed && e.scope === 'app') ?? null
  )
}

/** Most recent undismissed error for a specific panel, or null. */
export function usePanelBannerError(panelId: string): AppError | null {
  return useErrorStore((state) =>
    state.errors.find(
      (e) => !e.dismissed && typeof e.scope === 'object' && 'panel' in e.scope && e.scope.panel === panelId
    ) ?? null
  )
}

/** Most recent undismissed error for a specific dialog, or null. */
export function useDialogBannerError(dialogId: string): AppError | null {
  return useErrorStore((state) =>
    state.errors.find(
      (e) => !e.dismissed && typeof e.scope === 'object' && 'dialog' in e.scope && e.scope.dialog === dialogId
    ) ?? null
  )
}
