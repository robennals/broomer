// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '../../test/react-setup'
import ErrorIndicator from './ErrorIndicator'
import { useErrorStore } from '../store/errors'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  useErrorStore.setState({ errors: [], hasUnread: false })
  vi.clearAllMocks()
})

describe('ErrorIndicator', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<ErrorIndicator />)
    expect(container.innerHTML).toBe('')
  })

  it('shows error button when errors exist', () => {
    useErrorStore.getState().addError('Something broke')
    render(<ErrorIndicator />)
    expect(screen.getByTitle('1 error')).toBeTruthy()
  })

  it('shows correct count for multiple errors', () => {
    useErrorStore.getState().addError('Error 1')
    useErrorStore.getState().addError('Error 2')
    useErrorStore.getState().addError('Error 3')
    render(<ErrorIndicator />)
    expect(screen.getByTitle('3 errors')).toBeTruthy()
  })

  it('expands error list on click', () => {
    useErrorStore.getState().addError('Visible error message')
    render(<ErrorIndicator />)
    fireEvent.click(screen.getByTitle('1 error'))
    expect(screen.getByText('Visible error message')).toBeTruthy()
    expect(screen.getByText('Errors (1)')).toBeTruthy()
  })

  it('clears all errors', () => {
    useErrorStore.getState().addError('Error 1')
    useErrorStore.getState().addError('Error 2')
    render(<ErrorIndicator />)
    fireEvent.click(screen.getByTitle('2 errors'))
    fireEvent.click(screen.getByText('Clear all'))
    expect(useErrorStore.getState().errors).toHaveLength(0)
  })

  it('marks errors as read when opening dropdown', () => {
    useErrorStore.getState().addError('Unread error')
    expect(useErrorStore.getState().hasUnread).toBe(true)
    render(<ErrorIndicator />)
    fireEvent.click(screen.getByTitle('1 error'))
    expect(useErrorStore.getState().hasUnread).toBe(false)
  })

  it('dismisses individual errors via store', () => {
    useErrorStore.getState().addError('Error to keep')
    useErrorStore.getState().addError('Error to dismiss')
    const errorId = useErrorStore.getState().errors[0].id // newest first
    useErrorStore.getState().dismissError(errorId)
    expect(useErrorStore.getState().errors).toHaveLength(1)
    expect(useErrorStore.getState().errors[0].message).toBe('Error to keep')
  })
})
