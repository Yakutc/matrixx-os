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
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => {
          onSelect(path)
          if (isDir) onToggle(path)
        }}
        aria-expanded={isDir ? isOpen : undefined}
      >
        <span className="files__chevron">
          {isDir ? <Icon name="chevron" size={11} /> : ''}
        </span>
        <Icon name={isDir ? 'folder' : 'file'} size={13} />
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

export default function FilesApp(_props: AppProps) {
  const { openWindow } = useOS()
  const [selectedPath, setSelectedPath] = useState('/README.txt')
  const [showHidden, setShowHidden] = useState(false)
  const [expanded, setExpanded] = useState(
    () => new Set(['/home', '/home/operator', '/sys', '/объект-09']),
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
      selectedNode.type === 'dir' ? `ls ${selectedPath}` : `cat ${selectedPath}`
    openWindow('terminal', { payload: { command } })
  }

  const directoryChildren =
    selectedNode?.type === 'dir'
      ? (selectedNode as FsDir).children.filter((child) => showHidden || !child.hidden)
      : []

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
          title="Показывать скрытые файлы"
        >
          <Icon name="eye" size={13} />
          СКРЫТЫЕ
        </button>
        <button
          type="button"
          className="btn files__terminal-btn"
          onClick={openTerminal}
          disabled={!selectedNode}
        >
          <Icon name="terminal" size={13} />
          В ТЕРМИНАЛ
        </button>
      </div>

      <div className="files__layout">
        <div className="files__tree">
          <div className="files__disk">
            <span className="led" />
            MATRIXX DISK 0
          </div>
          <button
            type="button"
            className={`files__node files__node--root ${
              selectedPath === '/' ? 'is-selected' : ''
            }`}
            onClick={() => setSelectedPath('/')}
          >
            <span className="files__chevron" />
            <Icon name="folder" size={13} />
            <span className="files__name">КОРЕНЬ</span>
          </button>
          {listDir('/', showHidden).map((child) => {
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
              <Icon name="folder" size={30} />
              <b>КОРНЕВОЙ КАТАЛОГ</b>
              <span>Выберите файл слева</span>
            </div>
          )}
          {selectedNode?.type === 'file' && (
            <>
              <div className="files__filehead">
                <div>
                  <div className="files__filename">
                    <Icon name="file" size={14} /> {selectedNode.name}
                  </div>
                  <div className="files__filemeta">
                    <span>ВЛАДЕЛЕЦ: {selectedNode.owner}</span>
                    <span>{formatBytes(selectedNode.content)}</span>
                    <span>{selectedNode.updated}</span>
                  </div>
                </div>
                <span className="files__readonly">ТОЛЬКО ДЛЯ ЧТЕНИЯ</span>
              </div>
              <pre className="files__content">{selectedNode.content}</pre>
            </>
          )}
          {selectedNode?.type === 'dir' && (
            <>
              <div className="files__filehead">
                <div className="files__filename">
                  <Icon name="folder" size={14} /> {selectedNode.name || 'КОРЕНЬ'}
                </div>
                <span className="files__readonly">КАТАЛОГ · {directoryChildren.length}</span>
              </div>
              <div className="files__dirlist">
                {directoryChildren.map((child) => (
                  <button
                    key={child.name}
                    type="button"
                    className="files__diritem"
                    onClick={() => setSelectedPath(normalizePath(selectedPath, child.name))}
                  >
                    <Icon name={child.type === 'dir' ? 'folder' : 'file'} size={13} />
                    <span>{child.name}</span>
                    <span>{child.type === 'dir' ? 'КАТАЛОГ' : formatBytes(child.content)}</span>
                  </button>
                ))}
                {directoryChildren.length === 0 && (
                  <div className="files__empty files__empty--small">КАТАЛОГ ПУСТ</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="files__status">
        <span>{selectedPath}</span>
        <span>640 КБ / 640 КБ · ЗАПИСЬ ЗАБЛОКИРОВАНА</span>
      </div>
    </div>
  )
}
