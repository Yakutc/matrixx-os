import { useEffect, useMemo, useRef, useState } from 'react'
import { APP_META, APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { AppIcon, Icon } from './icons'
import type { AppId } from './types'

type ActivitiesMode = 'overview' | 'apps'

const FAVORITES: AppId[] = ['terminal', 'files', 'notes', 'settings']

export function Activities({
  mode,
  onClose,
  onOpenApps,
  onOpenOverview,
}: {
  mode: ActivitiesMode
  onClose: () => void
  onOpenApps: () => void
  onOpenOverview: () => void
}) {
  const { windows, focusWindow, openWindow } = useOS()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const needle = query.trim().toLowerCase()

  useEffect(() => {
    inputRef.current?.focus()
  }, [mode])

  const filteredApps = useMemo(
    () =>
      APP_ORDER.filter((appId) => {
        const meta = APP_META[appId]
        return (
          !needle ||
          meta.title.toLowerCase().includes(needle) ||
          meta.description.toLowerCase().includes(needle)
        )
      }),
    [needle],
  )

  const filteredWindows = useMemo(
    () =>
      windows.filter((win) => {
        const title = `${APP_META[win.appId].title} ${win.title}`.toLowerCase()
        return !needle || title.includes(needle)
      }),
    [needle, windows],
  )

  const launch = (appId: AppId) => {
    openWindow(appId)
    onClose()
  }

  const focus = (id: string) => {
    focusWindow(id)
    onClose()
  }

  const firstAction = () => {
    if (filteredWindows[0]) {
      focus(filteredWindows[0].id)
      return
    }
    if (filteredApps[0]) launch(filteredApps[0])
  }

  const hasQuery = needle.length > 0

  return (
    <div
      className={mode === 'overview' ? 'overview' : 'appgrid'}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="dialog"
      aria-label={mode === 'overview' ? 'Activities overview' : 'Applications'}
    >
      <div className="overview__search">
        <Icon name="search" size={18} />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type to search…"
          aria-label="Search applications and windows"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              firstAction()
            }
            if (event.key === 'Escape') {
              event.preventDefault()
              onClose()
            }
          }}
        />
        <span className="kbd">Esc</span>
      </div>

      {mode === 'apps' ? (
        <>
          <div className="appgrid__grid">
            {filteredApps.map((appId) => {
              const meta = APP_META[appId]
              return (
                <button
                  key={appId}
                  type="button"
                  className="appgrid__item"
                  onClick={() => launch(appId)}
                  aria-label={`Open ${meta.title}`}
                >
                  <AppIcon appId={appId} className="appgrid__icon" />
                  <span>{meta.title}</span>
                </button>
              )
            })}
          </div>
          <div className="overview__footer">
            <button type="button" className="overview__pill" onClick={onOpenOverview}>
              Back to Overview
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="overview__content">
            {hasQuery ? (
              <div className="overview__results">
                {filteredWindows.map((win) => (
                  <button
                    key={win.id}
                    type="button"
                    className="result-row"
                    onClick={() => focus(win.id)}
                  >
                    <AppIcon appId={win.appId} className="result-row__icon" />
                    <span className="result-row__text">
                      <b>{win.title}</b>
                      <span>Window · {APP_META[win.appId].title}</span>
                    </span>
                  </button>
                ))}
                {filteredApps.map((appId) => (
                  <button
                    key={appId}
                    type="button"
                    className="result-row"
                    onClick={() => launch(appId)}
                  >
                    <AppIcon appId={appId} className="result-row__icon" />
                    <span className="result-row__text">
                      <b>{APP_META[appId].title}</b>
                      <span>Application · {APP_META[appId].description}</span>
                    </span>
                  </button>
                ))}
                {filteredWindows.length === 0 && filteredApps.length === 0 && (
                  <div className="overview__empty">No results for “{query.trim()}”</div>
                )}
              </div>
            ) : (
              <>
                <div className="overview__section-title">Windows</div>
                {windows.length > 0 ? (
                  <div className="overview__windows">
                    {windows.map((win) => (
                      <button
                        key={win.id}
                        type="button"
                        className="window-card"
                        onClick={() => focus(win.id)}
                      >
                        <span className="window-card__thumb">
                          <AppIcon appId={win.appId} className="window-card__icon" />
                        </span>
                        <span className="window-card__meta">
                          <AppIcon appId={win.appId} className="window-card__meta-icon" />
                          <span>{win.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="overview__empty">
                    No open windows. Press Super or click an app to start.
                  </div>
                )}

                <div className="overview__section-title" style={{ marginTop: 24 }}>
                  Favorites
                </div>
                <div className="overview__windows overview__windows--favorites">
                  {FAVORITES.map((appId) => (
                    <button
                      key={appId}
                      type="button"
                      className="result-row overview__favorite"
                      onClick={() => launch(appId)}
                    >
                      <AppIcon appId={appId} className="result-row__icon" />
                      <span className="result-row__text">
                        <b>{APP_META[appId].title}</b>
                        <span>{APP_META[appId].description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="overview__footer">
            <button type="button" className="overview__pill" onClick={onOpenApps}>
              <Icon name="grid" size={15} /> Show Applications
            </button>
          </div>

          <div className="overview__workspaces">
            <div className="workspace-chip is-active">Workspace 1</div>
            <div className="workspace-chip">{windows.length} windows</div>
          </div>
        </>
      )}
    </div>
  )
}
