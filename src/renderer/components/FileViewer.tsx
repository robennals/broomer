import { useEffect, useState } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { basename } from 'path-browserify'

// Configure Monaco to use locally bundled version instead of CDN
loader.config({ monaco })

export type FileViewerPosition = 'top' | 'left'

interface FileViewerProps {
  filePath: string | null
  position?: FileViewerPosition
  onPositionChange?: (position: FileViewerPosition) => void
  onClose?: () => void
}

// Map file extensions to Monaco language IDs
const getLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || ''
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    scss: 'scss',
    less: 'less',
    html: 'html',
    htm: 'html',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    sql: 'sql',
    graphql: 'graphql',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    toml: 'ini',
    ini: 'ini',
    env: 'ini',
  }
  return languageMap[ext] || 'plaintext'
}

export default function FileViewer({ filePath, position = 'top', onPositionChange, onClose }: FileViewerProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!filePath) {
      setContent('')
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const loadFile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await window.fs.readFile(filePath)
        if (!cancelled) {
          setContent(data)
          setIsLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to read file'
          setError(message)
          setIsLoading(false)
        }
      }
    }

    loadFile()

    return () => {
      cancelled = true
    }
  }, [filePath])

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        Select a file to view
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 text-sm">
        {error}
      </div>
    )
  }

  const fileName = basename(filePath)
  const language = getLanguageFromPath(filePath)

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">{fileName}</span>
          <span className="text-xs text-text-secondary truncate">{filePath}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Position toggle icons */}
          {onPositionChange && (
            <>
              <button
                onClick={() => onPositionChange('top')}
                className={`p-1 rounded transition-colors ${
                  position === 'top'
                    ? 'bg-accent text-white'
                    : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
                title="Position above agent"
              >
                {/* File on top icon - filled rect on top, empty below */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="8" rx="1" fill="currentColor" />
                  <rect x="3" y="13" width="18" height="8" rx="1" fill="none" />
                </svg>
              </button>
              <button
                onClick={() => onPositionChange('left')}
                className={`p-1 rounded transition-colors ${
                  position === 'left'
                    ? 'bg-accent text-white'
                    : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'
                }`}
                title="Position left of agent"
              >
                {/* File on left icon - filled rect on left, empty on right */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="8" height="18" rx="1" fill="currentColor" />
                  <rect x="13" y="3" width="8" height="18" rx="1" fill="none" />
                </svg>
              </button>
            </>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              title="Close file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  )
}
