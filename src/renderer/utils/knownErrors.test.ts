import { describe, it, expect } from 'vitest'
import { humanizeError } from './knownErrors'

describe('humanizeError', () => {
  it('returns the raw message when no pattern matches', () => {
    expect(humanizeError('some random error')).toBe('some random error')
  })

  it('matches authentication errors', () => {
    expect(humanizeError('fatal: Authentication failed for repo')).toBe(
      'Git authentication failed. Check your SSH keys or HTTPS credentials.'
    )
    expect(humanizeError('Permission denied (publickey)')).toBe(
      'Git authentication failed. Check your SSH keys or HTTPS credentials.'
    )
  })

  it('matches merge conflict errors', () => {
    expect(humanizeError('CONFLICT (content): Merge conflict in file.txt')).toBe(
      'Merge conflicts detected. Resolve them before continuing.'
    )
    expect(humanizeError('Automatic merge conflict resolution failed')).toBe(
      'Merge conflicts detected. Resolve them before continuing.'
    )
  })

  it('matches not a git repository', () => {
    expect(humanizeError('fatal: not a git repository')).toBe(
      'This directory is not a git repository.'
    )
  })

  it('matches already exists', () => {
    expect(humanizeError("fatal: 'feature/x' already exists")).toBe(
      'Worktree or branch already exists.'
    )
  })

  it('matches network errors', () => {
    expect(humanizeError('getaddrinfo ENOTFOUND github.com')).toBe(
      'Network error. Check your internet connection.'
    )
    expect(humanizeError('connect ECONNREFUSED 127.0.0.1:443')).toBe(
      'Network error. Check your internet connection.'
    )
    expect(humanizeError('connect ETIMEDOUT 1.2.3.4:443')).toBe(
      'Network error. Check your internet connection.'
    )
    expect(humanizeError('Could not resolve host: github.com')).toBe(
      'Network error. Check your internet connection.'
    )
  })

  it('matches gh auth errors', () => {
    expect(humanizeError('To get started with GitHub CLI, please run: gh auth login')).toBe(
      'GitHub CLI not authenticated. Run "gh auth login" in a terminal.'
    )
    expect(humanizeError('not logged in to any GitHub hosts')).toBe(
      'GitHub CLI not authenticated. Run "gh auth login" in a terminal.'
    )
  })

  it('matches gh not found', () => {
    expect(humanizeError('gh: command not found')).toBe(
      'GitHub CLI (gh) not found. Install it from https://cli.github.com'
    )
  })

  it('matches terminal errors', () => {
    expect(humanizeError('Failed to start terminal for session')).toBe(
      'Terminal failed to start. Try restarting the session.'
    )
  })

  it('matches ENOENT errors', () => {
    expect(humanizeError('ENOENT: no such file or directory, open /foo/bar')).toBe(
      'File or directory not found.'
    )
  })

  it('matches permission denied (file)', () => {
    expect(humanizeError('EACCES: permission denied, open /etc/passwd')).toBe(
      'Permission denied. Check file permissions.'
    )
  })

  it('matches push rejected errors', () => {
    expect(humanizeError('error: failed to push some refs')).toBe(
      'Push rejected by remote. Pull first, or force-push if appropriate.'
    )
    expect(humanizeError('! [rejected] main -> main (non-fast-forward)')).toBe(
      'Push rejected by remote. Pull first, or force-push if appropriate.'
    )
  })

  it('matches clone errors', () => {
    expect(humanizeError('clone failed: repository not accessible')).toBe(
      'Clone failed. Check the repository URL and your access.'
    )
    expect(humanizeError('Repository not found')).toBe(
      'Clone failed. Check the repository URL and your access.'
    )
  })

  it('matches first rule when multiple could match', () => {
    // "permission denied" could match both auth and file permission rules
    // but auth rule comes first
    expect(humanizeError('Permission denied (publickey)')).toBe(
      'Git authentication failed. Check your SSH keys or HTTPS credentials.'
    )
  })
})
