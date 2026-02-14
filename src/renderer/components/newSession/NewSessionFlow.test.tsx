// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import '../../../test/react-setup'
import { useRepoStore } from '../../store/repos'
import { useAgentStore } from '../../store/agents'
import { NewSessionDialog } from './index'

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  vi.clearAllMocks()
  useRepoStore.setState({
    repos: [],
    ghAvailable: true,
    defaultCloneDir: '~/repos',
    addRepo: vi.fn(),
  })
  useAgentStore.setState({
    agents: [
      { id: 'agent-1', name: 'Claude', command: 'claude', color: '#4a9eff' },
    ],
  })
})

describe('NewSessionDialog', () => {
  it('renders home view by default', () => {
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('New Session')).toBeTruthy()
    expect(screen.getByText('Clone')).toBeTruthy()
  })

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn()
    const { container } = render(<NewSessionDialog onComplete={vi.fn()} onCancel={onCancel} />)
    // Click the backdrop (the outer fixed div)
    const backdrop = container.querySelector('.fixed.inset-0')!
    fireEvent.click(backdrop)
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not call onCancel when dialog content is clicked', () => {
    const onCancel = vi.fn()
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={onCancel} />)
    // Click the inner dialog
    fireEvent.click(screen.getByText('New Session'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('navigates to clone view', () => {
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Clone'))
    expect(screen.getByText('Clone Repository')).toBeTruthy()
  })

  it('navigates to add existing repo view', () => {
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Add Repo'))
    expect(screen.getByText('Add Existing Repository')).toBeTruthy()
  })

  it('navigates to folder picker via Folder button', async () => {
    vi.mocked(window.dialog.openFolder).mockResolvedValue('/my/folder')
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Folder'))

    await waitFor(() => {
      expect(screen.getByText('Select Agent')).toBeTruthy()
    })
  })

  it('navigates back from clone to home', () => {
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Clone'))
    expect(screen.getByText('Clone Repository')).toBeTruthy()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.getByText('New Session')).toBeTruthy()
  })

  it('navigates to new branch view when New is clicked on a repo', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true })
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('New'))
    expect(screen.getByText('New Branch')).toBeTruthy()
  })

  it('navigates to existing branch view when Existing is clicked on a repo', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true })
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Existing'))
    expect(screen.getByText('Existing Branches')).toBeTruthy()
  })

  it('navigates to repo settings view', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true, updateRepo: vi.fn(), removeRepo: vi.fn() })
    vi.mocked(window.repos.getInitScript).mockResolvedValue('')
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    // Click settings button (the last button-like element for the repo)
    const settingsBtn = document.querySelector('[title="Repository settings"]') || (() => {
      // Find repo card and get the settings button (cog icon)
      const repoCard = screen.getByText('My Project').closest('.group')!
      return repoCard.querySelectorAll('button')[repoCard.querySelectorAll('button').length - 1]
    })()
    fireEvent.click(settingsBtn as HTMLElement)
    expect(screen.getByText('Repository Settings')).toBeTruthy()
  })

  it('navigates to issues view', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true })
    vi.mocked(window.gh.issues).mockReturnValue(new Promise(() => {}))
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Issues'))
    expect(screen.getByText(/Issues/)).toBeTruthy()
  })

  it('navigates to review PRs view', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true })
    vi.mocked(window.gh.prsToReview).mockReturnValue(new Promise(() => {}))
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Review'))
    expect(screen.getByText('PRs to Review')).toBeTruthy()
  })

  it('navigates to agent picker via Open button', () => {
    const repo = { id: 'repo-1', name: 'My Project', remoteUrl: '', rootDir: '/repos/my-project', defaultBranch: 'main' }
    useRepoStore.setState({ repos: [repo], ghAvailable: true })
    render(<NewSessionDialog onComplete={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Open'))
    expect(screen.getByText('Select Agent')).toBeTruthy()
  })
})
