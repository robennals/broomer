import { describe, it, expect, vi, beforeEach } from 'vitest'
import '../../test/setup'
import { useSessionStore } from '../store/sessions'
import { useAgentStore } from '../store/agents'
import { useRepoStore } from '../store/repos'

beforeEach(() => {
  vi.clearAllMocks()
  useSessionStore.setState({
    sessions: [],
    activeSessionId: null,
    isLoading: true,
  })
  useAgentStore.setState({
    agents: [],
    isLoading: true,
    profileId: undefined,
  })
  useRepoStore.setState({
    repos: [],
    defaultCloneDir: '',
    ghAvailable: null,
    profileId: undefined,
  })
})

describe('Profile reload integration', () => {
  it('all stores load with the same profileId', async () => {
    const profileId = 'work-profile'

    vi.mocked(window.config.load).mockResolvedValue({
      agents: [{ id: 'a1', name: 'Claude', command: 'claude' }],
      sessions: [
        {
          id: 's1',
          name: 'project',
          directory: '/repos/project',
          agentId: 'a1',
        },
      ],
      repos: [{ id: 'r1', name: 'my-repo', url: 'https://github.com/org/repo', directory: '/repos/my-repo' }],
    })
    vi.mocked(window.git.getBranch).mockResolvedValue('main')
    vi.mocked(window.app.homedir).mockResolvedValue('/Users/test')

    await Promise.all([
      useSessionStore.getState().loadSessions(profileId),
      useAgentStore.getState().loadAgents(profileId),
      useRepoStore.getState().loadRepos(profileId),
    ])

    // Session store loaded
    const sessions = useSessionStore.getState()
    expect(sessions.sessions).toHaveLength(1)
    expect(sessions.sessions[0].name).toBe('project')
    expect(sessions.isLoading).toBe(false)

    // Agent store loaded with correct profileId
    const agents = useAgentStore.getState()
    expect(agents.agents).toHaveLength(1)
    expect(agents.agents[0].name).toBe('Claude')
    expect(agents.profileId).toBe(profileId)
    expect(agents.isLoading).toBe(false)

    // Repo store loaded with correct profileId
    const repos = useRepoStore.getState()
    expect(repos.repos).toHaveLength(1)
    expect(repos.repos[0].name).toBe('my-repo')
    expect(repos.profileId).toBe(profileId)

    // All three called config.load with the same profileId
    expect(window.config.load).toHaveBeenCalledWith(profileId)
  })

  it('switching profiles reloads all stores with new profileId', async () => {
    const oldProfile = 'personal'
    const newProfile = 'work'

    // First load with old profile
    vi.mocked(window.config.load).mockResolvedValue({
      agents: [{ id: 'a1', name: 'OldAgent', command: 'old' }],
      sessions: [],
      repos: [],
    })
    vi.mocked(window.app.homedir).mockResolvedValue('/Users/test')

    await Promise.all([
      useSessionStore.getState().loadSessions(oldProfile),
      useAgentStore.getState().loadAgents(oldProfile),
      useRepoStore.getState().loadRepos(oldProfile),
    ])

    expect(useAgentStore.getState().agents[0].name).toBe('OldAgent')

    // Now switch to new profile
    vi.mocked(window.config.load).mockResolvedValue({
      agents: [{ id: 'a2', name: 'NewAgent', command: 'new' }],
      sessions: [
        { id: 's2', name: 'new-project', directory: '/repos/new', agentId: 'a2' },
      ],
      repos: [{ id: 'r2', name: 'new-repo', url: 'https://github.com/org/new', directory: '/repos/new' }],
    })

    await Promise.all([
      useSessionStore.getState().loadSessions(newProfile),
      useAgentStore.getState().loadAgents(newProfile),
      useRepoStore.getState().loadRepos(newProfile),
    ])

    // All stores updated
    expect(useAgentStore.getState().agents[0].name).toBe('NewAgent')
    expect(useAgentStore.getState().profileId).toBe(newProfile)
    expect(useSessionStore.getState().sessions[0].name).toBe('new-project')
    expect(useRepoStore.getState().repos[0].name).toBe('new-repo')
    expect(useRepoStore.getState().profileId).toBe(newProfile)
  })

  it('config.load failure gives safe defaults for all stores', async () => {
    vi.mocked(window.config.load).mockRejectedValue(new Error('Corrupt config'))
    vi.mocked(window.app.homedir).mockResolvedValue('/Users/test')

    await Promise.all([
      useSessionStore.getState().loadSessions('broken'),
      useAgentStore.getState().loadAgents('broken'),
      useRepoStore.getState().loadRepos('broken'),
    ])

    expect(useSessionStore.getState().sessions).toHaveLength(0)
    expect(useSessionStore.getState().isLoading).toBe(false)
    expect(useAgentStore.getState().agents).toHaveLength(0)
    expect(useAgentStore.getState().isLoading).toBe(false)
    expect(useRepoStore.getState().repos).toHaveLength(0)
  })
})
