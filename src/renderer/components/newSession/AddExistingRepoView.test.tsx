// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import '../../../test/react-setup'
import { useAgentStore } from '../../store/agents'
import { useRepoStore } from '../../store/repos'
import { AddExistingRepoView } from './AddExistingRepoView'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
  useAgentStore.setState({
    agents: [
      { id: 'agent-1', name: 'Claude', command: 'claude', color: '#4a9eff' },
    ],
  })
  useRepoStore.setState({
    repos: [],
    addRepo: vi.fn(),
  })
})

describe('AddExistingRepoView', () => {
  it('renders header and form elements', () => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    expect(screen.getByText('Add Existing Repository')).toBeTruthy()
    expect(screen.getByPlaceholderText('Select folder with worktrees...')).toBeTruthy()
    expect(screen.getByText('Browse')).toBeTruthy()
  })

  it('calls onBack when Cancel button is clicked', () => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onBack).toHaveBeenCalled()
  })

  it('calls onBack when back arrow is clicked', () => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    const { container } = render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    const backButton = container.querySelector('.px-4.py-3 button')
    fireEvent.click(backButton!)
    expect(onBack).toHaveBeenCalled()
  })

  it('Add Repository button is disabled initially', () => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    const addButton = screen.getByText('Add Repository')
    expect(addButton.hasAttribute('disabled')).toBe(true)
  })

  it('opens folder dialog when Browse is clicked', async () => {
    vi.mocked(window.dialog.openFolder).mockResolvedValue(null)
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    fireEvent.click(screen.getByText('Browse'))
    await waitFor(() => {
      expect(window.dialog.openFolder).toHaveBeenCalled()
    })
  })

  it('validates and adds repo after Browse returns a valid folder', async () => {
    vi.mocked(window.dialog.openFolder).mockResolvedValue('/repos/my-project')
    vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
    vi.mocked(window.git.worktreeList).mockResolvedValue([
      { path: '/repos/my-project/main', branch: 'main' },
      { path: '/repos/my-project/feature-x', branch: 'feature-x' },
    ])
    vi.mocked(window.git.remoteUrl).mockResolvedValue('https://github.com/user/my-project.git')
    vi.mocked(window.git.defaultBranch).mockResolvedValue('main')
    vi.mocked(window.gh.hasWriteAccess).mockResolvedValue(true)
    vi.mocked(window.config.load).mockResolvedValue({ repos: [{ id: 'new-repo', rootDir: '/repos/my-project', name: 'my-project' }] })
    const addRepo = vi.fn()
    useRepoStore.setState({ addRepo })

    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={vi.fn()} onComplete={onComplete} />)

    // Click Browse which triggers validation
    fireEvent.click(screen.getByText('Browse'))

    await waitFor(() => {
      expect(screen.getByText(/Found 2 worktrees/)).toBeTruthy()
    })

    // The Add Repository button should now be enabled
    const addBtn = screen.getByText('Add Repository')
    expect(addBtn.hasAttribute('disabled')).toBe(false)

    fireEvent.click(addBtn)

    await waitFor(() => {
      expect(addRepo).toHaveBeenCalled()
      expect(onComplete).toHaveBeenCalled()
    })
  })

  it('shows validation error for non-worktree git repo', async () => {
    vi.mocked(window.dialog.openFolder).mockResolvedValue('/repos/single-repo')
    // main/ is not a git repo
    vi.mocked(window.git.isGitRepo).mockImplementation(async (path: string) => {
      if (path.endsWith('/main')) return false
      return true // the folder itself is a git repo
    })

    render(<AddExistingRepoView onBack={vi.fn()} onComplete={vi.fn()} />)
    fireEvent.click(screen.getByText('Browse'))

    await waitFor(() => {
      expect(screen.getByText(/single git repo/)).toBeTruthy()
    })
  })

  it('updates rootDir input when typing', () => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<AddExistingRepoView onBack={onBack} onComplete={onComplete} />)
    const input = screen.getByPlaceholderText('Select folder with worktrees...')
    fireEvent.change(input, { target: { value: '/my/repo' } })
    expect((input as HTMLInputElement).value).toBe('/my/repo')
  })
})
