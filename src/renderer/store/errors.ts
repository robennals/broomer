import { create } from 'zustand'

export interface AppError {
  id: string
  message: string
  timestamp: number
}

interface ErrorStore {
  errors: AppError[]
  hasUnread: boolean

  // Actions
  addError: (message: string) => void
  dismissError: (id: string) => void
  clearAll: () => void
  markRead: () => void
}

const generateId = () => `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useErrorStore = create<ErrorStore>((set) => ({
  errors: [],
  hasUnread: false,

  addError: (message: string) => {
    const error: AppError = {
      id: generateId(),
      message,
      timestamp: Date.now(),
    }
    console.error('[App Error]', message)
    set((state) => ({
      errors: [error, ...state.errors].slice(0, 50), // Keep last 50 errors
      hasUnread: true,
    }))
  },

  dismissError: (id: string) => {
    set((state) => ({
      errors: state.errors.filter((e) => e.id !== id),
    }))
  },

  clearAll: () => {
    set({ errors: [], hasUnread: false })
  },

  markRead: () => {
    set({ hasUnread: false })
  },
}))
