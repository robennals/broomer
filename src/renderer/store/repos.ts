import { create } from 'zustand'
import type { ManagedRepo } from '../../preload/index'

const generateId = () => `repo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Resolve ~ to the actual home directory using the main process
async function resolveHome(path: string): Promise<string> {
  if (path.startsWith('~/') || path === '~') {
    const home = await window.app.homedir()
    return path === '~' ? home : home + path.slice(1)
  }
  return path
}

interface RepoStore {
  repos: ManagedRepo[]
  defaultCloneDir: string
  ghAvailable: boolean | null

  loadRepos: () => Promise<void>
  addRepo: (repo: Omit<ManagedRepo, 'id'>) => Promise<void>
  updateRepo: (id: string, updates: Partial<Omit<ManagedRepo, 'id'>>) => Promise<void>
  removeRepo: (id: string) => Promise<void>
  setDefaultCloneDir: (dir: string) => Promise<void>
  checkGhAvailability: () => Promise<void>
}

export const useRepoStore = create<RepoStore>((set, get) => ({
  repos: [],
  defaultCloneDir: '',
  ghAvailable: null,

  loadRepos: async () => {
    try {
      const config = await window.config.load()
      const home = await window.app.homedir()
      const defaultDir = config.defaultCloneDir
        ? await resolveHome(config.defaultCloneDir)
        : `${home}/repos`
      set({
        repos: config.repos || [],
        defaultCloneDir: defaultDir,
      })
    } catch {
      set({ repos: [], defaultCloneDir: '' })
    }
  },

  addRepo: async (repoData) => {
    const repo: ManagedRepo = {
      id: generateId(),
      ...repoData,
    }

    const { repos } = get()
    const updatedRepos = [...repos, repo]
    set({ repos: updatedRepos })

    const config = await window.config.load()
    await window.config.save({
      ...config,
      repos: updatedRepos,
    })
  },

  updateRepo: async (id, updates) => {
    const { repos } = get()
    const updatedRepos = repos.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
    set({ repos: updatedRepos })

    const config = await window.config.load()
    await window.config.save({
      ...config,
      repos: updatedRepos,
    })
  },

  removeRepo: async (id) => {
    const { repos } = get()
    const updatedRepos = repos.filter((r) => r.id !== id)
    set({ repos: updatedRepos })

    const config = await window.config.load()
    await window.config.save({
      ...config,
      repos: updatedRepos,
    })
  },

  setDefaultCloneDir: async (dir) => {
    const resolved = await resolveHome(dir)
    set({ defaultCloneDir: resolved })

    const config = await window.config.load()
    await window.config.save({
      ...config,
      defaultCloneDir: resolved,
    })
  },

  checkGhAvailability: async () => {
    try {
      const available = await window.gh.isInstalled()
      set({ ghAvailable: available })
    } catch {
      set({ ghAvailable: false })
    }
  },
}))
