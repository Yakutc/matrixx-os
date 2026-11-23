import { useEffect, useMemo, useRef, useState } from 'react'
import { APP_META, APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { Icon, type IconName } from './icons'
import type { ThemeId, WallpaperId } from './types'

interface PaletteAction {
  id: string
  label: string
  group: string
  icon: IconName
  run: () => void
}

const THEMES: ThemeId[] = ['phosphor', 'amber', 'bone']
const WALLPAPERS: WallpaperId[] = ['grid', 'signal', 'orbit']
const THEME_NAMES: Record<ThemeId, string> = {
  phosphor: 'ФОСФОР',
  amber: 'ЯНТАРЬ',
  bone: 'КОСТЬ',
}
const WALLPAPER_NAMES: Record<WallpaperId, string> = {
  grid: 'СЕТКА',
  signal: 'СИГНАЛ',
  orbit: 'ОРБИТА',
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const { openWindow, setSettings, lock, reboot } = useOS()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const actions = useMemo<PaletteAction[]>(
    () => [
      ...APP_ORDER.map((appId) => ({
        id: `app-${appId}`,
        label: APP_META[appId].title,
        group: 'ПРИЛОЖЕНИЕ',
        icon: appId,
        run: () => openWindow(appId),
      })),
      ...THEMES.map((theme) => ({
        id: `theme-${theme}`,
        label: `ТЕМА: ${THEME_NAMES[theme]}`,
        group: 'ОФОРМЛЕНИЕ',
        icon: 'settings' as IconName,
        run: () => setSettings({ theme }),
      })),
      ...WALLPAPERS.map((wallpaper) => ({
        id: `wallpaper-${wallpaper}`,
        label: `ОБОИ: ${WALLPAPER_NAMES[wallpaper]}`,
        group: 'ОФОРМЛЕНИЕ',
        icon: 'crt' as IconName,
        run: () => setSettings({ wallpaper }),
      })),
      {
        id: 'lock',
        label: 'ЗАБЛОКИРОВАТЬ СИСТЕМУ',
        group: 'СИСТЕМА',
        icon: 'lock',
        run: lock,
      },
      {
        id: 'reboot',
        label: 'ПЕРЕЗАГРУЗИТЬ',
        group: 'СИСТЕМА',
        icon: 'reboot',
        run: reboot,
      },
    ],
    [lock, openWindow, reboot, setSettings],
  )

  const filtered = actions.filter((action) => {
    const needle = query.trim().toLowerCase()
    if (!needle) return true
    return `${action.label} ${action.group}`.toLowerCase().includes(needle)
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    if (active >= filtered.length) setActive(0)
  }, [active, filtered.length])

  const execute = (action: PaletteAction) => {
    action.run()
    onClose()
  }

  return (
    <div
      className="palette-backdrop"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div className="palette" role="dialog" aria-label="Командная палитра">
        <div className="palette__bar">
          <Icon name="search" size={17} />
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="КОМАНДА ИЛИ ПРИЛОЖЕНИЕ..."
            aria-label="Поиск команды"
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive((current) => Math.min(current + 1, filtered.length - 1))
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive((current) => Math.max(current - 1, 0))
              }
              if (event.key === 'Enter' && filtered[active]) {
                event.preventDefault()
                execute(filtered[active])
              }
              if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
              }
            }}
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="palette__list">
          {filtered.length === 0 && <div className="palette__empty">НИЧЕГО НЕ НАЙДЕНО</div>}
          {filtered.map((action, index) => (
            <button
              key={action.id}
              type="button"
              className={`palette__item ${index === active ? 'is-active' : ''}`}
              onPointerEnter={() => setActive(index)}
              onClick={() => execute(action)}
            >
              <Icon name={action.icon} size={15} />
              <b>{action.label}</b>
              <span>{action.group}</span>
            </button>
          ))}
        </div>
        <div className="palette__foot">
          <span>↑↓ ВЫБОР</span>
          <span>ENTER ОТКРЫТЬ</span>
          <span>ESC ЗАКРЫТЬ</span>
        </div>
      </div>
    </div>
  )
}
