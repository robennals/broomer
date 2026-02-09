import { describe, it, expect } from 'vitest'
import { getCloneErrorHint } from './cloneErrorHint'

describe('getCloneErrorHint', () => {
  describe('HTTPS auth errors with HTTPS URL', () => {
    const httpsUrl = 'https://github.com/user/repo'

    it('detects "could not read Username" and suggests SSH URL', () => {
      const hint = getCloneErrorHint('fatal: could not read Username for \'https://github.com\': Device not configured', httpsUrl)
      expect(hint).toContain('could not authenticate over HTTPS')
      expect(hint).toContain('git@github.com:user/repo.git')
      expect(hint).toContain('gh auth setup-git')
    })

    it('detects "Authentication failed"', () => {
      const hint = getCloneErrorHint('fatal: Authentication failed for \'https://github.com/user/repo\'', httpsUrl)
      expect(hint).toContain('could not authenticate over HTTPS')
      expect(hint).toContain('git@github.com:user/repo.git')
    })

    it('detects "terminal prompts disabled"', () => {
      const hint = getCloneErrorHint('fatal: terminal prompts disabled', httpsUrl)
      expect(hint).toContain('could not authenticate over HTTPS')
    })

    it('handles HTTPS URL with .git suffix', () => {
      const hint = getCloneErrorHint('fatal: could not read Username', 'https://github.com/user/repo.git')
      expect(hint).toContain('git@github.com:user/repo.git')
    })

    it('handles http:// URL', () => {
      const hint = getCloneErrorHint('fatal: could not read Username', 'http://github.com/user/repo')
      expect(hint).toContain('git@github.com:user/repo.git')
    })

    it('omits SSH URL suggestion for non-GitHub HTTPS URLs', () => {
      const hint = getCloneErrorHint('fatal: could not read Username', 'https://gitlab.com/user/repo')
      expect(hint).toContain('could not authenticate over HTTPS')
      expect(hint).not.toContain('git@github.com')
      expect(hint).toContain('gh auth setup-git')
    })
  })

  describe('SSH auth errors with SSH URL', () => {
    const sshUrl = 'git@github.com:user/repo.git'

    it('detects "Permission denied (publickey)" and suggests HTTPS URL', () => {
      const hint = getCloneErrorHint('git@github.com: Permission denied (publickey).', sshUrl)
      expect(hint).toContain('could not authenticate over SSH')
      expect(hint).toContain('https://github.com/user/repo.git')
      expect(hint).toContain('ssh -T git@github.com')
    })

    it('detects "Host key verification failed"', () => {
      const hint = getCloneErrorHint('Host key verification failed.', sshUrl)
      expect(hint).toContain('could not authenticate over SSH')
      expect(hint).toContain('https://github.com/user/repo.git')
    })

    it('detects "Connection refused" with SSH URL', () => {
      const hint = getCloneErrorHint('ssh: connect to host github.com port 22: Connection refused', sshUrl)
      expect(hint).toContain('could not authenticate over SSH')
    })

    it('detects "Connection timed out" with SSH URL', () => {
      const hint = getCloneErrorHint('ssh: connect to host github.com port 22: Connection timed out', sshUrl)
      expect(hint).toContain('could not authenticate over SSH')
    })

    it('handles SSH URL without .git suffix', () => {
      const hint = getCloneErrorHint('Permission denied (publickey)', 'git@github.com:user/repo')
      expect(hint).toContain('https://github.com/user/repo.git')
    })

    it('handles ssh:// protocol URL', () => {
      const hint = getCloneErrorHint('Permission denied (publickey)', 'ssh://git@github.com/user/repo')
      expect(hint).toContain('could not authenticate over SSH')
    })

    it('omits HTTPS URL suggestion for non-GitHub SSH URLs', () => {
      const hint = getCloneErrorHint('Permission denied (publickey)', 'git@gitlab.com:user/repo.git')
      expect(hint).toContain('could not authenticate over SSH')
      expect(hint).not.toContain('https://github.com')
      expect(hint).toContain('ssh -T git@github.com')
    })
  })

  describe('no hint for unrelated errors', () => {
    it('returns null for repository not found', () => {
      expect(getCloneErrorHint('fatal: repository not found', 'https://github.com/user/repo')).toBeNull()
    })

    it('returns null for generic errors', () => {
      expect(getCloneErrorHint('fatal: something went wrong', 'git@github.com:user/repo.git')).toBeNull()
    })
  })

  describe('no hint when URL type does not match error type', () => {
    it('returns null for HTTPS auth error with SSH URL', () => {
      expect(getCloneErrorHint('fatal: could not read Username', 'git@github.com:user/repo.git')).toBeNull()
    })

    it('returns null for SSH auth error with HTTPS URL', () => {
      expect(getCloneErrorHint('Permission denied (publickey)', 'https://github.com/user/repo')).toBeNull()
    })

    it('returns null for "Connection refused" with HTTPS URL (not SSH-specific)', () => {
      expect(getCloneErrorHint('Connection refused', 'https://github.com/user/repo')).toBeNull()
    })
  })
})
