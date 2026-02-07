import { describe, it, expect } from 'vitest'
import '../../test/setup'
import { computeBranchStatus } from '../utils/branchStatus'
import type { BranchStatusInput } from '../utils/branchStatus'

function makeInput(overrides: Partial<BranchStatusInput> = {}): BranchStatusInput {
  return {
    uncommittedFiles: 0,
    ahead: 0,
    hasTrackingBranch: false,
    isOnMainBranch: false,
    isMergedToMain: false,
    lastKnownPrState: undefined,
    ...overrides,
  }
}

describe('Git branch status integration', () => {
  it('uncommitted files → in-progress', () => {
    expect(computeBranchStatus(makeInput({ uncommittedFiles: 3 }))).toBe('in-progress')
  })

  it('commits ahead of remote → in-progress', () => {
    expect(computeBranchStatus(makeInput({ ahead: 2 }))).toBe('in-progress')
  })

  it('on main branch → always in-progress', () => {
    expect(computeBranchStatus(makeInput({
      isOnMainBranch: true,
      hasTrackingBranch: true,
      lastKnownPrState: 'MERGED',
    }))).toBe('in-progress')
  })

  it('has tracking branch, no PR, no changes → pushed', () => {
    expect(computeBranchStatus(makeInput({ hasTrackingBranch: true }))).toBe('pushed')
  })

  it('PR state OPEN → open', () => {
    expect(computeBranchStatus(makeInput({
      hasTrackingBranch: true,
      lastKnownPrState: 'OPEN',
    }))).toBe('open')
  })

  it('PR state MERGED → merged', () => {
    expect(computeBranchStatus(makeInput({
      hasTrackingBranch: true,
      lastKnownPrState: 'MERGED',
    }))).toBe('merged')
  })

  it('PR state CLOSED → closed', () => {
    expect(computeBranchStatus(makeInput({
      hasTrackingBranch: true,
      lastKnownPrState: 'CLOSED',
    }))).toBe('closed')
  })

  it('git-native merge detection overrides no-PR state', () => {
    expect(computeBranchStatus(makeInput({
      hasTrackingBranch: true,
      isMergedToMain: true,
    }))).toBe('merged')
  })

  it('no tracking branch, no changes → in-progress', () => {
    expect(computeBranchStatus(makeInput())).toBe('in-progress')
  })

  it('PR state change updates session status', () => {
    // Simulates the lifecycle: pushed → PR opened → merged
    const base = makeInput({ hasTrackingBranch: true })

    expect(computeBranchStatus(base)).toBe('pushed')
    expect(computeBranchStatus({ ...base, lastKnownPrState: 'OPEN' })).toBe('open')
    expect(computeBranchStatus({ ...base, lastKnownPrState: 'MERGED' })).toBe('merged')
  })

  it('in-progress takes priority: changes override PR state', () => {
    // Even with a PR open, uncommitted changes mean in-progress
    expect(computeBranchStatus(makeInput({
      uncommittedFiles: 1,
      hasTrackingBranch: true,
      lastKnownPrState: 'OPEN',
    }))).toBe('in-progress')
  })
})
