import { describe, it, expect } from 'vitest'
import {
  PANEL_IDS,
  DEFAULT_TOOLBAR_PANELS,
  MAX_SHORTCUT_PANELS,
  PanelRegistry,
  panelRegistry,
  BUILTIN_PANELS,
  PanelIcons,
} from './index'

describe('panels barrel export', () => {
  it('exports PANEL_IDS', () => {
    expect(PANEL_IDS).toBeDefined()
    expect(PANEL_IDS.SIDEBAR).toBeDefined()
  })

  it('exports DEFAULT_TOOLBAR_PANELS', () => {
    expect(DEFAULT_TOOLBAR_PANELS).toBeDefined()
    expect(Array.isArray(DEFAULT_TOOLBAR_PANELS)).toBe(true)
  })

  it('exports MAX_SHORTCUT_PANELS', () => {
    expect(typeof MAX_SHORTCUT_PANELS).toBe('number')
  })

  it('exports PanelRegistry class', () => {
    expect(PanelRegistry).toBeDefined()
  })

  it('exports panelRegistry singleton', () => {
    expect(panelRegistry).toBeInstanceOf(PanelRegistry)
  })

  it('exports BUILTIN_PANELS', () => {
    expect(Array.isArray(BUILTIN_PANELS)).toBe(true)
    expect(BUILTIN_PANELS.length).toBeGreaterThan(0)
  })

  it('exports PanelIcons', () => {
    expect(PanelIcons).toBeDefined()
  })
})
