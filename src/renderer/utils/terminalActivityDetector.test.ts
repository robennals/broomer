import { describe, it, expect } from 'vitest'
import {
  evaluateActivity,
  type ActivityDetectorState,
  type ActivityDetectorConfig,
} from './terminalActivityDetector'

function makeState(overrides: Partial<ActivityDetectorState> = {}): ActivityDetectorState {
  return {
    lastUserInput: 0,
    lastInteraction: 0,
    lastStatus: 'idle',
    startTime: 0,
    ...overrides,
  }
}

describe('evaluateActivity', () => {
  describe('warmup period', () => {
    it('ignores data during warmup', () => {
      const state = makeState({ startTime: 1000 })
      // now=4999, startTime=1000 → 3999ms < 5000ms warmup
      const result = evaluateActivity(100, 4999, state)
      expect(result.status).toBeNull()
      expect(result.scheduleIdle).toBe(false)
    })

    it('detects activity after warmup', () => {
      const state = makeState({ startTime: 0 })
      // now=5001 → past warmup
      const result = evaluateActivity(100, 5001, state)
      expect(result.status).toBe('working')
      expect(result.scheduleIdle).toBe(true)
    })

    it('ignores data at exact warmup boundary', () => {
      const state = makeState({ startTime: 0 })
      // now=4999 → still within warmup
      const result = evaluateActivity(100, 4999, state)
      expect(result.status).toBeNull()
    })
  })

  describe('empty data', () => {
    it('returns null for zero-length data', () => {
      const state = makeState({ startTime: 0 })
      const result = evaluateActivity(0, 10000, state)
      expect(result.status).toBeNull()
      expect(result.scheduleIdle).toBe(false)
    })

    it('returns null for negative data length', () => {
      const state = makeState({ startTime: 0 })
      const result = evaluateActivity(-1, 10000, state)
      expect(result.status).toBeNull()
    })
  })

  describe('user input suppression', () => {
    it('suppresses when user typed recently', () => {
      const state = makeState({
        startTime: 0,
        lastUserInput: 9900,    // 100ms ago
        lastInteraction: 0,
      })
      const result = evaluateActivity(100, 10000, state)
      // Within 200ms input suppression — paused
      expect(result.status).toBeNull()
      expect(result.scheduleIdle).toBe(true)
    })

    it('suppresses when window interaction happened recently', () => {
      const state = makeState({
        startTime: 0,
        lastUserInput: 0,
        lastInteraction: 9900,  // 100ms ago
      })
      const result = evaluateActivity(100, 10000, state)
      expect(result.status).toBeNull()
      expect(result.scheduleIdle).toBe(true)
    })

    it('does not suppress when input was long ago', () => {
      const state = makeState({
        startTime: 0,
        lastUserInput: 9700,    // 300ms ago (> 200ms threshold)
        lastInteraction: 9700,
      })
      const result = evaluateActivity(100, 10000, state)
      expect(result.status).toBe('working')
    })
  })

  describe('working transition', () => {
    it('returns working when data arrives outside suppression window', () => {
      const state = makeState({
        startTime: 0,
        lastUserInput: 0,
        lastInteraction: 0,
        lastStatus: 'idle',
      })
      const result = evaluateActivity(50, 10000, state)
      expect(result.status).toBe('working')
      expect(result.scheduleIdle).toBe(true)
    })

    it('returns working even if already working', () => {
      const state = makeState({
        startTime: 0,
        lastUserInput: 0,
        lastInteraction: 0,
        lastStatus: 'working',
      })
      const result = evaluateActivity(50, 10000, state)
      expect(result.status).toBe('working')
      expect(result.scheduleIdle).toBe(true)
    })
  })

  describe('custom config', () => {
    it('respects custom warmup period', () => {
      const config: ActivityDetectorConfig = {
        warmupMs: 1000,
        inputSuppressionMs: 200,
        idleTimeoutMs: 1000,
      }
      const state = makeState({ startTime: 0 })
      // 999ms < 1000ms custom warmup
      expect(evaluateActivity(100, 999, state, config).status).toBeNull()
      // 1001ms > 1000ms custom warmup
      expect(evaluateActivity(100, 1001, state, config).status).toBe('working')
    })

    it('respects custom input suppression', () => {
      const config: ActivityDetectorConfig = {
        warmupMs: 0,
        inputSuppressionMs: 500,
        idleTimeoutMs: 1000,
      }
      const state = makeState({
        startTime: 0,
        lastUserInput: 9600,  // 400ms ago (< 500ms custom threshold)
      })
      const result = evaluateActivity(100, 10000, state, config)
      expect(result.status).toBeNull()  // suppressed
      expect(result.scheduleIdle).toBe(true)
    })
  })

  describe('rapid data bursts', () => {
    it('consistently returns working for sequential data chunks', () => {
      const state = makeState({ startTime: 0 })
      // Simulate rapid data arrival
      for (let t = 6000; t < 6100; t += 10) {
        const result = evaluateActivity(50, t, state)
        expect(result.status).toBe('working')
        expect(result.scheduleIdle).toBe(true)
      }
    })
  })
})
