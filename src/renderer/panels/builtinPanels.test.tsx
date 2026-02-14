// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { BUILTIN_PANELS, PanelIcons } from './builtinPanels'
import { PANEL_IDS } from './types'

describe('builtinPanels', () => {
  it('defines all expected panel IDs', () => {
    const ids = BUILTIN_PANELS.map((p) => p.id)
    expect(ids).toContain(PANEL_IDS.SIDEBAR)
    expect(ids).toContain(PANEL_IDS.EXPLORER)
    expect(ids).toContain(PANEL_IDS.FILE_VIEWER)
    expect(ids).toContain(PANEL_IDS.REVIEW)
    expect(ids).toContain(PANEL_IDS.AGENT_TERMINAL)
    expect(ids).toContain(PANEL_IDS.USER_TERMINAL)
    expect(ids).toContain(PANEL_IDS.SETTINGS)
    expect(ids).toContain(PANEL_IDS.TUTORIAL)
  })

  it('has 8 built-in panels', () => {
    expect(BUILTIN_PANELS).toHaveLength(8)
  })

  it('has unique IDs', () => {
    const ids = BUILTIN_PANELS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each panel has required fields', () => {
    for (const panel of BUILTIN_PANELS) {
      expect(panel.id).toBeTruthy()
      expect(panel.name).toBeTruthy()
      expect(panel.icon).toBeDefined()
      expect(panel.position).toBeDefined()
      expect(typeof panel.defaultVisible).toBe('boolean')
      expect(typeof panel.defaultInToolbar).toBe('boolean')
    }
  })

  it('sidebar is the only sidebar-positioned panel', () => {
    const sidebarPanels = BUILTIN_PANELS.filter((p) => p.position === 'sidebar')
    expect(sidebarPanels).toHaveLength(1)
    expect(sidebarPanels[0].id).toBe(PANEL_IDS.SIDEBAR)
  })

  it('settings panel is an overlay', () => {
    const settings = BUILTIN_PANELS.find((p) => p.id === PANEL_IDS.SETTINGS)
    expect(settings?.position).toBe('overlay')
  })

  it('resizable panels have min/max sizes', () => {
    const resizable = BUILTIN_PANELS.filter((p) => p.resizable && p.id !== PANEL_IDS.FILE_VIEWER)
    for (const panel of resizable) {
      expect(panel.minSize).toBeGreaterThan(0)
      expect(panel.maxSize).toBeGreaterThan(panel.minSize!)
    }
  })

  it('global panels are sidebar, settings, and tutorial', () => {
    const globals = BUILTIN_PANELS.filter((p) => p.isGlobal)
    const ids = globals.map((p) => p.id)
    expect(ids).toContain(PANEL_IDS.SIDEBAR)
    expect(ids).toContain(PANEL_IDS.SETTINGS)
    expect(ids).toContain(PANEL_IDS.TUTORIAL)
    expect(globals).toHaveLength(3)
  })

  it('exports icon components', () => {
    expect(PanelIcons.sessions).toBeDefined()
    expect(PanelIcons.folder).toBeDefined()
    expect(PanelIcons.file).toBeDefined()
    expect(PanelIcons.review).toBeDefined()
    expect(PanelIcons.terminal).toBeDefined()
    expect(PanelIcons.settings).toBeDefined()
    expect(PanelIcons.guide).toBeDefined()
  })

  it('agent terminal is default visible', () => {
    const agent = BUILTIN_PANELS.find((p) => p.id === PANEL_IDS.AGENT_TERMINAL)
    expect(agent?.defaultVisible).toBe(true)
  })

  it('sidebar is default visible', () => {
    const sidebar = BUILTIN_PANELS.find((p) => p.id === PANEL_IDS.SIDEBAR)
    expect(sidebar?.defaultVisible).toBe(true)
  })
})
