// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import '../../test/react-setup'
import ProfileChip from './ProfileChip'
import { useProfileStore } from '../store/profiles'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
  useProfileStore.setState({
    profiles: [{ id: 'default', name: 'Default', color: '#3b82f6' }],
    currentProfileId: 'default',
  })
})

describe('ProfileChip', () => {
  it('renders current profile name', () => {
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    expect(screen.getByText('Default')).toBeTruthy()
  })

  it('renders with profile color styling', () => {
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    const chip = screen.getByText('Default')
    // jsdom normalizes hex colors to rgb()
    expect(chip.style.color).toBe('rgb(59, 130, 246)')
  })

  it('opens dropdown on click', () => {
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    fireEvent.click(screen.getByText('Default'))
    expect(screen.getByText('New Profile...')).toBeTruthy()
  })

  it('shows other profiles for switching', () => {
    useProfileStore.setState({
      profiles: [
        { id: 'default', name: 'Default', color: '#3b82f6' },
        { id: 'work', name: 'Work', color: '#22c55e' },
      ],
      currentProfileId: 'default',
    })
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    fireEvent.click(screen.getByText('Default'))
    expect(screen.getByText('Work')).toBeTruthy()
  })

  it('calls onSwitchProfile when switching', () => {
    const onSwitch = vi.fn()
    useProfileStore.setState({
      profiles: [
        { id: 'default', name: 'Default', color: '#3b82f6' },
        { id: 'work', name: 'Work', color: '#22c55e' },
      ],
      currentProfileId: 'default',
    })
    render(<ProfileChip onSwitchProfile={onSwitch} />)
    fireEvent.click(screen.getByText('Default'))
    fireEvent.click(screen.getByText('Work'))
    expect(onSwitch).toHaveBeenCalledWith('work')
  })

  it('shows edit form when clicking edit', () => {
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    fireEvent.click(screen.getByText('Default'))
    fireEvent.click(screen.getByText('Edit "Default"...'))
    expect(screen.getByPlaceholderText('Profile name')).toBeTruthy()
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
  })

  it('shows new profile form when clicking New Profile', () => {
    render(<ProfileChip onSwitchProfile={vi.fn()} />)
    fireEvent.click(screen.getByText('Default'))
    fireEvent.click(screen.getByText('New Profile...'))
    expect(screen.getByPlaceholderText('Profile name')).toBeTruthy()
    expect(screen.getByText('Create')).toBeTruthy()
  })

  it('renders nothing when no current profile', () => {
    useProfileStore.setState({ profiles: [], currentProfileId: 'nonexistent' })
    const { container } = render(<ProfileChip onSwitchProfile={vi.fn()} />)
    expect(container.innerHTML).toBe('')
  })
})
