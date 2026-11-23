import { useState } from 'react'
import { APP_META, APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import { longDate, useClock } from './useClock'

export function StartMenu({ onClose }: { onClose: () => void }) {
  const { openWindow, windows, lock, reboot, shutdown } = useOS()
  const [confirmShutdown, setConfirmShutdown] = useState(false)
  const now = useClock()
  const openWindows = new Set(windows.map((win) => win.appId))

  const launch = (appId: (typeof APP_ORDER)[number]) => {
    openWindow(appId)
    onClose()
  }

  return (
    <>
      <div className="menu-backdrop" onPointerDown={onClose} role="presentation" />
      <div className="start" role="menu" aria-label="Главное меню">
        <div className="start__head">
          <div>
            <div className="start__meta">ЗАПУСК / ИНДЕКС</div>
            <div className="start__title">MATRIXX OS</div>
          </div>
          <div className="start__meta">
            {longDate(now)}
            <br />
            СБОРКА 0.9.7
          </div>
        </div>

        <div className="start__list">
          {APP_ORDER.map((appId, index) => {
            const meta = APP_META[appId]
            return (
              <button
                key={appId}
                type="button"
                className="start-item"
                role="menuitem"
                autoFocus={index === 0}
                onClick={() => launch(appId)}
              >
                <span className="start-item__index">{meta.index}</span>
                <span className="start-item__icon">
                  <Icon name={appId} size={16} />
                </span>
                <span className="start-item__text">
                  <b>{meta.title}</b>
                  <span>{meta.description}</span>
                </span>
                <span className="start-item__arrow">
                  {openWindows.has(appId) ? 'ОТКРЫТО' : '→'}
                </span>
              </button>
            )
          })}
        </div>

        <div className="start__foot">
          <button type="button" onClick={() => { lock(); onClose() }}>
            <Icon name="lock" size={13} />
            ЗАБЛОКИРОВАТЬ
          </button>
          <button type="button" onClick={() => { reboot(); onClose() }}>
            <Icon name="reboot" size={13} />
            ПЕРЕЗАГРУЗИТЬ
          </button>
          <button
            type="button"
            className={confirmShutdown ? 'danger' : ''}
            onClick={() => {
              if (!confirmShutdown) {
                setConfirmShutdown(true)
                return
              }
              shutdown()
              onClose()
            }}
          >
            <Icon name="power" size={13} />
            {confirmShutdown ? 'ПОДТВЕРДИТЬ' : 'ВЫКЛЮЧИТЬ'}
          </button>
          <div className="start__signature">
            <span>оператор@matrixx · терминал 04</span>
            <span>CTRL+K — КОМАНДЫ</span>
          </div>
        </div>
      </div>
    </>
  )
}
