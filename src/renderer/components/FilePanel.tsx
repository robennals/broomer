interface FilePanelProps {
  directory?: string
}

export default function FilePanel({ directory }: FilePanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-xs rounded bg-bg-tertiary text-text-primary">
            Tree
          </button>
          <button className="px-3 py-1 text-xs rounded text-text-secondary hover:text-text-primary">
            Diff
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {directory ? (
          <div className="text-sm">
            <div className="text-text-secondary mb-2 truncate">{directory}</div>
            {/* Placeholder file tree - will be replaced with actual file listing */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-bg-tertiary cursor-pointer">
                <span className="text-text-secondary">📁</span>
                <span>src</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2 pl-6 rounded hover:bg-bg-tertiary cursor-pointer">
                <span className="text-text-secondary">📄</span>
                <span>index.ts</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2 pl-6 rounded hover:bg-bg-tertiary cursor-pointer">
                <span className="text-text-secondary">📄</span>
                <span>utils.ts</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-bg-tertiary cursor-pointer">
                <span className="text-text-secondary">📄</span>
                <span>package.json</span>
              </div>
              <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-bg-tertiary cursor-pointer">
                <span className="text-text-secondary">📄</span>
                <span>README.md</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-text-secondary text-sm py-8">
            Select a session to view files
          </div>
        )}
      </div>
    </div>
  )
}
