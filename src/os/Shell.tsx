import { useEffect, useRef, useState } from 'react'
import { useOS } from './OSProvider'
import { BootScreen } from './BootScreen'
import { LoginScreen } from './LoginScreen'
import { LockScreen } from './LockScreen'
import { OffScreen } from './OffScreen'
import { Wallpaper } from './Wallpaper'
import { ClockWidget } from './ClockWidget'
import { DesktopIcons } from './DesktopIcons'
import { WindowFrame } from './WindowFrame'
import { Taskbar } from './Taskbar'
import { StartMenu } from './StartMenu'
import { ContextMenu } from './ContextMenu'
import { CommandPalette } from './CommandPalette'
import { Toasts } from './Toasts'

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
    focusWindow,
    triggerSignal,
    notify,
    playSound,
  } = useOS()
  const [startOpen, setStartOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [glitch, setGlitch] = useState(false)
  const [konami, setKonami] = useState(false)
  const sequence = useRef<string[]>([])
  const glitchTimer = useRef<number | null>(null)
  const konamiTimer = useRef<number | null>(null)

  useEffect(() => {
    setStartOpen(false)
    setPaletteOpen(false)
    setContextMenu(null)
  }, [phase])

  useEffect(() => {
    const onSignal = () => {
      setGlitch(true)
      if (glitchTimer.current) window.clearTimeout(glitchTimer.current)
      glitchTimer.current = window.setTimeout(() => setGlitch(false), 950)
    }
    window.addEventListener('matrixx:signal', onSignal)
    return () => {
      window.removeEventListener('matrixx:signal', onSignal)
      if (glitchTimer.current) window.clearTimeout(glitchTimer.current)
    }
  }, [])

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
          setPaletteOpen((open) => !open)
          setStartOpen(false)
          setContextMenu(null)
        }
        return
      }

      if (event.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null)
          return
        }
        if (paletteOpen) {
          setPaletteOpen(false)
          return
        }
        if (startOpen) {
          setStartOpen(false)
          return
        }
      }

      if (phase !== 'desktop') return

      if (event.altKey && (event.key === 'Tab' || event.code === 'Backquote')) {
        event.preventDefault()
        if (windows.length > 0) {
          const ordered = [...windows].sort((a, b) => a.z - b.z)
          const index = ordered.findIndex((win) => win.id === activeId)
          const next = ordered[(index + 1) % ordered.length] ?? ordered[0]
          if (next) focusWindow(next.id)
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
        setKonami(true)
        notify('ПРОТОКОЛ 09 АКТИВИРОВАН', 'danger')
        playSound('error')
        if (konamiTimer.current) window.clearTimeout(konamiTimer.current)
        konamiTimer.current = window.setTimeout(() => setKonami(false), 1900)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (konamiTimer.current) window.clearTimeout(konamiTimer.current)
    }
  }, [
    activeId,
    contextMenu,
    focusWindow,
    notify,
    paletteOpen,
    phase,
    playSound,
    startOpen,
    triggerSignal,
    windows,
  ])

  if (phase === 'boot') {
    return (
      <div className="shell">
        <BootScreen onDone={bootDone} />
        <div className="crt" />
      </div>
    )
  }

  if (phase === 'login') {
    return (
      <div className="shell">
        <LoginScreen />
        <div className="crt" />
      </div>
    )
  }

  if (phase === 'lock') {
    return (
      <div className="shell">
        <LockScreen />
        <div className="crt" />
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
    <div className={`shell ${glitch ? 'is-glitching' : ''} ${konami ? 'is-konami' : ''}`}>
      <div
        className="desktop"
        onContextMenu={(event) => {
          const target = event.target
          if (
            target instanceof Element &&
            target.closest('.win, .widget, .taskbar, .icon-grid, .start, .ctx-menu, .palette')
          ) {
            return
          }
          event.preventDefault()
          setContextMenu({ x: event.clientX, y: event.clientY })
          setStartOpen(false)
          setPaletteOpen(false)
        }}
      >
        <Wallpaper />
        <ClockWidget />
        <DesktopIcons />
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win} />
        ))}
      </div>

      <Taskbar
        startOpen={startOpen}
        onToggleStart={() => {
          setStartOpen((open) => !open)
          setPaletteOpen(false)
          setContextMenu(null)
        }}
      />

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      <Toasts />
      <div className="glitch" aria-hidden="true" />
      <div className="crt" aria-hidden="true" />
    </div>
  )
}
