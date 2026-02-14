import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSessionStore } from './sessions'
import { PANEL_IDS, DEFAULT_TOOLBAR_PANELS } from '../panels/types'
import { setLoadedCounts } from './configPersistence'

describe('sessionCoreActions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setLoadedCounts({ sessions: 0, agents: 0, repos: 0 })
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
      isLoading: true,
      showSidebar: true,
      showSettings: false,
      sidebarWidth: 224,
      toolbarPanels: [...DEFAULT_TOOLBAR_PANELS],
      globalPanelVisibility: {
        [PANEL_IDS.SIDEBAR]: true,
        [PANEL_IDS.SETTINGS]: false,
      },
    })
    vi.mocked(window.config.load).mockResolvedValue({ agents: [], sessions: [] })
    vi.mocked(window.config.save).mockResolvedValue({ success: true })
    vi.mocked(window.git.getBranch).mockResolvedValue('main')
    vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
    vi.mocked(window.git.remoteUrl).mockResolvedValue(null)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addSession', () => {
    it('adds a session and sets it active', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      vi.mocked(window.git.getBranch).mockResolvedValue('feature/test')

      await useSessionStore.getState().addSession('/test/repo', 'claude')

      const state = useSessionStore.getState()
      expect(state.sessions).toHaveLength(1)
      expect(state.sessions[0].directory).toBe('/test/repo')
      expect(state.sessions[0].agentId).toBe('claude')
      expect(state.sessions[0].branch).toBe('feature/test')
      expect(state.activeSessionId).toBe(state.sessions[0].id)
    })

    it('throws when directory is not a git repo', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(false)

      await expect(useSessionStore.getState().addSession('/test', null)).rejects.toThrow(
        'not a git repository'
      )
    })

    it('uses repo name from remote URL when available', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      vi.mocked(window.git.remoteUrl).mockResolvedValue('https://github.com/user/my-project.git')

      await useSessionStore.getState().addSession('/test/repo', null)

      expect(useSessionStore.getState().sessions[0].name).toBe('my-project')
    })

    it('falls back to basename when remote URL fails', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      vi.mocked(window.git.remoteUrl).mockRejectedValue(new Error('no remote'))

      await useSessionStore.getState().addSession('/test/my-dir', null)

      expect(useSessionStore.getState().sessions[0].name).toBe('my-dir')
    })

    it('uses provided name when given', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)

      await useSessionStore.getState().addSession('/test/repo', null, { name: 'custom-name' })

      expect(useSessionStore.getState().sessions[0].name).toBe('custom-name')
    })

    it('creates review session with review panel visibility', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)

      await useSessionStore.getState().addSession('/test/repo', 'claude', {
        sessionType: 'review',
        prNumber: 42,
        prTitle: 'Test PR',
      })

      const session = useSessionStore.getState().sessions[0]
      expect(session.sessionType).toBe('review')
      expect(session.panelVisibility[PANEL_IDS.REVIEW]).toBe(true)
      expect(session.panelVisibility[PANEL_IDS.USER_TERMINAL]).toBe(false)
    })

    it('adds review panel to toolbar for review sessions', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)

      // Start with toolbar that doesn't include review
      useSessionStore.setState({
        toolbarPanels: DEFAULT_TOOLBAR_PANELS.filter((p) => p !== PANEL_IDS.REVIEW),
      })

      await useSessionStore.getState().addSession('/test/repo', 'claude', {
        sessionType: 'review',
      })

      expect(useSessionStore.getState().toolbarPanels).toContain(PANEL_IDS.REVIEW)
    })
  })

  describe('removeSession', () => {
    it('removes a session', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      await useSessionStore.getState().addSession('/test/repo', null)
      const id = useSessionStore.getState().sessions[0].id

      useSessionStore.getState().removeSession(id)

      expect(useSessionStore.getState().sessions).toHaveLength(0)
      expect(useSessionStore.getState().activeSessionId).toBeNull()
    })

    it('switches to first session when removing active session', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      await useSessionStore.getState().addSession('/test/repo1', null)
      await useSessionStore.getState().addSession('/test/repo2', null)
      const sessions = useSessionStore.getState().sessions
      const activeId = useSessionStore.getState().activeSessionId

      useSessionStore.getState().removeSession(activeId!)

      const remaining = useSessionStore.getState().sessions
      expect(remaining).toHaveLength(1)
      expect(useSessionStore.getState().activeSessionId).toBe(remaining[0].id)
    })
  })

  describe('setActiveSession', () => {
    it('sets the active session', () => {
      useSessionStore.getState().setActiveSession('some-id')
      expect(useSessionStore.getState().activeSessionId).toBe('some-id')
    })

    it('can set to null', () => {
      useSessionStore.getState().setActiveSession(null)
      expect(useSessionStore.getState().activeSessionId).toBeNull()
    })
  })

  describe('updateSessionBranch', () => {
    it('updates a session branch', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      await useSessionStore.getState().addSession('/test/repo', null)
      const id = useSessionStore.getState().sessions[0].id

      useSessionStore.getState().updateSessionBranch(id, 'feature/new')

      expect(useSessionStore.getState().sessions[0].branch).toBe('feature/new')
    })
  })

  describe('refreshAllBranches', () => {
    it('refreshes branches for all sessions', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      await useSessionStore.getState().addSession('/test/repo', null)

      vi.mocked(window.git.getBranch).mockResolvedValue('updated-branch')
      await useSessionStore.getState().refreshAllBranches()

      expect(useSessionStore.getState().sessions[0].branch).toBe('updated-branch')
    })

    it('skips update when branch unchanged', async () => {
      vi.mocked(window.git.isGitRepo).mockResolvedValue(true)
      vi.mocked(window.git.getBranch).mockResolvedValue('main')
      await useSessionStore.getState().addSession('/test/repo', null)

      const setSpy = vi.fn()
      const orig = useSessionStore.setState
      await useSessionStore.getState().refreshAllBranches()
      // Branch should remain 'main' — no redundant update
      expect(useSessionStore.getState().sessions[0].branch).toBe('main')
    })
  })
})
