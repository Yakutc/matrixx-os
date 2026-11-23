import { useEffect, useRef, useState } from 'react'
import { APP_ORDER } from './apps'
import { useOS } from './OSProvider'
import { BootScreen } from './BootScreen'
import { LoginScreen } from './LoginScreen'
import { LockScreen } from './LockScreen'
import { OffScreen } from './OffScreen'
import { Wallpaper } from './Wallpaper'
import { DesktopIcons } from './DesktopIcons'
import { WindowFrame } from './WindowFrame'
import { TopBar } from './TopBar'
import { Dock } from './Dock'
import { Activities } from './Activities'
import { QuickSettings } from './QuickSettings'
import { ContextMenu } from './ContextMenu'
import { Toasts } from './Toasts'
import { workspaceBounds } from './wm'

type Overlay = 'none' | 'activities' | 'apps' | 'quick'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function Shell() {
  const {
    phase,
    bootDone,
    windows,
    activeId,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    openWindow,
    focusWindow,
    settings,
    notify,
    triggerSignal,
  } = useOS()
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [flash, setFlash] = useState(false)
  const sequence = useRef<string[]>([])
  const flashTimer = useRef<number | null>(null)

  const closeOverlays = () => {
    setOverlay('none')
    setContextMenu(null)
  }

  useEffect(() => {
    closeOverlays()
  }, [phase])

  useEffect(() => {
    const onSignal = () => {
      setFlash(true)
      notify('Unknown signal detected on 47.2 Hz', 'danger')
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(false), 450)
    }
    window.addEventListener('matrixx:signal', onSignal)
    return () => {
      window.removeEventListener('matrixx:signal', onSignal)
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
    }
  }, [notify])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (phase === 'desktop') {
          event.preventDefault()
          setOverlay((current) => (current === 'activities' ? 'none' : 'activities'))
          setContextMenu(null)
        }
        return
      }

      if (event.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null)
          return
        }
        if (overlay !== 'none') {
          setOverlay('none')
          return
        }
      }

      if (phase !== 'desktop') return

      if (event.key === 'Meta' || event.key === 'OS') {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
          event.preventDefault()
          setOverlay((current) => (current === 'activities' ? 'none' : 'activities'))
        }
        return
      }

      if (event.metaKey && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        setOverlay('apps')
        return
      }

      if (event.metaKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        for (const win of windows) {
          if (!win.minimized) minimizeWindow(win.id)
        }
        return
      }

      if (event.metaKey && /^[1-8]$/.test(event.key)) {
        event.preventDefault()
        const appId = APP_ORDER[Number(event.key) - 1]
        if (appId) {
          setOverlay('none')
          const existing = windows.find((win) => win.appId === appId)
          if (existing) focusWindow(existing.id)
          else openWindow(appId)
        }
        return
      }

      if (event.altKey && event.key === 'F4') {
        event.preventDefault()
        if (activeId) closeWindow(activeId)
        return
      }

      if (event.metaKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        const active = windows.find((win) => win.id === activeId && !win.minimized)
        if (!active) return
        event.preventDefault()
        const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
        if (event.key === 'ArrowLeft') {
          moveWindow(active.id, { x: 0, y: 0, w: Math.floor(bounds.w / 2), h: bounds.h })
        } else if (event.key === 'ArrowRight') {
          moveWindow(active.id, {
            x: Math.floor(bounds.w / 2),
            y: 0,
            w: Math.ceil(bounds.w / 2),
            h: bounds.h,
          })
        } else if (event.key === 'ArrowUp') {
          if (!active.maximized) toggleMaximize(active.id)
        } else if (active.maximized) {
          toggleMaximize(active.id)
        }
        return
      }

      if (typing) return
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const next = [...sequence.current, key].slice(-KONAMI.length)
      sequence.current = next
      if (
        next.length === KONAMI.length &&
        KONAMI.every((part, index) => next[index] === part)
      ) {
        sequence.current = []
        triggerSignal()
        notify('Developer mode unlocked. Welcome, operator.', 'ok')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    activeId,
    closeWindow,
    contextMenu,
    focusWindow,
    minimizeWindow,
    moveWindow,
    notify,
    openWindow,
    overlay,
    phase,
    toggleMaximize,
    triggerSignal,
    windows,
  ])

  if (phase === 'boot') {
    return (
      <div className="shell">
        <BootScreen onDone={bootDone} />
      </div>
    )
  }

  if (phase === 'login') {
    return (
      <div className="shell">
        <LoginScreen />
      </div>
    )
  }

  if (phase === 'lock') {
    return (
      <div className="shell">
        <LockScreen />
      </div>
    )
  }

  if (phase === 'off') {
    return (
      <div className="shell">
        <OffScreen />
      </div>
    )
  }

  return (
    <div className={`shell ${flash ? 'is-glitching' : ''}`}>
      <div
        className="desktop"
        onContextMenu={(event) => {
          const target = event.target
          if (
            target instanceof Element &&
            target.closest('.win, .dock, .topbar, .desktop-icons, .overview, .appgrid, .quick')
          ) {
            return
          }
          event.preventDefault()
          setContextMenu({ x: event.clientX, y: event.clientY })
          setOverlay('none')
        }}
        onPointerDown={() => {
          if (contextMenu) setContextMenu(null)
        }}
        role="presentation"
      >
        <Wallpaper />
        <DesktopIcons />
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win} />
        ))}
      </div>

      <TopBar
        activitiesOpen={overlay === 'activities'}
        quickOpen={overlay === 'quick'}
        onToggleActivities={() => {
          setContextMenu(null)
          setOverlay((current) => (current === 'activities' ? 'none' : 'activities'))
        }}
        onToggleQuick={() => {
          setContextMenu(null)
          setOverlay((current) => (current === 'quick' ? 'none' : 'quick'))
        }}
      />

      <Dock
        onOpenApps={() => {
          setContextMenu(null)
          setOverlay('apps')
        }}
        onNavigate={closeOverlays}
      />

      {overlay === 'activities' && (
        <Activities
          mode="overview"
          onClose={closeOverlays}
          onOpenApps={() => setOverlay('apps')}
          onOpenOverview={() => setOverlay('activities')}
        />
      )}

      {overlay === 'apps' && (
        <Activities
          mode="apps"
          onClose={closeOverlays}
          onOpenApps={() => setOverlay('apps')}
          onOpenOverview={() => setOverlay('activities')}
        />
      )}

      {overlay === 'quick' && (
        <QuickSettings
          onClose={() => setOverlay('none')}
          onOpenSettings={() => {
            setOverlay('none')
            openWindow('settings')
          }}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <Toasts />
      {settings.nightLight && <div className="night-light" aria-hidden="true" />}
      <div className="flash" aria-hidden="true" />
    </div>
  )
}
