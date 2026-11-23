import { useOS } from './OSProvider'
import { Icon } from './icons'

export function ContextMenu({
  x,
  y,
  onClose,
}: {
  x: number
  y: number
  onClose: () => void
}) {
  const { openWindow, notify } = useOS()
  const left = Math.min(x, window.innerWidth - 260)
  const top = Math.min(y, window.innerHeight - 220)

  const run = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <>
      <div className="context-backdrop" onPointerDown={onClose} role="presentation" />
      <div className="context-menu" style={{ left, top }} role="menu" aria-label="Desktop menu">
        <div className="context-menu__head">Desktop</div>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(() => openWindow('settings', { payload: { section: 'appearance' } }))}
        >
          <Icon name="settings" size={15} />
          Change Background…
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() =>
            run(() => notify('Display settings are managed by the system', 'info'))
          }
        >
          <Icon name="crt" size={15} />
          Display Settings
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(() => openWindow('settings'))}
        >
          <Icon name="settings" size={15} />
          Settings
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => run(() => openWindow('about'))}
        >
          <Icon name="about" size={15} />
          About Matrixx Linux
        </button>
      </div>
    </>
  )
}
