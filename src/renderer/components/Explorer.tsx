import { useState, useEffect, useCallback } from 'react'
import type { FileEntry, GitFileStatus } from '../../preload/index'

interface ExplorerProps {
  directory?: string
  onFileSelect?: (filePath: string) => void
}

interface TreeNode extends FileEntry {
  children?: TreeNode[]
  isExpanded?: boolean
}

export default function Explorer({ directory, onFileSelect }: ExplorerProps) {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [gitStatus, setGitStatus] = useState<GitFileStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load directory contents
  const loadDirectory = useCallback(async (dirPath: string): Promise<TreeNode[]> => {
    try {
      const entries = await window.fs.readDir(dirPath)
      return entries.map((entry) => ({
        ...entry,
        isExpanded: false,
      }))
    } catch {
      return []
    }
  }, [])

  // Load root directory
  useEffect(() => {
    if (!directory) {
      setTree([])
      return
    }

    setIsLoading(true)
    loadDirectory(directory).then((entries) => {
      setTree(entries)
      setIsLoading(false)
    })
  }, [directory, loadDirectory])

  // Load git status
  useEffect(() => {
    if (!directory) {
      setGitStatus([])
      return
    }
    window.git.status(directory).then(setGitStatus)
  }, [directory])

  // Toggle directory expansion
  const toggleExpand = async (node: TreeNode) => {
    if (!node.isDirectory) return

    const newExpanded = new Set(expandedPaths)
    if (expandedPaths.has(node.path)) {
      newExpanded.delete(node.path)
    } else {
      newExpanded.add(node.path)
      // Load children if not already loaded
      if (!node.children) {
        const children = await loadDirectory(node.path)
        setTree((prevTree) => updateTreeNode(prevTree, node.path, { children }))
      }
    }
    setExpandedPaths(newExpanded)
  }

  // Handle file click
  const handleFileClick = (node: TreeNode) => {
    if (node.isDirectory) {
      toggleExpand(node)
    } else if (onFileSelect) {
      onFileSelect(node.path)
    }
  }

  // Update a node in the tree
  const updateTreeNode = (
    nodes: TreeNode[],
    path: string,
    updates: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.path === path) {
        return { ...node, ...updates }
      }
      if (node.children) {
        return { ...node, children: updateTreeNode(node.children, path, updates) }
      }
      return node
    })
  }

  // Get git status for a file
  const getFileStatus = (filePath: string): GitFileStatus | undefined => {
    const relativePath = directory ? filePath.replace(directory + '/', '') : filePath
    return gitStatus.find((s) => s.path === relativePath)
  }

  // Get status color
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'modified':
        return 'text-yellow-400'
      case 'added':
        return 'text-green-400'
      case 'deleted':
        return 'text-red-400'
      case 'untracked':
        return 'text-gray-400'
      default:
        return 'text-text-primary'
    }
  }

  // Render a tree node
  const renderNode = (node: TreeNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedPaths.has(node.path)
    const status = getFileStatus(node.path)
    const statusColor = getStatusColor(status?.status)

    return (
      <div key={node.path}>
        <div
          onClick={() => handleFileClick(node)}
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-bg-tertiary cursor-pointer ${statusColor}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.isDirectory ? (
            <span className="text-text-secondary w-4 text-center">
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="w-4" />
          )}
          <span className={node.isDirectory ? 'text-text-secondary' : ''}>
            {node.isDirectory ? '📁' : '📄'}
          </span>
          <span className="truncate">{node.name}</span>
          {status && (
            <span className="text-xs opacity-60 ml-auto">
              {status.status.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {node.isDirectory && isExpanded && node.children && (
          <div>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!directory) {
    return (
      <div className="h-full flex items-center justify-center text-text-secondary text-sm">
        Select a session to view files
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <span className="text-sm font-medium text-text-primary">Explorer</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-sm">
        <div className="text-text-secondary mb-2 px-2 truncate text-xs">
          {directory}
        </div>
        {tree.length === 0 ? (
          <div className="text-center text-text-secondary text-sm py-4">
            Empty directory
          </div>
        ) : (
          tree.map((node) => renderNode(node))
        )}
      </div>
    </div>
  )
}
