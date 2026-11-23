import { APP_META } from './apps'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import { shortDate, timeParts, useClock } from './useClock'
import type { WindowState } from './types'

export function Taskbar({
  startOpen,
  onToggleStart,
}: {
  startOpen: boolean
  onToggleStart: () => void
}) {
  const {
    windows,
    activeId,
    focusWindow,
    minimizeWindow,
    closeWindow,
    settings,
    setSettings,
  } = useOS()
  const now = useClock()
  const { hours, minutes } = timeParts(now)

  const activate = (win: WindowState) => {
    if (win.id === activeId && !win.minimized) {
      minimizeWindow(win.id)
      return
    }
    focusWindow(win.id)
  }

  return (
    <div className="taskbar">
      <button
        type="button"
        className={`start-btn ${startOpen ? 'is-open' : ''}`}
        onClick={onToggleStart}
        aria-expanded={startOpen}
        aria-haspopup="menu"
        aria-label="Открыть главное меню"
      >
        <span className="start-btn__logo">
          <Icon name="logo" size={15} />
        </span>
        <span>MATRIXX</span>
      </button>

      <div className="tasks" role="list" aria-label="Открытые окна">
        {windows.map((win) => (
          <button
            key={win.id}
            type="button"
            role="listitem"
            className={`task-chip ${win.id === activeId && !win.minimized ? 'is-active' : ''}`}
            onClick={() => activate(win)}
            onAuxClick={(event) => {
              if (event.button === 1) {
                event.preventDefault()
                closeWindow(win.id)
              }
            }}
            title={`${APP_META[win.appId].title} — ${win.title}`}
          >
            <span className="task-chip__index">{APP_META[win.appId].index}</span>
            <span>{win.title}</span>
          </button>
        ))}
      </div>

      <div className="taskbar__right">
        <div className="tray-status tray-status--net">
          <span className="led" />
          СЕТЬ
        </div>
        <div className="tray-status tray-status--power">
          <span className="led led--accent" />
          ПИТАНИЕ
        </div>
        <button
          type="button"
          className={`tray-btn ${settings.sound ? '' : 'is-off'}`}
          aria-label={settings.sound ? 'Выключить звук' : 'Включить звук'}
          title={settings.sound ? 'Звук включён' : 'Звук выключен'}
          onClick={() => setSettings({ sound: !settings.sound })}
        >
          <Icon name={settings.sound ? 'sound' : 'mute'} size={16} />
        </button>
        <button
          type="button"
          className={`tray-btn ${settings.crt ? '' : 'is-off'}`}
          aria-label={settings.crt ? 'Выключить CRT-эффекты' : 'Включить CRT-эффекты'}
          title="CRT-эффекты"
          onClick={() => setSettings({ crt: !settings.crt })}
        >
          <Icon name="crt" size={16} />
        </button>
        <div className="tray-clock" aria-label={`${hours}:${minutes}, ${shortDate(now)}`}>
          <b>
            {hours}:{minutes}
          </b>
          <span>{shortDate(now)}</span>
        </div>
      </div>
    </div>
  )
}
