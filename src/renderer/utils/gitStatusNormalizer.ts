import type { GitFileStatus, GitStatusResult } from '../../preload/index'

/**
 * Normalize git status response - handles both old array format and new object format.
 */
export function normalizeGitStatus(status: unknown): GitStatusResult {
  // New format: object with files array
  if (status && typeof status === 'object' && !Array.isArray(status) && 'files' in status) {
    const s = status as { files?: Partial<GitFileStatus>[]; ahead?: number; behind?: number; tracking?: string | null; current?: string | null }
    return {
      files: (s.files ?? []).map(f => ({
        path: f.path ?? '',
        status: f.status ?? 'modified',
        staged: f.staged ?? false,
        indexStatus: f.indexStatus ?? ' ',
        workingDirStatus: f.workingDirStatus ?? ' ',
      })),
      ahead: s.ahead ?? 0,
      behind: s.behind ?? 0,
      tracking: s.tracking ?? null,
      current: s.current ?? null,
    }
  }
  // Old format: flat array of {path, status}
  if (Array.isArray(status)) {
    return {
      files: status.map((f: Partial<GitFileStatus>) => ({
        path: f.path ?? '',
        status: f.status ?? 'modified',
        staged: f.staged ?? false,
        indexStatus: f.indexStatus ?? ' ',
        workingDirStatus: f.workingDirStatus ?? ' ',
      })),
      ahead: 0,
      behind: 0,
      tracking: null,
      current: null,
    }
  }
  return { files: [], ahead: 0, behind: 0, tracking: null, current: null }
}
