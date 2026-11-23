import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AppView } from './AppView'
import { AppIcon, Icon } from './icons'
import { useOS } from './OSProvider'
import type { Rect, WindowState } from './types'
import { clampRect, workspaceBounds } from './wm'

type ResizeDir = 'se' | 'e' | 's'

export function WindowFrame({ win }: { win: WindowState }) {
  const {
    activeId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
  } = useOS()
  const [draft, setDraft] = useState<Rect | null>(null)
  const drag = useRef<{ pointerId: number; startX: number; startY: number; rect: Rect } | null>(
    null,
  )
  const resize = useRef<{
    pointerId: number
    dir: ResizeDir
    startX: number
    startY: number
    rect: Rect
  } | null>(null)
  const active = activeId === win.id && !win.minimized
  const rect = draft ?? win.rect

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const target = event.target
    if (target instanceof Element && target.closest('.win__ctl')) return
    focusWindow(win.id)
    if (win.maximized) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rect: win.rect,
    }
    setDraft(win.rect)
  }

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
    setDraft(
      clampRect(
        {
          ...current.rect,
          x: current.rect.x + event.clientX - current.startX,
          y: current.rect.y + event.clientY - current.startY,
        },
        bounds,
      ),
    )
  }

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    drag.current = null
    const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
    const next = clampRect(
      {
        ...current.rect,
        x: current.rect.x + event.clientX - current.startX,
        y: current.rect.y + event.clientY - current.startY,
      },
      bounds,
    )
    setDraft(null)
    moveWindow(win.id, next)
    if (event.currentTarget.hasPointerCapture(current.pointerId)) {
      event.currentTarget.releasePointerCapture(current.pointerId)
    }
  }

  const cancelDrag = () => {
    drag.current = null
    setDraft(null)
  }

  const startResize =
    (dir: ResizeDir) => (event: ReactPointerEvent<HTMLSpanElement>) => {
      if (event.button !== 0) return
      event.preventDefault()
      event.stopPropagation()
      focusWindow(win.id)
      if (win.maximized) return
      event.currentTarget.setPointerCapture(event.pointerId)
      resize.current = {
        pointerId: event.pointerId,
        dir,
        startX: event.clientX,
        startY: event.clientY,
        rect: win.rect,
      }
      setDraft(win.rect)
    }

  const moveResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const current = resize.current
    if (!current) return
    const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    const w = current.dir === 's' ? current.rect.w : current.rect.w + dx
    const h = current.dir === 'e' ? current.rect.h : current.rect.h + dy
    setDraft(clampRect({ ...current.rect, w, h }, bounds))
  }

  const finishResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const current = resize.current
    if (!current) return
    resize.current = null
    const bounds = workspaceBounds(window.innerWidth, window.innerHeight)
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    const w = current.dir === 's' ? current.rect.w : current.rect.w + dx
    const h = current.dir === 'e' ? current.rect.h : current.rect.h + dy
    const next = clampRect({ ...current.rect, w, h }, bounds)
    setDraft(null)
    moveWindow(win.id, next)
    if (event.currentTarget.hasPointerCapture(current.pointerId)) {
      event.currentTarget.releasePointerCapture(current.pointerId)
    }
  }

  const cancelResize = () => {
    resize.current = null
    setDraft(null)
  }

  return (
    <section
      className={`win ${active ? 'is-active' : ''} ${win.maximized ? 'is-maximized' : ''} ${
        win.minimized ? 'is-minimized' : ''
      }`}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: 100 + win.z,
      }}
      aria-label={win.title}
      data-app={win.appId}
      onPointerDownCapture={() => {
        if (activeId !== win.id) focusWindow(win.id)
      }}
      onFocusCapture={() => {
        if (activeId !== win.id) focusWindow(win.id)
      }}
    >
      <div
        className="win__bar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
        onDoubleClick={(event) => {
          const target = event.target
          if (target instanceof Element && target.closest('.win__ctl')) return
          toggleMaximize(win.id)
        }}
      >
        <AppIcon appId={win.appId} className="win__icon" />
        <span className="win__title">{win.title}</span>
        <span className="win__spacer" />
        <div className="win__controls">
          <button
            type="button"
            className="win__ctl"
            aria-label="Minimize window"
            title="Minimize"
            onClick={() => minimizeWindow(win.id)}
          >
            <Icon name="min" size={14} />
          </button>
          <button
            type="button"
            className="win__ctl"
            aria-label={win.maximized ? 'Restore window' : 'Maximize window'}
            title={win.maximized ? 'Restore' : 'Maximize'}
            onClick={() => toggleMaximize(win.id)}
          >
            <Icon name={win.maximized ? 'restore' : 'max'} size={12} />
          </button>
          <button
            type="button"
            className="win__ctl win__ctl--close"
            aria-label="Close window"
            title="Close"
            onClick={() => closeWindow(win.id)}
          >
            <Icon name="close" size={12} />
          </button>
        </div>
      </div>

      <div className="win__body">
        <div className="win__content">
          <AppView appId={win.appId} windowId={win.id} payload={win.payload} />
        </div>
      </div>

      {!win.maximized && (
        <>
          <span
            className="win__rz win__rz--se"
            aria-hidden="true"
            onPointerDown={startResize('se')}
            onPointerMove={moveResize}
            onPointerUp={finishResize}
            onPointerCancel={cancelResize}
          />
          <span
            className="win__rz win__rz--e"
            aria-hidden="true"
            onPointerDown={startResize('e')}
            onPointerMove={moveResize}
            onPointerUp={finishResize}
            onPointerCancel={cancelResize}
          />
          <span
            className="win__rz win__rz--s"
            aria-hidden="true"
            onPointerDown={startResize('s')}
            onPointerMove={moveResize}
            onPointerUp={finishResize}
            onPointerCancel={cancelResize}
          />
        </>
      )}
    </section>
  )
}
