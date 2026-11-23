import { useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import type { AppProps, ThemeId, WallpaperId } from '../../os/types'

const THEMES: { id: ThemeId; name: string }[] = [
  { id: 'phosphor', name: 'ФОСФОР' },
  { id: 'amber', name: 'ЯНТАРЬ' },
  { id: 'bone', name: 'КОСТЬ' },
]

const WALLPAPERS: { id: WallpaperId; name: string }[] = [
  { id: 'grid', name: 'СЕТКА' },
  { id: 'signal', name: 'СИГНАЛ' },
  { id: 'orbit', name: 'ОРБИТА' },
]

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      className={`settings__toggle ${value ? 'is-on' : ''}`}
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
    >
      <span className="settings__led" />
      <span className="settings__toggle-text">
        <b>{label}</b>
        <span>{hint}</span>
      </span>
      <span className="settings__toggle-state">{value ? 'ВКЛ' : 'ВЫКЛ'}</span>
    </button>
  )
}

export default function SettingsApp(_props: AppProps) {
  const { settings, setSettings, resetSystem, reboot, playSound } = useOS()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="settings">
      <div className="settings__head">
        <div>
          <div className="settings__kicker">КОНФИГУРАЦИЯ / ОПЕРАТОР 09</div>
          <div className="settings__title">CFG / 04</div>
        </div>
        <div className="settings__build">BUILD 0.9.7<br />RECOVERY</div>
      </div>

      <div className="settings__scroll">
        <section className="settings__section">
          <div className="settings__section-head">
            <span>01</span>
            <div>
              <b>ВНЕШНИЙ ВИД</b>
              <span>темы, обои, эффекты экрана</span>
            </div>
          </div>

          <div className="settings__label">ТЕМА КОНТУРА</div>
          <div className="settings__themes">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`settings__theme ${settings.theme === theme.id ? 'is-active' : ''}`}
                onClick={() => setSettings({ theme: theme.id })}
                aria-pressed={settings.theme === theme.id}
              >
                <span className={`settings__swatch settings__swatch--${theme.id}`} />
                <span>{theme.name}</span>
                <span className="settings__check">
                  {settings.theme === theme.id ? <Icon name="check" size={12} /> : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="settings__label">ФОН РАБОЧЕГО СТОЛА</div>
          <div className="settings__wallpapers">
            {WALLPAPERS.map((wallpaper) => (
              <button
                key={wallpaper.id}
                type="button"
                className={`settings__wallpaper ${
                  settings.wallpaper === wallpaper.id ? 'is-active' : ''
                }`}
                data-preview={wallpaper.id}
                onClick={() => setSettings({ wallpaper: wallpaper.id })}
                aria-pressed={settings.wallpaper === wallpaper.id}
              >
                <span className="settings__wallpaper-preview" />
                <span>{wallpaper.name}</span>
              </button>
            ))}
          </div>

          <Toggle
            label="CRT-ЭФФЕКТЫ"
            hint="сканлайны, зерно, виньетка"
            value={settings.crt}
            onChange={(crt) => setSettings({ crt })}
          />
          <Toggle
            label="УМЕНЬШИТЬ ДВИЖЕНИЕ"
            hint="отключить анимации и печать"
            value={settings.reduceMotion}
            onChange={(reduceMotion) => setSettings({ reduceMotion })}
          />
        </section>

        <section className="settings__section">
          <div className="settings__section-head">
            <span>02</span>
            <div>
              <b>ЗВУК</b>
              <span>интерфейс и генератор сигнала</span>
            </div>
          </div>

          <Toggle
            label="ЗВУК ИНТЕРФЕЙСА"
            hint="клики, окна, загрузка"
            value={settings.sound}
            onChange={(sound) => setSettings({ sound })}
          />

          <div className="settings__volume">
            <div className="settings__volume-head">
              <span>ГРОМКОСТЬ</span>
              <b>{Math.round(settings.volume * 100)}%</b>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.volume * 100)}
              onChange={(event) => setSettings({ volume: Number(event.target.value) / 100 })}
              aria-label="Громкость интерфейса"
            />
            <div className="settings__volume-marks">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <button
            type="button"
            className="btn settings__test"
            onClick={() => playSound('chime')}
            disabled={!settings.sound}
          >
            <Icon name="wave" size={14} />
            ПРОСЛУШАТЬ
          </button>
        </section>

        <section className="settings__section">
          <div className="settings__section-head">
            <span>03</span>
            <div>
              <b>СИСТЕМА</b>
              <span>сборка, загрузка, сброс</span>
            </div>
          </div>

          <div className="settings__info">
            <div><span>СБОРКА</span><b>MATRIXX OS 0.9.7 / recovery</b></div>
            <div><span>ЯДРО</span><b>matrixx-0.9.7</b></div>
            <div><span>ОБОЛОЧКА</span><b>msh 0.9 / wm-04</b></div>
            <div><span>СЕКТОР</span><b>4 · терминал 04</b></div>
          </div>

          <Toggle
            label="ПРОПУСКАТЬ BIOS"
            hint="вход в систему останется"
            value={settings.skipBoot}
            onChange={(skipBoot) => setSettings({ skipBoot })}
          />

          <div className="settings__actions">
            <button type="button" className="btn" onClick={reboot}>
              <Icon name="reboot" size={13} />
              ПЕРЕЗАГРУЗИТЬ
            </button>
            <button
              type="button"
              className={`btn ${confirmReset ? 'btn--danger' : ''}`}
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true)
                  return
                }
                resetSystem()
              }}
            >
              <Icon name="warning" size={13} />
              {confirmReset ? 'ПОДТВЕРДИТЬ СБРОС' : 'СБРОСИТЬ СИСТЕМУ'}
            </button>
          </div>
          {confirmReset && (
            <div className="settings__warn">
              будут удалены настройки, журнал, рекорд и открытые окна. нажмите ещё раз.
            </div>
          )}
        </section>

        <section className="settings__section">
          <div className="settings__section-head">
            <span>04</span>
            <div>
              <b>О СИСТЕМЕ</b>
              <span>НИИ-9 · сектор 4</span>
            </div>
          </div>
          <p className="settings__lore">
            MATRIXX — восстановленный контур терминала 04. Система пережила отключение питания
            и помнит сеанс, которого не было в журнале. Не отключайте резервный контур.
          </p>
          <div className="settings__credits">
            <span>СОБРАНО В НИИ-9 · 1997—2026</span>
            <a href="https://github.com/Yakutc/matrixx-os" target="_blank" rel="noopener noreferrer">
              ИСХОДНЫЙ КОД →
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
