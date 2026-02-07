import { describe, it, expect } from 'vitest'
import { resolveNavigation, applyPendingNavigation, type NavigationTarget } from './fileNavigation'

describe('resolveNavigation', () => {
  const baseTarget: NavigationTarget = {
    filePath: '/project/foo.ts',
    openInDiffMode: false,
    scrollToLine: 42,
    searchHighlight: 'search',
    diffBaseRef: undefined,
    diffCurrentRef: undefined,
    diffLabel: undefined,
  }

  it('returns update-scroll when navigating to the same file', () => {
    const result = resolveNavigation(baseTarget, '/project/foo.ts', false)
    expect(result.action).toBe('update-scroll')
    if (result.action === 'update-scroll') {
      expect(result.state.scrollToLine).toBe(42)
      expect(result.state.searchHighlight).toBe('search')
    }
  })

  it('returns update-scroll for same file even when dirty', () => {
    const result = resolveNavigation(baseTarget, '/project/foo.ts', true)
    expect(result.action).toBe('update-scroll')
  })

  it('returns navigate for clean file viewer with different file', () => {
    const result = resolveNavigation(baseTarget, '/project/bar.ts', false)
    expect(result.action).toBe('navigate')
    if (result.action === 'navigate') {
      expect(result.filePath).toBe('/project/foo.ts')
      expect(result.state.openFileInDiffMode).toBe(false)
      expect(result.state.scrollToLine).toBe(42)
    }
  })

  it('returns navigate when current file is null (first navigation)', () => {
    const result = resolveNavigation(baseTarget, null, false)
    expect(result.action).toBe('navigate')
    if (result.action === 'navigate') {
      expect(result.filePath).toBe('/project/foo.ts')
    }
  })

  it('returns pending for dirty file viewer with different file', () => {
    const result = resolveNavigation(baseTarget, '/project/bar.ts', true)
    expect(result.action).toBe('pending')
    if (result.action === 'pending') {
      expect(result.target.filePath).toBe('/project/foo.ts')
      expect(result.target.scrollToLine).toBe(42)
    }
  })

  it('passes through diff mode flags', () => {
    const diffTarget: NavigationTarget = {
      filePath: '/project/diff.ts',
      openInDiffMode: true,
      diffBaseRef: 'HEAD~1',
      diffCurrentRef: 'HEAD',
      diffLabel: 'Changes',
    }
    const result = resolveNavigation(diffTarget, null, false)
    expect(result.action).toBe('navigate')
    if (result.action === 'navigate') {
      expect(result.state.openFileInDiffMode).toBe(true)
      expect(result.state.diffBaseRef).toBe('HEAD~1')
      expect(result.state.diffCurrentRef).toBe('HEAD')
      expect(result.state.diffLabel).toBe('Changes')
    }
  })
})

describe('applyPendingNavigation', () => {
  it('converts pending target to navigation state', () => {
    const pending: NavigationTarget = {
      filePath: '/project/pending.ts',
      openInDiffMode: true,
      scrollToLine: 10,
      searchHighlight: 'term',
      diffBaseRef: 'main',
      diffCurrentRef: 'feature',
      diffLabel: 'Compare',
    }
    const result = applyPendingNavigation(pending)
    expect(result.filePath).toBe('/project/pending.ts')
    expect(result.state.openFileInDiffMode).toBe(true)
    expect(result.state.scrollToLine).toBe(10)
    expect(result.state.searchHighlight).toBe('term')
    expect(result.state.diffBaseRef).toBe('main')
    expect(result.state.diffCurrentRef).toBe('feature')
    expect(result.state.diffLabel).toBe('Compare')
  })

  it('handles minimal pending target', () => {
    const pending: NavigationTarget = {
      filePath: '/project/minimal.ts',
      openInDiffMode: false,
    }
    const result = applyPendingNavigation(pending)
    expect(result.filePath).toBe('/project/minimal.ts')
    expect(result.state.openFileInDiffMode).toBe(false)
    expect(result.state.scrollToLine).toBeUndefined()
    expect(result.state.searchHighlight).toBeUndefined()
  })
})
