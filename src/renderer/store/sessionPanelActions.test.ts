import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSessionStore } from './sessions'
import { PANEL_IDS, DEFAULT_TOOLBAR_PANELS } from '../panels/types'
import { setLoadedCounts } from './configPersistence'

describe('sessionPanelActions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setLoadedCounts({ sessions: 0, agents: 0, repos: 0 })
    useSessionStore.setState({
      sessions: [],
      activeSessionId: null,
      isLoading: false,
      showSidebar: true,
      showSettings: false,
      sidebarWidth: 224,
      toolbarPanels: [...DEFAULT_TOOLBAR_PANELS],
      globalPanelVisibility: {
        [PANEL_IDS.SIDEBAR]: true,
        [PANEL_IDS.SETTINGS]: false,
      },
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function addTestSession(id: string = 'test-session') {
    const session = {
      id,
      name: 'test',
      directory: '/test',
      branch: 'main',
      status: 'idle' as const,
      agentId: null,
      panelVisibility: {
        [PANEL_IDS.AGENT_TERMINAL]: true,
        [PANEL_IDS.USER_TERMINAL]: false,
        [PANEL_IDS.EXPLORER]: false,
        [PANEL_IDS.FILE_VIEWER]: false,
      },
      showAgentTerminal: true,
      showUserTerminal: false,
      showExplorer: false,
      showFileViewer: false,
      showDiff: false,
      selectedFilePath: null,
      planFilePath: null,
      fileViewerPosition: 'top' as const,
      layoutSizes: { explorerWidth: 256, fileViewerSize: 300, userTerminalHeight: 192, diffPanelWidth: 320, reviewPanelWidth: 320 },
      explorerFilter: 'files' as const,
      lastMessage: null,
      lastMessageTime: null,
      isUnread: false,
      workingStartTime: null,
      recentFiles: [],
      terminalTabs: { tabs: [{ id: 'tab-1', name: 'Terminal' }], activeTabId: 'tab-1' },
      branchStatus: 'in-progress' as const,
      isArchived: false,
    }
    useSessionStore.setState({ sessions: [session], activeSessionId: id })
    return session
  }

  describe('togglePanel', () => {
    it('toggles a panel from hidden to visible', () => {
      addTestSession()
      useSessionStore.getState().togglePanel('test-session', PANEL_IDS.USER_TERMINAL)
      const session = useSessionStore.getState().sessions[0]
      expect(session.panelVisibility[PANEL_IDS.USER_TERMINAL]).toBe(true)
      expect(session.showUserTerminal).toBe(true)
    })

    it('toggles a panel from visible to hidden', () => {
      addTestSession()
      useSessionStore.getState().togglePanel('test-session', PANEL_IDS.AGENT_TERMINAL)
      const session = useSessionStore.getState().sessions[0]
      expect(session.panelVisibility[PANEL_IDS.AGENT_TERMINAL]).toBe(false)
      expect(session.showAgentTerminal).toBe(false)
    })

    it('does not affect other sessions', () => {
      addTestSession('s1')
      const s2 = { ...useSessionStore.getState().sessions[0], id: 's2' }
      useSessionStore.setState({ sessions: [...useSessionStore.getState().sessions, s2] })

      useSessionStore.getState().togglePanel('s1', PANEL_IDS.USER_TERMINAL)
      expect(useSessionStore.getState().sessions[1].panelVisibility[PANEL_IDS.USER_TERMINAL]).toBe(false)
    })
  })

  describe('toggleGlobalPanel', () => {
    it('toggles sidebar visibility', () => {
      addTestSession()
      useSessionStore.getState().toggleGlobalPanel(PANEL_IDS.SIDEBAR)
      expect(useSessionStore.getState().globalPanelVisibility[PANEL_IDS.SIDEBAR]).toBe(false)
      expect(useSessionStore.getState().showSidebar).toBe(false)
    })

    it('toggles settings visibility', () => {
      addTestSession()
      useSessionStore.getState().toggleGlobalPanel(PANEL_IDS.SETTINGS)
      expect(useSessionStore.getState().globalPanelVisibility[PANEL_IDS.SETTINGS]).toBe(true)
      expect(useSessionStore.getState().showSettings).toBe(true)
    })
  })

  describe('setPanelVisibility', () => {
    it('sets a panel to visible', () => {
      addTestSession()
      useSessionStore.getState().setPanelVisibility('test-session', PANEL_IDS.EXPLORER, true)
      const session = useSessionStore.getState().sessions[0]
      expect(session.panelVisibility[PANEL_IDS.EXPLORER]).toBe(true)
      expect(session.showExplorer).toBe(true)
    })

    it('sets a panel to hidden', () => {
      addTestSession()
      useSessionStore.getState().setPanelVisibility('test-session', PANEL_IDS.AGENT_TERMINAL, false)
      const session = useSessionStore.getState().sessions[0]
      expect(session.panelVisibility[PANEL_IDS.AGENT_TERMINAL]).toBe(false)
      expect(session.showAgentTerminal).toBe(false)
    })
  })

  describe('setToolbarPanels', () => {
    it('updates toolbar panels', () => {
      addTestSession()
      const customPanels = [PANEL_IDS.SIDEBAR, PANEL_IDS.EXPLORER]
      useSessionStore.getState().setToolbarPanels(customPanels)
      expect(useSessionStore.getState().toolbarPanels).toEqual(customPanels)
    })
  })

  describe('setSidebarWidth', () => {
    it('updates sidebar width', () => {
      addTestSession()
      useSessionStore.getState().setSidebarWidth(300)
      expect(useSessionStore.getState().sidebarWidth).toBe(300)
    })
  })

  describe('legacy toggle helpers', () => {
    it('toggleAgentTerminal delegates to togglePanel', () => {
      addTestSession()
      useSessionStore.getState().toggleAgentTerminal('test-session')
      expect(useSessionStore.getState().sessions[0].panelVisibility[PANEL_IDS.AGENT_TERMINAL]).toBe(false)
    })

    it('toggleUserTerminal delegates to togglePanel', () => {
      addTestSession()
      useSessionStore.getState().toggleUserTerminal('test-session')
      expect(useSessionStore.getState().sessions[0].panelVisibility[PANEL_IDS.USER_TERMINAL]).toBe(true)
    })

    it('toggleExplorer delegates to togglePanel', () => {
      addTestSession()
      useSessionStore.getState().toggleExplorer('test-session')
      expect(useSessionStore.getState().sessions[0].panelVisibility[PANEL_IDS.EXPLORER]).toBe(true)
    })

    it('toggleFileViewer delegates to togglePanel', () => {
      addTestSession()
      useSessionStore.getState().toggleFileViewer('test-session')
      expect(useSessionStore.getState().sessions[0].panelVisibility[PANEL_IDS.FILE_VIEWER]).toBe(true)
    })
  })
})
