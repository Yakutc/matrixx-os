import { useEffect, useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import type { AppProps, ThemeId, WallpaperId } from '../../os/types'

type Section = 'appearance' | 'sound' | 'system' | 'about'

const SECTIONS: { id: Section; label: string; icon: 'settings' | 'sound' | 'system' | 'about' }[] = [
  { id: 'appearance', label: 'Appearance', icon: 'settings' },
  { id: 'sound', label: 'Sound', icon: 'sound' },
  { id: 'system', label: 'System', icon: 'system' },
  { id: 'about', label: 'About', icon: 'about' },
]

const THEMES: { id: ThemeId; name: string; detail: string }[] = [
  { id: 'dark', name: 'Dark', detail: 'Yaru Dark' },
  { id: 'light', name: 'Light', detail: 'Yaru' },
  { id: 'hc', name: 'High Contrast', detail: 'Accessible' },
]

const WALLPAPERS: { id: WallpaperId; name: string }[] = [
  { id: 'noble', name: 'Noble' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'sunset', name: 'Sunset' },
]

function Toggle({
  label,
  detail,
  value,
  onChange,
}: {
  label: string
  detail: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      className="gnome-row gnome-row--toggle"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
    >
      <span className="gnome-row__text">
        <b>{label}</b>
        <span>{detail}</span>
      </span>
      <span className={`switch ${value ? 'is-on' : ''}`} />
    </button>
  )
}

export default function SettingsApp({ payload }: AppProps) {
  const { settings, setSettings, resetSystem, reboot, lock, playSound, notify } = useOS()
  const initialSection =
    (payload as { section?: unknown } | undefined)?.section
  const [section, setSection] = useState<Section>(
    initialSection === 'sound' || initialSection === 'system' || initialSection === 'about'
      ? initialSection
      : 'appearance',
  )
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const next = (payload as { section?: unknown } | undefined)?.section
    if (next === 'appearance' || next === 'sound' || next === 'system' || next === 'about') {
      setSection(next)
    }
  }, [payload])

  return (
    <div className="settings">
      <aside className="settings__sidebar">
        <div className="settings__sidebar-title">Settings</div>
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`settings__nav ${section === item.id ? 'is-active' : ''}`}
            onClick={() => setSection(item.id)}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </button>
        ))}
      </aside>

      <div className="settings__content">
        {section === 'appearance' && (
          <>
            <h2 className="settings__title">Appearance</h2>

            <div className="gnome-section-title">Style</div>
            <div className="settings__themes">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`settings__theme ${settings.theme === theme.id ? 'is-active' : ''}`}
                  onClick={() => setSettings({ theme: theme.id })}
                  aria-pressed={settings.theme === theme.id}
                >
                  <span className={`settings__preview settings__preview--${theme.id}`} />
                  <span className="settings__theme-text">
                    <b>{theme.name}</b>
                    <span>{theme.detail}</span>
                  </span>
                  {settings.theme === theme.id && <Icon name="check" size={15} />}
                </button>
              ))}
            </div>

            <div className="gnome-section-title">Wallpaper</div>
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

            <div className="gnome-section-title">Effects</div>
            <div className="gnome-group">
              <Toggle
                label="Animations"
                detail="Window and shell animations"
                value={!settings.reduceMotion}
                onChange={(value) => setSettings({ reduceMotion: !value })}
              />
              <Toggle
                label="Night Light"
                detail="Warm tint after sunset"
                value={settings.nightLight}
                onChange={(nightLight) => setSettings({ nightLight })}
              />
            </div>
          </>
        )}

        {section === 'sound' && (
          <>
            <h2 className="settings__title">Sound</h2>
            <div className="gnome-group">
              <Toggle
                label="System Sounds"
                detail="Alerts, login and interface sounds"
                value={settings.sound}
                onChange={(sound) => setSettings({ sound })}
              />
            </div>

            <div className="gnome-section-title">Output Volume</div>
            <div className="settings__volume">
              <div className="settings__volume-head">
                <span>Built-in Audio</span>
                <b>{Math.round(settings.volume * 100)}%</b>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(settings.volume * 100)}
                aria-label="Output volume"
                onChange={(event) => setSettings({ volume: Number(event.target.value) / 100 })}
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => playSound('chime')}
              disabled={!settings.sound}
            >
              <Icon name="sound" size={15} />
              Play Test Sound
            </button>
          </>
        )}

        {section === 'system' && (
          <>
            <h2 className="settings__title">System</h2>
            <div className="gnome-group">
              <div className="gnome-row">
                <span className="gnome-row__text">
                  <b>Device name</b>
                  <span>matrixx</span>
                </span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text">
                  <b>Operating System</b>
                  <span>Matrixx Linux 24.04 LTS</span>
                </span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text">
                  <b>GNOME</b>
                  <span>46 · Wayland</span>
                </span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text">
                  <b>Kernel</b>
                  <span>6.8.0-matrixx</span>
                </span>
              </div>
            </div>

            <div className="gnome-section-title">Startup</div>
            <div className="gnome-group">
              <Toggle
                label="Skip boot animation"
                detail="Go straight to the login screen"
                value={settings.skipBoot}
                onChange={(skipBoot) => setSettings({ skipBoot })}
              />
            </div>

            <div className="gnome-section-title">Session</div>
            <div className="settings__actions">
              <button type="button" className="btn" onClick={lock}>
                <Icon name="lock" size={15} />
                Lock Screen
              </button>
              <button type="button" className="btn" onClick={reboot}>
                <Icon name="reboot" size={15} />
                Restart
              </button>
              <button
                type="button"
                className={`btn ${confirmReset ? 'btn--danger' : ''}`}
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true)
                    notify('Press the reset button again to confirm', 'info')
                    return
                  }
                  resetSystem()
                }}
              >
                <Icon name="warning" size={15} />
                {confirmReset ? 'Confirm Reset' : 'Reset System'}
              </button>
            </div>
          </>
        )}

        {section === 'about' && (
          <>
            <h2 className="settings__title">About</h2>
            <div className="settings__about">
              <div className="settings__about-logo">M</div>
              <div>
                <b>Matrixx Linux</b>
                <span>24.04 LTS (Noble)</span>
              </div>
            </div>
            <p className="settings__about-copy">
              A complete Linux desktop in the browser. Built with React, a custom window manager,
              Web Audio and Canvas. Nothing leaves this machine.
            </p>
            <div className="gnome-group">
              <div className="gnome-row">
                <span className="gnome-row__text"><b>Memory</b><span>640 MiB</span></span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text"><b>Processor</b><span>Matrixx 47.2 MHz</span></span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text"><b>Disk</b><span>640 KB</span></span>
              </div>
              <div className="gnome-row">
                <span className="gnome-row__text"><b>Graphics</b><span>LLVMpipe (software)</span></span>
              </div>
            </div>
            <a
              className="settings__link"
              href="https://github.com/Yakutc/matrixx-os"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Yakutc/matrixx-os
            </a>
          </>
        )}
      </div>
    </div>
  )
}
