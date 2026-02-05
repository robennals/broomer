# Multi-Agent Session Manager - Implementation Plan

## Overview
A desktop application for managing multiple AI coding agents (starting with Claude Code) across different repos/worktrees, with real-time visibility into each agent's status and interactive terminal access.

## Difficulty Assessment

**Overall: Moderate** - This is achievable in a focused effort. The core technologies are mature and well-documented.

| Component | Difficulty | Notes |
|-----------|------------|-------|
| Terminal embedding | Easy | xterm.js is battle-tested |
| Session management | Easy-Medium | Standard state management |
| Agent status detection | Medium | Requires parsing terminal output |
| File diff viewer | Easy | Monaco editor has built-in diff |
| Git integration | Easy | simple-git or direct CLI |
| Cross-platform | Easy | Electron handles this |
| Hot reload | Easy | Vite provides this out of box |

## Recommended Tech Stack

### Framework: Electron + React + Vite

**Why Electron over alternatives:**
- **vs Tauri**: xterm.js + node-pty is proven, Tauri would need custom PTY bridging
- **vs Flutter**: Poor terminal embedding support
- **vs Native Swift**: Mac-only, harder to port

**Why React + Vite:**
- Vite provides instant HMR (hot module replacement)
- React has excellent component model for this UI
- Large ecosystem of compatible libraries

### Key Libraries

