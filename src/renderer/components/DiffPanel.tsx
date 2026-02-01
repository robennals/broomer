import { useState, useEffect } from 'react'
import type { GitFileStatus } from '../../preload/index'

interface DiffPanelProps {
  directory?: string
}

export default function DiffPanel({ directory }: DiffPanelProps) {
  const [gitStatus, setGitStatus] = useState<GitFileStatus[]>([])
  const [diff, setDiff] = useState<string>('')

  // Load git status and diff
  useEffect(() => {
    if (!directory) {
      setGitStatus([])
      setDiff('')
      return
    }

    window.git.status(directory).then(setGitStatus)
    window.git.diff(directory).then(setDiff)
  }, [directory])

  if (!directory) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        Select a session to view changes
      </div>
    )
  }

  if (!diff && gitStatus.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-border">
          <span className="text-sm font-medium text-text-primary">Changes</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
          No changes to display
        </div>
      </div>
    )
  }

  const lines = diff.split('\n')

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">Changes</span>
        {gitStatus.length > 0 && (
          <span className="px-2 py-0.5 bg-accent text-white rounded-full text-xs">
            {gitStatus.length} file{gitStatus.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="font-mono text-xs overflow-x-auto">
          {lines.map((line, i) => {
            let className = 'px-2 py-0.5 whitespace-pre'
            if (line.startsWith('+') && !line.startsWith('+++')) {
              className += ' bg-green-900/30 text-green-300'
            } else if (line.startsWith('-') && !line.startsWith('---')) {
              className += ' bg-red-900/30 text-red-300'
            } else if (line.startsWith('@@')) {
              className += ' bg-blue-900/30 text-blue-300'
            } else if (line.startsWith('diff ') || line.startsWith('index ')) {
              className += ' text-text-secondary'
            }
            return (
              <div key={i} className={className}>
                {line || ' '}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
