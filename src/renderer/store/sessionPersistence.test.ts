import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  syncLegacyFields,
  createPanelVisibilityFromLegacy,
  debouncedSave,
  setCurrentProfileId,
  getCurrentProfileId,
  setLoadedSessionCount,
  getLoadedSessionCount,
} from './sessionPersistence'
import { PANEL_IDS } from '../panels/types'
import type { Session, PanelVisibility } from './sessions'

describe('sessionPersistence', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('syncLegacyFields', () => {
    it('syncs legacy fields from panelVisibility', () => {
      const session = {
        panelVisibility: {
          [PANEL_IDS.AGENT_TERMINAL]: false,
          [PANEL_IDS.USER_TERMINAL]: true,
          [PANEL_IDS.EXPLORER]: true,
          [PANEL_IDS.FILE_VIEWER]: false,
        },
      } as Session

      const result = syncLegacyFields(session)
      expect(result.showAgentTerminal).toBe(false)
      expect(result.showUserTerminal).toBe(true)
      expect(result.showExplorer).toBe(true)
      expect(result.showFileViewer).toBe(false)
    })

    it('defaults to true/false when panelVisibility keys are missing', () => {
      const session = {
        panelVisibility: {},
      } as Session

      const result = syncLegacyFields(session)
      expect(result.showAgentTerminal).toBe(true)
      expect(result.showUserTerminal).toBe(false)
      expect(result.showExplorer).toBe(false)
      expect(result.showFileViewer).toBe(false)
    })
  })

  describe('createPanelVisibilityFromLegacy', () => {
    it('returns existing panelVisibility when present', () => {
      const pv: PanelVisibility = { [PANEL_IDS.AGENT_TERMINAL]: false }
      const result = createPanelVisibilityFromLegacy({ panelVisibility: pv })
      expect(result).toBe(pv)
    })

    it('creates panelVisibility from legacy fields', () => {
      const result = createPanelVisibilityFromLegacy({
        showAgentTerminal: true,
        showUserTerminal: true,
        showExplorer: false,
        showFileViewer: true,
      })
      expect(result[PANEL_IDS.AGENT_TERMINAL]).toBe(true)
      expect(result[PANEL_IDS.USER_TERMINAL]).toBe(true)
      expect(result[PANEL_IDS.EXPLORER]).toBe(false)
      expect(result[PANEL_IDS.FILE_VIEWER]).toBe(true)
    })

    it('uses defaults when no legacy fields provided', () => {
      const result = createPanelVisibilityFromLegacy({})
      expect(result[PANEL_IDS.AGENT_TERMINAL]).toBe(true)
      expect(result[PANEL_IDS.USER_TERMINAL]).toBe(false)
      expect(result[PANEL_IDS.EXPLORER]).toBe(false)
      expect(result[PANEL_IDS.FILE_VIEWER]).toBe(false)
    })
  })

  describe('debouncedSave', () => {
    it('calls scheduleSave (via configPersistence)', () => {
      // debouncedSave delegates to scheduleSave which uses setTimeout
      debouncedSave([], {}, 224, [])
      // The function should not throw and should schedule a save
      vi.advanceTimersByTime(600)
      // Just verify it doesn't throw
    })
  })

  describe('profile ID management', () => {
    it('gets and sets current profile ID', () => {
      setCurrentProfileId('profile-1')
      expect(getCurrentProfileId()).toBe('profile-1')
    })
  })

  describe('loaded session count', () => {
    it('gets and sets loaded session count', () => {
      setLoadedSessionCount(5)
      expect(getLoadedSessionCount()).toBe(5)
    })
  })
})
