import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useSessionStore } from './sessions'
import { PANEL_IDS, DEFAULT_TOOLBAR_PANELS } from '../panels/types'
import { setLoadedCounts } from './configPersistence'

describe('sessionTerminalTabs', () => {
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
      panelVisibility: { [PANEL_IDS.AGENT_TERMINAL]: true },
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
      terminalTabs: {
        tabs: [{ id: 'tab-1', name: 'Terminal' }],
        activeTabId: 'tab-1',
      },
      branchStatus: 'in-progress' as const,
      isArchived: false,
    }
    useSessionStore.setState({ sessions: [session], activeSessionId: id })
    return session
  }

  describe('addTerminalTab', () => {
    it('adds a new tab and makes it active', () => {
      addTestSession()
      const tabId = useSessionStore.getState().addTerminalTab('test-session')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(2)
      expect(session.terminalTabs.activeTabId).toBe(tabId)
    })

    it('uses provided name', () => {
      addTestSession()
      useSessionStore.getState().addTerminalTab('test-session', 'Custom Tab')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs[1].name).toBe('Custom Tab')
    })

    it('auto-generates tab name based on count', () => {
      addTestSession()
      useSessionStore.getState().addTerminalTab('test-session')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs[1].name).toBe('Terminal 2')
    })
  })

  describe('removeTerminalTab', () => {
    it('removes a tab', () => {
      addTestSession()
      const tabId = useSessionStore.getState().addTerminalTab('test-session')
      useSessionStore.getState().removeTerminalTab('test-session', tabId)
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
    })

    it('does not remove the last tab', () => {
      addTestSession()
      useSessionStore.getState().removeTerminalTab('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
    })

    it('selects adjacent tab when removing active tab', () => {
      addTestSession()
      const tab2 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      const tab3 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 3')
      // tab3 is active now. Remove it.
      useSessionStore.getState().removeTerminalTab('test-session', tab3)
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.activeTabId).toBe(tab2)
    })

    it('preserves active tab when removing non-active tab', () => {
      addTestSession()
      const tab2 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      // tab2 is now active. Remove tab-1.
      useSessionStore.getState().removeTerminalTab('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.activeTabId).toBe(tab2)
    })
  })

  describe('renameTerminalTab', () => {
    it('renames a tab', () => {
      addTestSession()
      useSessionStore.getState().renameTerminalTab('test-session', 'tab-1', 'New Name')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs[0].name).toBe('New Name')
    })
  })

  describe('reorderTerminalTabs', () => {
    it('reorders tabs', () => {
      addTestSession()
      const tab2Id = useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      const tabs = useSessionStore.getState().sessions[0].terminalTabs.tabs
      const reversed = [...tabs].reverse()
      useSessionStore.getState().reorderTerminalTabs('test-session', reversed)
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs[0].id).toBe(tab2Id)
    })
  })

  describe('setActiveTerminalTab', () => {
    it('sets the active tab', () => {
      addTestSession()
      useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      useSessionStore.getState().setActiveTerminalTab('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.activeTabId).toBe('tab-1')
    })
  })

  describe('closeOtherTerminalTabs', () => {
    it('keeps only the specified tab', () => {
      addTestSession()
      useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      useSessionStore.getState().addTerminalTab('test-session', 'Tab 3')
      useSessionStore.getState().closeOtherTerminalTabs('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
      expect(session.terminalTabs.tabs[0].id).toBe('tab-1')
      expect(session.terminalTabs.activeTabId).toBe('tab-1')
    })

    it('is a no-op if tab not found', () => {
      addTestSession()
      useSessionStore.getState().closeOtherTerminalTabs('test-session', 'nonexistent')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
    })
  })

  describe('closeTerminalTabsToRight', () => {
    it('removes tabs to the right of the specified tab', () => {
      addTestSession()
      useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      const tab3 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 3')
      // Close tabs to the right of tab-1
      useSessionStore.getState().closeTerminalTabsToRight('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
      expect(session.terminalTabs.tabs[0].id).toBe('tab-1')
    })

    it('switches active tab when active tab is to the right', () => {
      addTestSession()
      const tab2 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      const tab3 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 3')
      // tab3 is active, close to right of tab-1
      useSessionStore.getState().closeTerminalTabsToRight('test-session', 'tab-1')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.activeTabId).toBe('tab-1')
    })

    it('preserves active tab when it is to the left', () => {
      addTestSession()
      const tab2 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 2')
      const tab3 = useSessionStore.getState().addTerminalTab('test-session', 'Tab 3')
      // Set tab-1 as active
      useSessionStore.getState().setActiveTerminalTab('test-session', 'tab-1')
      // Close to right of tab2
      useSessionStore.getState().closeTerminalTabsToRight('test-session', tab2)
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.activeTabId).toBe('tab-1')
    })

    it('is a no-op for unknown tab', () => {
      addTestSession()
      useSessionStore.getState().closeTerminalTabsToRight('test-session', 'nonexistent')
      const session = useSessionStore.getState().sessions[0]
      expect(session.terminalTabs.tabs).toHaveLength(1)
    })
  })
})
