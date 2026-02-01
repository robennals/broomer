import { useEffect, useState } from 'react'
import { basename } from 'path-browserify'
import { getViewersForFile, isTextContent } from './fileViewers'
import type { FileViewerPlugin } from './fileViewers'

export type FileViewerPosition = 'top' | 'left'

interface FileViewerProps {
  filePath: string | null
  position?: FileViewerPosition
  onPositionChange?: (position: FileViewerPosition) => void
  onClose?: () => void
}

export default function FileViewer({ filePath, position = 'top', onPositionChange, onClose }: FileViewerProps) {
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableViewers, setAvailableViewers] = useState<FileViewerPlugin[]>([])
  const [selectedViewerId, setSelectedViewerId] = useState<string | null>(null)

  useEffect(() => {
    if (!filePath) {
      setContent('')
      setIsLoading(false)
      setError(null)
      setAvailableViewers([])
      setSelectedViewerId(null)
      return
    }

    let cancelled = false

    const loadFile = async () => {
      setIsLoading(true)
      setError(null)

      // Get viewers that can handle this file based on extension
      let viewers = getViewersForFile(filePath)

      // Check if any non-text viewer (like image) can handle this file
      const hasNonTextViewer = viewers.some(v => v.id === 'image')

      let data = ''
      let readError: Error | null = null

      // Try to read as text (may fail for binary files)
      try {
        data = await window.fs.readFile(filePath)
      } catch (err) {
        readError = err instanceof Error ? err : new Error('Failed to read file')
      }

      if (cancelled) return

      // If we couldn't read as text but have a non-text viewer, that's OK
      if (readError && !hasNonTextViewer) {
        setError(readError.message)
        setIsLoading(false)
        return
      }

      setContent(data)

      // Filter viewers based on content
      viewers = viewers.filter(viewer => {
        // Image viewer doesn't need text content
        if (viewer.id === 'image') return true
        // Monaco viewer needs text content
        if (viewer.id === 'monaco') {
          return data && isTextContent(data)
        }
        // Other viewers need content
        return !!data
      })

      setAvailableViewers(viewers)

      // Select the highest priority viewer by default, or keep current if still available
      if (viewers.length > 0) {
        const currentStillAvailable = viewers.find(v => v.id === selectedViewerId)
        if (!currentStillAvailable) {
          setSelectedViewerId(viewers[0].id)
        }
      } else {
        setSelectedViewerId(null)
      }

      setIsLoading(false)
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

  // Get the selected viewer
  const selectedViewer = availableViewers.find(v => v.id === selectedViewerId)

  if (!selectedViewer) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        No viewer available for this file type
      </div>
    )
  }

  const fileName = basename(filePath)
  const ViewerComponent = selectedViewer.component

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-text-primary truncate">{fileName}</span>
          <span className="text-xs text-text-secondary truncate">{filePath}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Viewer selector icons when multiple viewers are available */}
          {availableViewers.length > 1 && (
            <div className="flex items-center gap-1 mr-2">
              {availableViewers.map(viewer => (
                <button
                  key={viewer.id}
                  onClick={() => setSelectedViewerId(viewer.id)}
                  className={`p-1.5 rounded transition-colors ${
                    selectedViewerId === viewer.id
                      ? 'bg-accent text-white'
                      : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'
                  }`}
                  title={viewer.name}
                >
                  {viewer.icon || (
                    <span className="text-xs font-medium w-4 h-4 flex items-center justify-center">
                      {viewer.name.charAt(0)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

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
      <div className="flex-1 min-h-0">
        <ViewerComponent filePath={filePath} content={content} />
      </div>
    </div>
  )
}
