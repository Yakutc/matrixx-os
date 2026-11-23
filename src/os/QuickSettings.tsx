import { useState } from 'react'
import { useOS } from './OSProvider'
import { Icon } from './icons'

export function QuickSettings({
  onClose,
  onOpenSettings,
}: {
  onClose: () => void
  onOpenSettings: () => void
}) {
  const { settings, setSettings, lock, reboot, shutdown, notify } = useOS()
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(false)
  const [dnd, setDnd] = useState(false)
  const [powerMenu, setPowerMenu] = useState(false)

  return (
    <>
      <div className="popover-backdrop" onPointerDown={onClose} role="presentation" />
      <div className="quick" role="dialog" aria-label="System menu">
        <div className="quick__user">
          <span className="quick__avatar">O</span>
          <span className="quick__name">
            <b>operator</b>
            <span>Matrixx Linux 24.04 LTS</span>
          </span>
        </div>

        <div className="quick__grid">
          <button
            type="button"
            className={`quick__toggle ${wifi ? 'is-on' : ''}`}
            aria-pressed={wifi}
            onClick={() => setWifi((value) => !value)}
          >
            <Icon name="wifi" size={16} />
            Wi-Fi
          </button>
          <button
            type="button"
            className={`quick__toggle ${bluetooth ? 'is-on' : ''}`}
            aria-pressed={bluetooth}
            onClick={() => setBluetooth((value) => !value)}
          >
            <Icon name="bluetooth" size={16} />
            Bluetooth
          </button>
          <button
            type="button"
            className={`quick__toggle ${settings.nightLight ? 'is-on' : ''}`}
            aria-pressed={settings.nightLight}
            onClick={() => setSettings({ nightLight: !settings.nightLight })}
          >
            <Icon name="moon" size={16} />
            Night Light
          </button>
          <button
            type="button"
            className={`quick__toggle ${dnd ? 'is-on' : ''}`}
            aria-pressed={dnd}
            onClick={() => {
              setDnd((value) => !value)
              notify(dnd ? 'Notifications enabled' : 'Do Not Disturb enabled', 'info')
            }}
          >
            <Icon name="mute" size={16} />
            Do Not Disturb
          </button>
        </div>

        <div className="quick__slider">
          <div className="quick__slider-head">
            <span>Volume</span>
            <span>{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(settings.volume * 100)}
            aria-label="Volume"
            onChange={(event) => setSettings({ volume: Number(event.target.value) / 100 })}
          />
        </div>

        <div className="quick__footer">
          <button
            type="button"
            className="quick__icon-btn"
            aria-label="Lock screen"
            title="Lock"
            onClick={() => {
              lock()
              onClose()
            }}
          >
            <Icon name="lock" size={16} />
          </button>
          <button
            type="button"
            className="quick__icon-btn"
            aria-label="Settings"
            title="Settings"
            onClick={() => {
              onOpenSettings()
              onClose()
            }}
          >
            <Icon name="settings" size={16} />
          </button>
          <button
            type="button"
            className="quick__icon-btn quick__icon-btn--power"
            aria-label="Power menu"
            title="Power"
            onClick={() => setPowerMenu((value) => !value)}
          >
            <Icon name="power" size={16} />
          </button>
        </div>

        {powerMenu && (
          <div className="quick__power">
            <button
              type="button"
              onClick={() => {
                shutdown()
                onClose()
              }}
            >
              Power Off
            </button>
            <button
              type="button"
              onClick={() => {
                reboot()
                onClose()
              }}
            >
              Restart
            </button>
            <button type="button" onClick={() => setPowerMenu(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  )
}
