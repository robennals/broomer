import { useState, useEffect } from 'react'
import { useAgentStore } from '../store/agents'
import { useRepoStore } from '../store/repos'
import type { ManagedRepo, GitHubIssue } from '../../preload/index'
import { issueToBranchName } from '../utils/slugify'

type View =
  | { type: 'home' }
  | { type: 'clone' }
  | { type: 'new-branch'; repo: ManagedRepo; issue?: GitHubIssue }
  | { type: 'issues'; repo: ManagedRepo }
  | { type: 'agent-picker'; directory: string; repoId?: string; repoName?: string }

interface NewSessionDialogProps {
  onComplete: (directory: string, agentId: string | null, extra?: { repoId?: string; issueNumber?: number; issueTitle?: string; name?: string }) => void
  onCancel: () => void
}

export default function NewSessionDialog({ onComplete, onCancel }: NewSessionDialogProps) {
  const [view, setView] = useState<View>({ type: 'home' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-bg-secondary rounded-lg shadow-xl border border-border w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {view.type === 'home' && (
          <HomeView
            onClone={() => setView({ type: 'clone' })}
            onOpenFolder={async () => {
              const folderPath = await window.dialog.openFolder()
              if (folderPath) {
                setView({ type: 'agent-picker', directory: folderPath })
              }
            }}
            onNewBranch={(repo) => setView({ type: 'new-branch', repo })}
            onIssues={(repo) => setView({ type: 'issues', repo })}
            onOpenMain={(repo) => setView({ type: 'agent-picker', directory: repo.rootDir + '/main', repoId: repo.id, repoName: repo.name })}
            onCancel={onCancel}
          />
        )}
        {view.type === 'clone' && (
          <CloneView
            onBack={() => setView({ type: 'home' })}
            onComplete={onComplete}
          />
        )}
        {view.type === 'new-branch' && (
          <NewBranchView
            repo={view.repo}
            issue={view.issue}
            onBack={() => view.issue ? setView({ type: 'issues', repo: view.repo }) : setView({ type: 'home' })}
            onComplete={onComplete}
          />
        )}
        {view.type === 'issues' && (
          <IssuesView
            repo={view.repo}
            onBack={() => setView({ type: 'home' })}
            onSelectIssue={(issue) => setView({ type: 'new-branch', repo: view.repo, issue })}
          />
        )}
        {view.type === 'agent-picker' && (
          <AgentPickerView
            directory={view.directory}
            repoId={view.repoId}
            repoName={view.repoName}
            onBack={() => setView({ type: 'home' })}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  )
}

// ─── Home View ───────────────────────────────────────────

function HomeView({
  onClone,
  onOpenFolder,
  onNewBranch,
  onIssues,
  onOpenMain,
  onCancel,
}: {
  onClone: () => void
  onOpenFolder: () => void
  onNewBranch: (repo: ManagedRepo) => void
  onIssues: (repo: ManagedRepo) => void
  onOpenMain: (repo: ManagedRepo) => void
  onCancel: () => void
}) {
  const { repos } = useRepoStore()
  const { ghAvailable } = useRepoStore()

  return (
    <>
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-lg font-medium text-text-primary">New Session</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClone}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded border border-border bg-bg-primary hover:bg-bg-tertiary hover:border-accent transition-colors text-sm font-medium text-text-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Clone Repository
          </button>
          <button
            onClick={onOpenFolder}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded border border-border bg-bg-primary hover:bg-bg-tertiary hover:border-accent transition-colors text-sm font-medium text-text-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Open Folder
          </button>
        </div>

        {/* Managed repos */}
        {repos.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Your Repositories</h3>
            <div className="space-y-1">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center gap-2 p-2 rounded border border-border bg-bg-primary"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{repo.name}</div>
                    <div className="text-xs text-text-secondary font-mono truncate">{repo.defaultBranch}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onNewBranch(repo)}
                      className="px-2 py-1 text-xs rounded bg-bg-tertiary hover:bg-accent/20 text-text-secondary hover:text-accent transition-colors"
                      title="Create a new branch worktree"
                    >
                      Branch
                    </button>
                    {ghAvailable && (
                      <button
                        onClick={() => onIssues(repo)}
                        className="px-2 py-1 text-xs rounded bg-bg-tertiary hover:bg-accent/20 text-text-secondary hover:text-accent transition-colors"
                        title="Browse GitHub issues"
                      >
                        Issues
                      </button>
                    )}
                    <button
                      onClick={() => onOpenMain(repo)}
                      className="px-2 py-1 text-xs rounded bg-bg-tertiary hover:bg-accent/20 text-text-secondary hover:text-accent transition-colors"
                      title="Open main branch"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {repos.length === 0 && (
          <div className="text-center text-text-secondary text-sm py-4">
            No managed repositories yet.
            <br />
            Clone a repository or open an existing folder.
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}

// ─── Clone View ──────────────────────────────────────────

function CloneView({
  onBack,
  onComplete,
}: {
  onBack: () => void
  onComplete: (directory: string, agentId: string | null, extra?: { repoId?: string }) => void
}) {
  const { agents } = useAgentStore()
  const { defaultCloneDir, addRepo } = useRepoStore()

  const [url, setUrl] = useState('')
  const [location, setLocation] = useState(defaultCloneDir)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id || null)
  const [initScript, setInitScript] = useState('')
  const [showInitScript, setShowInitScript] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Derive repo name from URL
  const repoName = url
    .replace(/\.git$/, '')
    .split('/')
    .pop()
    ?.replace(/[^a-zA-Z0-9._-]/g, '') || ''

  const handleClone = async () => {
    if (!url || !location || !repoName) return
    setLoading(true)
    setError(null)

    try {
      const rootDir = `${location}/${repoName}`
      const mainDir = `${rootDir}/main`

      // Clone into rootDir/main/
      const cloneResult = await window.git.clone(url, mainDir)
      if (!cloneResult.success) {
        throw new Error(cloneResult.error || 'Clone failed')
      }

      // Detect default branch and remote URL
      const defaultBranch = await window.git.defaultBranch(mainDir)
      const remoteUrl = await window.git.remoteUrl(mainDir) || url

      // Save managed repo
      await addRepo({
        name: repoName,
        remoteUrl,
        rootDir,
        defaultBranch,
      })

      // Get the repo ID that was just created
      const config = await window.config.load()
      const newRepo = config.repos?.find((r: { name: string }) => r.name === repoName)
      const repoId = newRepo?.id

      // Optionally save and run init script
      if (initScript.trim() && repoId) {
        await window.repos.saveInitScript(repoId, initScript)
      }

      onComplete(mainDir, selectedAgentId, { repoId, name: repoName })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBrowseLocation = async () => {
    const folder = await window.dialog.openFolder()
    if (folder) setLocation(folder)
  }

  return (
    <>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-medium text-text-primary">Clone Repository</h2>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Repository URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/user/repo.git"
            className="w-full px-3 py-2 text-sm rounded border border-border bg-bg-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-3 py-2 text-sm rounded border border-border bg-bg-primary text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleBrowseLocation}
              className="px-3 py-2 text-sm rounded border border-border bg-bg-primary hover:bg-bg-tertiary text-text-secondary transition-colors"
            >
              Browse
            </button>
          </div>
        </div>

        {repoName && (
          <div className="text-xs text-text-secondary">
            Will clone to: <span className="font-mono text-text-primary">{location}/{repoName}/main/</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Agent</label>
          <select
            value={selectedAgentId || ''}
            onChange={(e) => setSelectedAgentId(e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded border border-border bg-bg-primary text-text-primary focus:outline-none focus:border-accent"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
            <option value="">Shell Only</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => setShowInitScript(!showInitScript)}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
          >
            <svg className={`w-3 h-3 transition-transform ${showInitScript ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Init Script
          </button>
          {showInitScript && (
            <textarea
              value={initScript}
              onChange={(e) => setInitScript(e.target.value)}
              placeholder="#!/bin/bash&#10;# Runs in each new worktree&#10;cp ../main/.env .env"
              className="w-full mt-1 px-3 py-2 text-xs font-mono rounded border border-border bg-bg-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent resize-y"
              rows={3}
            />
          )}
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleClone}
          disabled={!url || !location || !repoName || loading}
          className="px-4 py-2 text-sm rounded bg-accent text-white hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Cloning...' : 'Clone'}
        </button>
      </div>
    </>
  )
}

// ─── New Branch View ─────────────────────────────────────

function NewBranchView({
  repo,
  issue,
  onBack,
  onComplete,
}: {
  repo: ManagedRepo
  issue?: GitHubIssue
  onBack: () => void
  onComplete: (directory: string, agentId: string | null, extra?: { repoId?: string; issueNumber?: number; issueTitle?: string; name?: string }) => void
}) {
  const { agents } = useAgentStore()

  const [branchName, setBranchName] = useState(issue ? issueToBranchName(issue) : '')
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agents[0]?.id || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!branchName) return
    setLoading(true)
    setError(null)

    try {
      const mainDir = `${repo.rootDir}/main`
      const worktreePath = `${repo.rootDir}/${branchName}`

      // Pull latest on main first
      await window.git.pull(mainDir)

      // Create worktree with new branch
      const result = await window.git.worktreeAdd(mainDir, worktreePath, branchName, repo.defaultBranch)
      if (!result.success) {
        throw new Error(result.error || 'Failed to create worktree')
      }

      // Push new branch upstream (non-fatal)
      try {
        await window.git.pushNewBranch(worktreePath, branchName)
      } catch {
        // Non-fatal: branch push might fail if no remote access
      }

      // Run init script if exists (non-fatal)
      try {
        const initScript = await window.repos.getInitScript(repo.id)
        if (initScript) {
          await window.shell.exec(initScript, worktreePath)
        }
      } catch {
        // Non-fatal
      }

      onComplete(worktreePath, selectedAgentId, {
        repoId: repo.id,
        issueNumber: issue?.number,
        issueTitle: issue?.title,
        name: repo.name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-medium text-text-primary">New Branch</h2>
          <p className="text-xs text-text-secondary">{repo.name}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {issue && (
          <div className="rounded border border-accent/30 bg-accent/5 px-3 py-2">
            <div className="text-xs text-text-secondary">Issue #{issue.number}</div>
            <div className="text-sm text-text-primary">{issue.title}</div>
            {issue.labels.length > 0 && (
              <div className="flex gap-1 mt-1">
                {issue.labels.map((label) => (
                  <span key={label} className="text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Branch Name</label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="feature/my-feature"
            className="w-full px-3 py-2 text-sm font-mono rounded border border-border bg-bg-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
            autoFocus
          />
          <div className="text-xs text-text-secondary mt-1">
            Creates: <span className="font-mono">{repo.rootDir}/{branchName || '...'}/</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Agent</label>
          <select
            value={selectedAgentId || ''}
            onChange={(e) => setSelectedAgentId(e.target.value || null)}
            className="w-full px-3 py-2 text-sm rounded border border-border bg-bg-primary text-text-primary focus:outline-none focus:border-accent"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
            <option value="">Shell Only</option>
          </select>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!branchName || loading}
          className="px-4 py-2 text-sm rounded bg-accent text-white hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Branch'}
        </button>
      </div>
    </>
  )
}

// ─── Issues View ─────────────────────────────────────────

function IssuesView({
  repo,
  onBack,
  onSelectIssue,
}: {
  repo: ManagedRepo
  onBack: () => void
  onSelectIssue: (issue: GitHubIssue) => void
}) {
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const mainDir = `${repo.rootDir}/main`
        const result = await window.gh.issues(mainDir)
        setIssues(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [repo])

  return (
    <>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-medium text-text-primary">Issues</h2>
          <p className="text-xs text-text-secondary">{repo.name} &middot; Assigned to me</p>
        </div>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8 text-text-secondary text-sm">
            <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading issues...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</div>
        )}

        {!loading && !error && issues.length === 0 && (
          <div className="text-center text-text-secondary text-sm py-8">
            No open issues assigned to you.
          </div>
        )}

        {!loading && !error && issues.length > 0 && (
          <div className="space-y-1">
            {issues.map((issue) => (
              <button
                key={issue.number}
                onClick={() => onSelectIssue(issue)}
                className="w-full flex items-start gap-3 p-2 rounded border border-border bg-bg-primary hover:bg-bg-tertiary hover:border-accent transition-colors text-left"
              >
                <span className="text-accent font-mono text-xs mt-0.5 flex-shrink-0">#{issue.number}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary">{issue.title}</div>
                  {issue.labels.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {issue.labels.map((label) => (
                        <span key={label} className="text-xs px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex justify-end">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}

// ─── Agent Picker View ───────────────────────────────────

function AgentPickerView({
  directory,
  repoId,
  repoName,
  onBack,
  onComplete,
}: {
  directory: string
  repoId?: string
  repoName?: string
  onBack: () => void
  onComplete: (directory: string, agentId: string | null, extra?: { repoId?: string; name?: string }) => void
}) {
  const { agents } = useAgentStore()
  const folderName = repoName || directory.split('/').pop() || directory

  return (
    <>
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <button onClick={onBack} className="text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-medium text-text-primary">Select Agent</h2>
          <p className="text-xs text-text-secondary font-mono">{folderName}</p>
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onComplete(directory, agent.id, repoId ? { repoId, name: repoName } : undefined)}
            className="w-full flex items-center gap-3 p-3 rounded border border-border bg-bg-primary hover:bg-bg-tertiary hover:border-accent transition-colors text-left"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: agent.color || '#4a9eff' }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-text-primary">{agent.name}</div>
              <div className="text-xs text-text-secondary font-mono truncate">{agent.command}</div>
            </div>
          </button>
        ))}

        <button
          onClick={() => onComplete(directory, null, repoId ? { repoId, name: repoName } : undefined)}
          className="w-full flex items-center gap-3 p-3 rounded border border-border bg-bg-primary hover:bg-bg-tertiary hover:border-accent transition-colors text-left"
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0 bg-text-secondary" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-text-primary">Shell Only</div>
            <div className="text-xs text-text-secondary">No agent, just a terminal</div>
          </div>
        </button>

        {agents.length === 0 && (
          <div className="text-center text-text-secondary text-sm py-4">
            No agents configured. Add agents in Settings.
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex justify-end">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </>
  )
}
