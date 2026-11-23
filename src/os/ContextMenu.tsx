import { useOS } from './OSProvider'
import { Icon } from './icons'
import type { WallpaperId } from './types'

const WALLPAPERS: WallpaperId[] = ['grid', 'signal', 'orbit']

export function ContextMenu({
  x,
  y,
  onClose,
}: {
  x: number
  y: number
  onClose: () => void
}) {
  const { openWindow, settings, setSettings, reboot } = useOS()
  const left = Math.min(x, window.innerWidth - 244)
  const top = Math.min(y, window.innerHeight - 230)

  const run = (action: () => void) => {
    action()
    onClose()
  }

  const cycleWallpaper = () => {
    const index = WALLPAPERS.indexOf(settings.wallpaper)
    setSettings({ wallpaper: WALLPAPERS[(index + 1) % WALLPAPERS.length] })
  }

  return (
    <>
      <div className="menu-backdrop" onPointerDown={onClose} role="presentation" />
      <div className="ctx-menu" style={{ left, top }} role="menu" aria-label="Меню рабочего стола">
        <div className="ctx-menu__head">РАБОЧИЙ СТОЛ / 04</div>
        <button type="button" role="menuitem" onClick={() => run(() => openWindow('terminal'))}>
          <Icon name="terminal" size={14} />
          ОТКРЫТЬ ТЕРМИНАЛ
          <span>01</span>
        </button>
        <button type="button" role="menuitem" onClick={() => run(() => openWindow('files'))}>
          <Icon name="files" size={14} />
          ОТКРЫТЬ АРХИВ
          <span>02</span>
        </button>
        <button type="button" role="menuitem" onClick={() => run(cycleWallpaper)}>
          <Icon name="crt" size={14} />
          СМЕНИТЬ ОБОИ
        </button>
        <button type="button" role="menuitem" onClick={() => run(() => openWindow('about'))}>
          <Icon name="about" size={14} />
          О СИСТЕМЕ
          <span>08</span>
        </button>
        <button type="button" role="menuitem" onClick={() => run(reboot)}>
          <Icon name="reboot" size={14} />
          ПЕРЕЗАГРУЗИТЬ
        </button>
      </div>
    </>
  )
}