| Purpose | Library | Rationale |
|---------|---------|-----------|
| Terminal | xterm.js + node-pty | Industry standard (VS Code uses this) |
| File viewer/diffs | Monaco Editor | VS Code's editor, excellent diff support |
| Git operations | simple-git | Clean Promise-based API |
| State management | Zustand | Lightweight, simple |
| Styling | Tailwind CSS | Fast iteration, utility-first |
| IPC | electron-trpc or ipc-bridge | Type-safe main↔renderer communication |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   MAIN PROCESS (Node.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Session   │  │  PTY Pool   │  │   File Watcher      │  │
│  │   Manager   │  │  (node-pty) │  │   (chokidar)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │ Git Service │  │ Status      │                           │
│  │ (simple-git)│  │ Detector    │                           │
│  └─────────────┘  └─────────────┘                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC (contextBridge)
┌──────────────────────────┴──────────────────────────────────┐
│                 RENDERER PROCESS (React)                     │
│  ┌──────────┐  ┌────────────────────┐  ┌─────────────────┐  │
│  │ Session  │  │   Agent Terminal   │  │  File/Diff      │  │
│  │ Sidebar  │  │   (xterm.js)       │  │  Panel          │  │
│  │          │  │                    │  │  (Monaco)       │  │
│  └──────────┘  └────────────────────┘  └─────────────────┘  │
│               ┌─────────────────────────────────────────┐   │
│               │      User Terminal (xterm.js)           │   │
│               └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## User Decisions

- **Session persistence**: Yes - save to disk, restore on restart
- **Agent spawning**: Auto-spawn with configurable command presets
- **Notifications**: Yes - macOS notifications when agent needs input
- **Theme**: Dark mode only

## Data Model

```typescript
// Command presets for different agents
interface CommandPreset {
  id: string;
  name: string;           // e.g., "Claude Code", "Claude Code (verbose)"
  command: string;        // e.g., "claude", "claude --verbose"
  isDefault: boolean;
}

interface Session {
  id: string;
  name: string;
  directory: string;        // Working directory
  repoName: string;         // Derived from git or folder name
  branch: string;           // Current git branch
  status: 'working' | 'waiting' | 'idle' | 'error';
  commandPresetId: string;  // Which preset to use
  agentPtyId: string;       // Reference to agent terminal PTY
  userPtyId?: string;       // Optional user terminal PTY
  createdAt: Date;
}

interface AppState {
  sessions: Session[];
  activeSessionId: string | null;
  showFilePanel: boolean;
  showUserTerminal: boolean;
  filePanelMode: 'tree' | 'diff';
  commandPresets: CommandPreset[];
}

// Persisted to ~/.broomer/config.json
interface PersistedConfig {
  sessions: Omit<Session, 'agentPtyId' | 'userPtyId' | 'status'>[];
  commandPresets: CommandPreset[];
  windowBounds?: { x: number; y: number; width: number; height: number };
}
```

## UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [+New] [Settings]                              [≡ File Panel] │
├────────────┬───────────────────────────┬───────────────────────┤
│            │                           │                       │
│  Sessions  │    Agent Terminal         │    File Panel         │
│  ─────────│                           │    (togglable)        │
│  ● myapp   │    $ claude               │                       │
│    main    │    > Working on task...   │    [Tree] [Diff]      │
│    working │                           │                       │
│            │                           │    src/               │
│  ○ backend │                           │    ├── index.ts       │
│    feature │                           │    └── utils.ts       │
│    waiting │                           │                       │
│            │                           │                       │
├────────────┴───────────────────────────┴───────────────────────┤
│  User Terminal (togglable)                                     │
│  $ git status                                                  │
│  On branch main...                                             │
└────────────────────────────────────────────────────────────────┘
```

## Agent Status Detection

Claude Code outputs specific patterns we can detect:
- **Working**: Recent output activity, no prompt visible
- **Waiting**: Prompt visible with "?" or waiting for input indicators
- **Idle**: Prompt visible, no recent activity
- **Error**: Error patterns in output

```typescript
// Example status detection (simplified)
function detectStatus(buffer: string, lastActivity: Date): SessionStatus {
  const lines = buffer.split('\n').slice(-20); // Check last 20 lines
  const lastLine = lines[lines.length - 1];

  if (lastLine.includes('?') || lastLine.includes('[y/n]')) {
    return 'waiting';
  }
  if (Date.now() - lastActivity.getTime() < 2000) {
    return 'working';
  }
  if (lastLine.match(/^\s*[$>]\s*$/)) {
    return 'idle';
  }
  return 'working';
}
```

## Project Structure

```
broomer/
├── package.json
├── vite.config.ts
├── electron.vite.config.ts
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.ts             # Entry point
│   │   ├── session-manager.ts   # Session CRUD
│   │   ├── pty-manager.ts       # PTY pool management
│   │   ├── git-service.ts       # Git operations
│   │   ├── status-detector.ts   # Agent status detection
│   │   └── ipc-handlers.ts      # IPC registration
│   ├── preload/
│   │   └── index.ts             # Context bridge
│   └── renderer/                # React app
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── SessionList.tsx
│       │   ├── AgentTerminal.tsx
│       │   ├── FilePanel.tsx
│       │   ├── UserTerminal.tsx
│       │   └── Layout.tsx
│       ├── hooks/
│       │   ├── useSession.ts
│       │   └── useTerminal.ts
│       └── store/
│           └── index.ts         # Zustand store
├── electron-builder.yml
└── tsconfig.json
```

## Implementation Phases

### Phase 1: Project Setup & Basic Shell
- Initialize electron-vite project
- Set up React with Tailwind
- Create basic 3-pane layout (hardcoded)
- Verify hot reload works

### Phase 2: Terminal Integration
- Integrate xterm.js in renderer
- Set up node-pty in main process
- Create IPC bridge for PTY data
- Get single working terminal

### Phase 3: Session Management
- Implement session data model
- Session list UI component
- Add/remove sessions
- Session persistence (JSON file to ~/.broomer/)
- Command presets (settings UI to add/edit presets)
- Auto-spawn agent command on session create

### Phase 4: Multi-Terminal Support
- PTY pool in main process
- Terminal per session
- Switch terminals on session select
- User terminal (secondary)

### Phase 5: Git & Status Integration
- Git branch detection
- Agent status detection
- Auto-refresh on changes
- Status indicators in session list

### Phase 6: File Panel
- File tree view
- Monaco editor integration
- Diff view mode
- Panel toggle

### Phase 7: Notifications & Polish
- macOS notifications when agent status → 'waiting'
- Keyboard shortcuts
- Session renaming
- Directory picker for new sessions
- Window state persistence

## Verification Plan

1. **Hot reload**: Edit a React component, verify instant update
2. **Terminal**: Type commands, verify input/output works
3. **Multi-session**: Create 3+ sessions, switch between them
4. **Git integration**: Change branch in terminal, verify sidebar updates
5. **Status detection**: Start Claude, verify status changes from idle→working→waiting
6. **File panel**: Navigate files, view diffs
7. **User terminal**: Run commands in user terminal while agent runs

## Getting Started Commands

```bash
# Install dependencies
pnpm install

# Start development (with hot reload)
pnpm dev
```
