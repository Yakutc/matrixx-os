import { useState } from 'react'
import { APP_META, APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import type { AppId } from './types'

export function DesktopIcons() {
  const { openWindow } = useOS()
  const [selected, setSelected] = useState<AppId | null>(null)
  const coarse =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const launch = (appId: AppId) => {
    openWindow(appId)
    setSelected(null)
  }

  return (
    <div className="icon-grid">
      <div className="icon-grid__head">МОДУЛИ / 08</div>
      <div className="icon-grid__cells">
        {APP_ORDER.map((appId) => {
          const meta = APP_META[appId]
          return (
            <button
              key={appId}
              type="button"
              className={`icon-tile ${selected === appId ? 'is-selected' : ''}`}
              aria-label={`Открыть ${meta.title}`}
              onClick={() => {
                if (coarse) {
                  launch(appId)
                  return
                }
                setSelected(appId)
              }}
              onDoubleClick={() => launch(appId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  launch(appId)
                }
              }}
            >
              <span className="icon-tile__glyph">
                <Icon name={appId} size={20} />
              </span>
              <span className="icon-tile__label">{meta.title}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
