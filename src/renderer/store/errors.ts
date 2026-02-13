/**
 * Application error tracking store.
 *
 * Collects runtime errors into a capped list (max 50) with timestamps and an
 * unread indicator. Errors are logged to console and displayed in the UI.
 * This store is purely in-memory and never persisted to disk.
 *
 * Errors have a scope (app, panel, or dialog) that determines where the banner
 * appears, a human-friendly displayMessage from the known-error catalog, and
 * optional raw detail text shown in the detail modal.
 */
import { create } from 'zustand'
import { humanizeError } from '../utils/knownErrors'

export type ErrorScope =
  | 'app'
  | { panel: string }
  | { dialog: string }

export interface AppError {
  id: string
  message: string
  displayMessage: string
  detail?: string
  scope: ErrorScope
  dismissed: boolean
  timestamp: number
}

interface ErrorStore {
  errors: AppError[]
  hasUnread: boolean
  detailError: AppError | null

  // Actions
  addError: (message: string) => void
  addScopedError: (opts: { message: string; scope: ErrorScope; detail?: string }) => void
  dismissError: (id: string) => void
  clearAll: () => void
  markRead: () => void
  showErrorDetail: (error: AppError) => void
  hideErrorDetail: () => void
}

const generateId = () => `error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],
  hasUnread: false,
  detailError: null,

  addError: (message: string) => {
    const displayMessage = humanizeError(message)
    const error: AppError = {
      id: generateId(),
      message,
      displayMessage,
      detail: displayMessage !== message ? message : undefined,
      scope: 'app',
      dismissed: false,
      timestamp: Date.now(),
    }
    console.error('[App Error]', message)
    set((state) => ({
      errors: [error, ...state.errors].slice(0, 50),
      hasUnread: true,
    }))
  },

  addScopedError: ({ message, scope, detail }: { message: string; scope: ErrorScope; detail?: string }) => {
    const displayMessage = humanizeError(message)
    const error: AppError = {
      id: generateId(),
      message,
      displayMessage,
      detail: detail ?? (displayMessage !== message ? message : undefined),
      scope,
      dismissed: false,
      timestamp: Date.now(),
    }
    console.error('[App Error]', message)
    set((state) => ({
      errors: [error, ...state.errors].slice(0, 50),
      hasUnread: true,
    }))
  },

  dismissError: (id: string) => {
    set((state) => ({
      errors: state.errors.map((e) => (e.id === id ? { ...e, dismissed: true } : e)),
    }))
  },

  clearAll: () => {
    set({ errors: [], hasUnread: false })
  },

  markRead: () => {
    set({ hasUnread: false })
  },

  showErrorDetail: (error: AppError) => {
    set({ detailError: error })
  },

  hideErrorDetail: () => {
    set({ detailError: null })
  },
}))
