import { APP_META } from './apps'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import { shortDate, timeParts, useClock, weekday } from './useClock'

export function TopBar({
  activitiesOpen,
  quickOpen,
  onToggleActivities,
  onToggleQuick,
}: {
  activitiesOpen: boolean
  quickOpen: boolean
  onToggleActivities: () => void
  onToggleQuick: () => void
}) {
  const { windows, activeId } = useOS()
  const now = useClock()
  const { hours, minutes } = timeParts(now)
  const active = windows.find((win) => win.id === activeId && !win.minimized)
  const title = active ? APP_META[active.appId].title : 'Desktop'

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className={`activities-btn ${activitiesOpen ? 'is-open' : ''}`}
          onClick={onToggleActivities}
          aria-expanded={activitiesOpen}
        >
          Activities
        </button>
        <span className="topbar__app">{title}</span>
      </div>

      <button
        type="button"
        className="topbar__clock"
        onClick={onToggleActivities}
        aria-label="Open activities and calendar"
      >
        <b className="clock-date">
          {weekday(now)} {shortDate(now)}
        </b>
        <span className="clock-time">
          &nbsp;{hours}:{minutes}
        </span>
      </button>

      <div className="topbar__status">
        <button
          type="button"
          className={`status-btn ${quickOpen ? 'is-open' : ''}`}
          onClick={onToggleQuick}
          aria-expanded={quickOpen}
          aria-label="System menu"
        >
          <Icon name="wifi" size={15} />
          <span className="status-bar" aria-hidden="true">
            <span style={{ height: 4 }} />
            <span style={{ height: 7 }} />
            <span style={{ height: 10 }} />
            <span style={{ height: 12 }} />
          </span>
          <span className="status-battery" aria-hidden="true" />
          <Icon name="chevron" size={12} />
        </button>
      </div>
    </header>
  )
}
