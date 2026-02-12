import { chmodSync } from 'fs'

export const isWindows = process.platform === 'win32'
export const isMac = process.platform === 'darwin'

export function getDefaultShell(): string {
  if (isWindows) return process.env.ComSpec || 'powershell.exe'
  return process.env.SHELL || '/bin/zsh'
}

export function getExecShell(): string | undefined {
  return isWindows ? undefined : '/bin/bash'
}

export function normalizePath(p: string): string {
  return p.replace(/\\/g, '/')
}

export function makeExecutable(filePath: string): void {
  if (!isWindows) {
    chmodSync(filePath, 0o755)
  }
}
