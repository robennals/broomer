#!/usr/bin/env node

// Cross-platform script to build and open the packaged app.
// Replaces the macOS-only "open dist/mac-arm64/Broomy.app" command.

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const ROOT = path.resolve(__dirname, '..')

// Build first
execSync('pnpm dist:dir', { cwd: ROOT, stdio: 'inherit' })

const distDir = path.join(ROOT, 'dist')
const platform = process.platform

if (platform === 'darwin') {
  // Find .app bundle in dist/
  const macDirs = fs.readdirSync(distDir).filter(d => d.startsWith('mac'))
  for (const dir of macDirs) {
    const entries = fs.readdirSync(path.join(distDir, dir))
    const app = entries.find(e => e.endsWith('.app'))
    if (app) {
      execSync(`open "${path.join(distDir, dir, app)}"`, { stdio: 'inherit' })
      process.exit(0)
    }
  }
  console.error('Could not find .app bundle in dist/')
  process.exit(1)
} else if (platform === 'win32') {
  // Find .exe in dist/win-unpacked/
  const winDir = path.join(distDir, 'win-unpacked')
  if (fs.existsSync(winDir)) {
    const exe = fs.readdirSync(winDir).find(f => f.endsWith('.exe'))
    if (exe) {
      execSync(`start "" "${path.join(winDir, exe)}"`, { stdio: 'inherit', shell: true })
      process.exit(0)
    }
  }
  console.error('Could not find .exe in dist/win-unpacked/')
  process.exit(1)
} else {
  // Linux - find AppImage or unpacked executable
  const linuxDir = path.join(distDir, 'linux-unpacked')
  if (fs.existsSync(linuxDir)) {
    const bin = fs.readdirSync(linuxDir).find(f => f.toLowerCase().includes('broomy'))
    if (bin) {
      execSync(`"${path.join(linuxDir, bin)}"`, { stdio: 'inherit', shell: true })
      process.exit(0)
    }
  }
  console.error('Could not find executable in dist/linux-unpacked/')
  process.exit(1)
}
