import { useMemo, useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import type { AppProps } from '../../os/types'
import {
  formatBytes,
  listDir,
  normalizePath,
  resolveNode,
  type FsDir,
  type FsNode,
} from '../../data/filesystem'

interface TreeProps {
  path: string
  node: FsNode
  depth: number
  expanded: Set<string>
  selected: string
  showHidden: boolean
  onSelect: (path: string) => void
  onToggle: (path: string) => void
}

function TreeNode({
  path,
  node,
  depth,
  expanded,
  selected,
  showHidden,
  onSelect,
  onToggle,
}: TreeProps) {
  const isOpen = expanded.has(path)
  const isDir = node.type === 'dir'
  return (
    <div>
      <button
        type="button"
        className={`files__node ${selected === path ? 'is-selected' : ''}`}
        style={{ paddingLeft: 10 + depth * 14 }}
        onClick={() => {
          onSelect(path)
          if (isDir) onToggle(path)
        }}
        aria-expanded={isDir ? isOpen : undefined}
      >
        <span className="files__chevron">
          {isDir ? <Icon name="chevron" size={11} /> : ''}
        </span>
        <Icon name={isDir ? 'folder' : 'file'} size={14} />
        <span className="files__name">{node.name}</span>
        {isDir && <span className="files__count">{node.children.length}</span>}
      </button>
      {isDir && isOpen && (
        <div>
          {listDir(path, showHidden).map((child) => {
            const childPath = normalizePath(path, child.name)
            return (
              <TreeNode
                key={childPath}
                path={childPath}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                selected={selected}
                showHidden={showHidden}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

const PLACES = [
  { label: 'Home', path: '/home/operator', icon: 'home' as const },
  { label: 'Documents', path: '/home/operator/Documents', icon: 'folder' as const },
  { label: 'Downloads', path: '/home/operator/Downloads', icon: 'folder' as const },
  { label: 'Pictures', path: '/home/operator/Pictures', icon: 'folder' as const },
  { label: 'Sector 09', path: '/opt/sector-09', icon: 'folder' as const },
]

export default function FilesApp({ payload }: AppProps) {
  const { openWindow, notify } = useOS()
  const initialPath =
    (payload as { path?: unknown } | undefined)?.path &&
    typeof (payload as { path?: unknown }).path === 'string'
      ? (payload as { path: string }).path
      : '/home/operator'
  const [selectedPath, setSelectedPath] = useState(initialPath)
  const [showHidden, setShowHidden] = useState(false)
  const [expanded, setExpanded] = useState(
    () => new Set(['/home', '/home/operator', '/var', '/var/log', '/opt']),
  )

  const selectedNode = useMemo(() => {
    if (selectedPath === '/') return null
    return resolveNode(selectedPath)
  }, [selectedPath])

  const toggle = (path: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const openTerminal = () => {
    if (!selectedNode) return
    const command =
      selectedNode.type === 'dir'
        ? `ls -la "${selectedPath}"`
        : `cat "${selectedPath}"`
    openWindow('terminal', { payload: { command } })
  }

  const directoryChildren =
    selectedNode?.type === 'dir'
      ? (selectedNode as FsDir).children.filter((child) => showHidden || !child.hidden)
      : []

  const selectPlace = (path: string) => {
    setSelectedPath(path)
    setExpanded((current) => {
      const next = new Set(current)
      const parts = path.split('/').filter(Boolean)
      let built = ''
      for (const part of parts) {
        built += `/${part}`
        next.add(built)
      }
      return next
    })
  }

  return (
    <div className="files">
      <div className="files__toolbar">
        <div className="files__path" title={selectedPath}>
          <span className="files__path-root">/</span>
          {selectedPath.split('/').filter(Boolean).map((part, index, all) => (
            <span key={`${part}-${index}`} className="files__crumb">
              {part}
              {index < all.length - 1 ? <span className="files__sep">/</span> : null}
            </span>
          ))}
        </div>
        <button
          type="button"
          className={`files__hidden ${showHidden ? 'is-on' : ''}`}
          onClick={() => setShowHidden((value) => !value)}
          aria-pressed={showHidden}
          title="Show hidden files"
        >
          <Icon name="eye" size={14} />
          Hidden
        </button>
        <button
          type="button"
          className="btn files__terminal-btn"
          onClick={openTerminal}
          disabled={!selectedNode}
          title="Open in Terminal"
        >
          <Icon name="terminal" size={14} />
          Terminal
        </button>
      </div>

      <div className="files__layout">
        <div className="files__tree">
          <div className="files__places">
            <div className="files__places-title">Places</div>
            {PLACES.map((place) => (
              <button
                key={place.label}
                type="button"
                className={`files__place ${selectedPath === place.path ? 'is-selected' : ''}`}
                onClick={() => selectPlace(place.path)}
              >
                <Icon name={place.icon} size={15} />
                {place.label}
              </button>
            ))}
            <button
              type="button"
              className="files__place"
              onClick={() => notify('Trash is empty', 'info')}
            >
              <Icon name="trash" size={15} />
              Trash
            </button>
          </div>

          <div className="files__places-title files__places-title--system">File System</div>
          <button
            type="button"
            className={`files__node files__node--root ${
              selectedPath === '/' ? 'is-selected' : ''
            }`}
            onClick={() => setSelectedPath('/')}
          >
            <span className="files__chevron" />
            <Icon name="folder" size={14} />
            <span className="files__name">Root</span>
          </button>
          {listDir('/', true).map((child) => {
            const path = normalizePath('/', child.name)
            return (
              <TreeNode
                key={path}
                path={path}
                node={child}
                depth={0}
                expanded={expanded}
                selected={selectedPath}
                showHidden={showHidden}
                onSelect={setSelectedPath}
                onToggle={toggle}
              />
            )
          })}
        </div>

        <div className="files__preview">
          {!selectedNode && (
            <div className="files__empty">
              <Icon name="folder" size={34} />
              <b>File System</b>
              <span>Select a file on the left</span>
            </div>
          )}
          {selectedNode?.type === 'file' && (
            <>
              <div className="files__filehead">
                <div>
                  <div className="files__filename">
                    <Icon name="file" size={15} /> {selectedNode.name}
                  </div>
                  <div className="files__filemeta">
                    <span>Owner: {selectedNode.owner}</span>
                    <span>{formatBytes(selectedNode.content)}</span>
                    <span>{selectedNode.updated}</span>
                  </div>
                </div>
                <span className="files__readonly">Read only</span>
              </div>
              <pre className="files__content">{selectedNode.content}</pre>
            </>
          )}
          {selectedNode?.type === 'dir' && (
            <>
              <div className="files__filehead">
                <div className="files__filename">
                  <Icon name="folder" size={15} /> {selectedNode.name || 'Root'}
                </div>
                <span className="files__readonly">
                  {directoryChildren.length} items
                </span>
              </div>
              <div className="files__dirlist">
                {directoryChildren.map((child) => (
                  <button
                    key={child.name}
                    type="button"
                    className={`files__diritem ${child.hidden ? 'is-hidden' : ''}`}
                    onClick={() => setSelectedPath(normalizePath(selectedPath, child.name))}
                  >
                    <Icon name={child.type === 'dir' ? 'folder' : 'file'} size={14} />
                    <span>{child.name}</span>
                    <span>
                      {child.type === 'dir' ? 'Folder' : formatBytes(child.content)}
                    </span>
                  </button>
                ))}
                {directoryChildren.length === 0 && (
                  <div className="files__empty files__empty--small">Folder is empty</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="files__status">
        <span>{selectedPath}</span>
        <span>640 KB / 640 KB · Read-only volume</span>
      </div>
    </div>
  )
}
