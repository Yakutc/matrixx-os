import { useState } from 'react'
import { useOS } from './OSProvider'
import { Icon } from './icons'

export function DesktopIcons() {
  const { openWindow, notify } = useOS()
  const [selected, setSelected] = useState<'home' | 'trash' | null>(null)
  const coarse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const openHome = () => {
    openWindow('files', { payload: { path: '/home/operator' } })
    setSelected(null)
  }

  const openTrash = () => {
    notify('Trash is empty', 'info')
    setSelected(null)
  }

  const activate = (kind: 'home' | 'trash') => {
    if (kind === 'home') openHome()
    else openTrash()
  }

  return (
    <div className="desktop-icons">
      <button
        type="button"
        className={`desktop-icon ${selected === 'home' ? 'is-selected' : ''}`}
        onClick={() => {
          if (coarse) {
            openHome()
            return
          }
          setSelected('home')
        }}
        onDoubleClick={openHome}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openHome()
          }
        }}
        aria-label="Open Home folder"
      >
        <span className="desktop-icon__art" data-kind="home">
          <Icon name="home" size={26} />
        </span>
        <span>Home</span>
      </button>

      <button
        type="button"
        className={`desktop-icon ${selected === 'trash' ? 'is-selected' : ''}`}
        onClick={() => {
          if (coarse) {
            openTrash()
            return
          }
          setSelected('trash')
        }}
        onDoubleClick={openTrash}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            activate('trash')
          }
        }}
        aria-label="Open Trash"
      >
        <span className="desktop-icon__art" data-kind="trash">
          <Icon name="trash" size={26} />
        </span>
        <span>Trash</span>
      </button>
    </div>
  )
}
