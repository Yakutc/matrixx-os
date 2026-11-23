import { APP_META, APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { AppIcon, Icon } from './icons'
import type { AppId } from './types'

const OPTIONAL_APPS = new Set<AppId>(['notes', 'system', 'snake', 'about'])

export function Dock({ onOpenApps, onNavigate }: { onOpenApps: () => void; onNavigate?: () => void }) {
  const { windows, activeId, openWindow, focusWindow, minimizeWindow } = useOS()

  const activate = (appId: AppId) => {
    onNavigate?.()
    const appWindows = windows.filter((win) => win.appId === appId)
    const existing = appWindows[appWindows.length - 1]
    if (!existing) {
      openWindow(appId)
      return
    }
    if (existing.id === activeId && !existing.minimized) {
      minimizeWindow(existing.id)
      return
    }
    focusWindow(existing.id)
  }

  return (
    <nav className="dock" aria-label="Favorites">
      {APP_ORDER.map((appId) => {
        const meta = APP_META[appId]
        const appWindows = windows.filter((win) => win.appId === appId)
        const running = appWindows.length > 0
        const focused = appWindows.some((win) => win.id === activeId && !win.minimized)
        return (
          <button
            key={appId}
            type="button"
            className={`dock__app ${OPTIONAL_APPS.has(appId) ? 'dock__app--optional' : ''}`}
            title={meta.title}
            aria-label={`${meta.title}${running ? ' (running)' : ''}`}
            onClick={() => activate(appId)}
          >
            <AppIcon appId={appId} className="dock__icon" />
            {running && (
              <span className={`dock__indicator ${focused ? 'is-focused' : ''}`} />
            )}
          </button>
        )
      })}
      <span className="dock__separator" />
      <button
        type="button"
        className="dock__grid"
        title="Show Applications"
        aria-label="Show Applications"
        onClick={onOpenApps}
      >
        <Icon name="grid" size={20} />
      </button>
    </nav>
  )
}
