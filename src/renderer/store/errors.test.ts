import { describe, it, expect, beforeEach } from 'vitest'
import { useErrorStore } from './errors'

describe('useErrorStore', () => {
  beforeEach(() => {
    useErrorStore.setState({ errors: [], hasUnread: false, detailError: null })
  })

  it('has correct initial state', () => {
    const state = useErrorStore.getState()
    expect(state.errors).toEqual([])
    expect(state.hasUnread).toBe(false)
    expect(state.detailError).toBeNull()
  })

  it('addError prepends an error with displayMessage and scope', () => {
    useErrorStore.getState().addError('Something went wrong')
    const state = useErrorStore.getState()
    expect(state.errors).toHaveLength(1)
    expect(state.errors[0].message).toBe('Something went wrong')
    expect(state.errors[0].displayMessage).toBe('Something went wrong')
    expect(state.errors[0].scope).toBe('app')
    expect(state.errors[0].dismissed).toBe(false)
    expect(state.errors[0].id).toMatch(/^error-/)
    expect(state.errors[0].timestamp).toBeGreaterThan(0)
  })

  it('addError humanizes known error patterns', () => {
    useErrorStore.getState().addError('fatal: Authentication failed for repo')
    const state = useErrorStore.getState()
    expect(state.errors[0].displayMessage).toBe('Git authentication failed. Check your SSH keys or HTTPS credentials.')
    expect(state.errors[0].detail).toBe('fatal: Authentication failed for repo')
  })

  it('addError sets hasUnread to true', () => {
    useErrorStore.getState().addError('error')
    expect(useErrorStore.getState().hasUnread).toBe(true)
  })

  it('addError prepends (newest first)', () => {
    useErrorStore.getState().addError('first')
    useErrorStore.getState().addError('second')
    const { errors } = useErrorStore.getState()
    expect(errors[0].message).toBe('second')
    expect(errors[1].message).toBe('first')
  })

  it('addError caps at 50 errors', () => {
    for (let i = 0; i < 60; i++) {
      useErrorStore.getState().addError(`error-${i}`)
    }
    expect(useErrorStore.getState().errors).toHaveLength(50)
  })

  it('addScopedError creates error with given scope', () => {
    useErrorStore.getState().addScopedError({
      message: 'panel error',
      scope: { panel: 'explorer' },
    })
    const state = useErrorStore.getState()
    expect(state.errors).toHaveLength(1)
    expect(state.errors[0].scope).toEqual({ panel: 'explorer' })
    expect(state.errors[0].dismissed).toBe(false)
  })

  it('addScopedError uses explicit detail when provided', () => {
    useErrorStore.getState().addScopedError({
      message: 'ENOENT: no such file',
      scope: 'app',
      detail: 'full stack trace here',
    })
    const error = useErrorStore.getState().errors[0]
    expect(error.displayMessage).toBe('File or directory not found.')
    expect(error.detail).toBe('full stack trace here')
  })

  it('dismissError marks an error as dismissed (does not remove)', () => {
    useErrorStore.getState().addError('to dismiss')
    useErrorStore.getState().addError('to keep')
    const { errors } = useErrorStore.getState()
    const idToDismiss = errors.find(e => e.message === 'to dismiss')!.id
    useErrorStore.getState().dismissError(idToDismiss)
    const updated = useErrorStore.getState().errors
    expect(updated).toHaveLength(2)
    expect(updated.find(e => e.id === idToDismiss)!.dismissed).toBe(true)
    expect(updated.find(e => e.message === 'to keep')!.dismissed).toBe(false)
  })

  it('clearAll removes all errors and resets hasUnread', () => {
    useErrorStore.getState().addError('err1')
    useErrorStore.getState().addError('err2')
    useErrorStore.getState().clearAll()
    const state = useErrorStore.getState()
    expect(state.errors).toEqual([])
    expect(state.hasUnread).toBe(false)
  })

  it('markRead sets hasUnread to false', () => {
    useErrorStore.getState().addError('err')
    expect(useErrorStore.getState().hasUnread).toBe(true)
    useErrorStore.getState().markRead()
    expect(useErrorStore.getState().hasUnread).toBe(false)
  })

  it('showErrorDetail sets detailError', () => {
    useErrorStore.getState().addError('test error')
    const error = useErrorStore.getState().errors[0]
    useErrorStore.getState().showErrorDetail(error)
    expect(useErrorStore.getState().detailError).toBe(error)
  })

  it('hideErrorDetail clears detailError', () => {
    useErrorStore.getState().addError('test error')
    const error = useErrorStore.getState().errors[0]
    useErrorStore.getState().showErrorDetail(error)
    useErrorStore.getState().hideErrorDetail()
    expect(useErrorStore.getState().detailError).toBeNull()
  })
})
