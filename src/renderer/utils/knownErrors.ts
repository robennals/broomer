/**
 * Maps raw error messages to human-friendly display messages.
 *
 * Each rule is a regex pattern matched against the raw error string.
 * The first matching rule wins. If no rule matches, the raw message is returned as-is.
 */

const rules: { pattern: RegExp; message: string }[] = [
  { pattern: /Authentication failed|Permission denied \(publickey\)/i, message: 'Git authentication failed. Check your SSH keys or HTTPS credentials.' },
  { pattern: /CONFLICT|merge conflict/i, message: 'Merge conflicts detected. Resolve them before continuing.' },
  { pattern: /not a git repository/i, message: 'This directory is not a git repository.' },
  { pattern: /already exists/i, message: 'Worktree or branch already exists.' },
  { pattern: /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|Could not resolve host/i, message: 'Network error. Check your internet connection.' },
  { pattern: /gh auth login|not logged in/i, message: 'GitHub CLI not authenticated. Run "gh auth login" in a terminal.' },
  { pattern: /gh: command not found/i, message: 'GitHub CLI (gh) not found. Install it from https://cli.github.com' },
  { pattern: /Failed to start terminal/i, message: 'Terminal failed to start. Try restarting the session.' },
  { pattern: /ENOENT|no such file or directory/i, message: 'File or directory not found.' },
  { pattern: /EACCES|permission denied/i, message: 'Permission denied. Check file permissions.' },
  { pattern: /\[rejected\]|rejected.*push|failed to push/i, message: 'Push rejected by remote. Pull first, or force-push if appropriate.' },
  { pattern: /clone failed|Repository not found/i, message: 'Clone failed. Check the repository URL and your access.' },
]

export function humanizeError(rawMessage: string): string {
  for (const rule of rules) {
    if (rule.pattern.test(rawMessage)) {
      return rule.message
    }
  }
  return rawMessage
}
