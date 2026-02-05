# Broomer

A desktop application for managing multiple AI coding agents (like Claude Code) across different repositories and worktrees. See all your agent sessions at a glance, monitor their status, and interact with them through embedded terminals.

## Features

- **Session List**: View all active agent sessions with repo name, branch, and status
- **Agent Terminal**: Interactive terminal showing the running agent
- **User Terminal**: Optional secondary terminal for direct commands
- **File Panel**: Browse files and view diffs (coming soon)
- **Status Detection**: Automatic detection of agent state (working, waiting, idle, error)
- **Notifications**: macOS notifications when an agent needs input

## Quick Start

### Prerequisites

- Node.js 18+

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd broomer

# Install dependencies
npm install

# Start in development mode
npm run dev
```

The app will open automatically. You'll see:
- A sidebar with demo sessions on the left
- The main terminal pane in the center
- Toggle buttons for Files and Terminal panels in the title bar

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production (without packaging)
npm run build

# Preview production build
npm run preview
```

**Note:** Development mode (`npm run dev`) and production mode use separate config files:
- Development: `~/.broomer/config.dev.json`
- Production: `~/.broomer/config.json`

This allows you to have test sessions in dev mode without affecting your real work.

The dev build shows a yellow "DEV" chip in the title bar so you can easily tell which mode you're in.

### Building for Distribution

```bash
# Build and package the app for macOS
npm run dist

# Run the packaged app
npm start
```

The packaged app will be in the `dist/` folder.

### Testing

Run the Playwright E2E tests (window is hidden):

```bash
npm test
```

Run tests with visible window (useful for debugging):

```bash
npm run test:headed
```

Tests (23 total) cover:
- UI components (app title, session list, status indicators)
- Terminal integration (xterm rendering, command execution)
- Panel toggles (Files, Terminal) and button states
- Session switching between multiple sessions
- File panel content (Tree/Diff buttons, file listing)
- E2E shell integration with test markers

### Troubleshooting

If you encounter "posix_spawnp failed" errors with the terminal, rebuild native modules:

```bash
npx @electron/rebuild
```

## Usage

### Creating a New Session

1. Click "+ New Session" in the sidebar
2. Select a directory for the agent to work in
3. Choose a command preset (e.g., "Claude Code")
4. The agent will start automatically

### Managing Sessions

- Click a session in the sidebar to switch to it
- The status indicator shows:
  - 🟢 **Working** - Agent is actively processing
  - 🟡 **Waiting** - Agent needs input
  - ⚫ **Idle** - Agent is waiting for commands
  - 🔴 **Error** - Something went wrong

### Keyboard Shortcuts

- `Cmd+1-6` - Toggle panels (based on toolbar order)
- `Cmd+Shift+C` - Copy terminal content + session summary to clipboard (for debugging)

## Architecture

Built with:
- **Electron** - Cross-platform desktop framework
- **React** - UI components
- **Vite** - Fast build tooling with HMR
- **xterm.js** - Terminal emulation
- **node-pty** - Native PTY bindings
- **Tailwind CSS** - Styling

## Project Structure

```
broomer/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.ts    # App entry, window creation, PTY management
│   ├── preload/        # Context bridge
│   │   └── index.ts    # Exposes PTY API to renderer
│   └── renderer/       # React application
│       ├── App.tsx
│       └── components/
│           ├── Layout.tsx
│           ├── SessionList.tsx
│           ├── Terminal.tsx
│           └── FilePanel.tsx
├── docs/plans/         # Implementation plans
└── package.json
```

## License

MIT
