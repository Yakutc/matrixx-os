import { describe, expect, it } from 'vitest'
import {
  clampRect,
  sanitizeWindows,
  wmReducer,
  workspaceBounds,
  type WMState,
} from './wm'
import type { Rect, WindowState } from './types'

const bounds: Rect = { x: 0, y: 0, w: 1440, h: 854 }

function win(id: string, appId: WindowState['appId'], rect: Rect, z = 1): WindowState {
  return { id, appId, title: appId, rect, z, minimized: false, maximized: false }
}

const empty: WMState = { windows: [], activeId: null, z: 0, seq: 0 }

describe('wm reducer', () => {
  it('opens windows and focuses the newest', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', { x: 10, y: 10, w: 600, h: 400 }), singleton: false })
    const second = wmReducer(first, { type: 'open', window: win('b', 'files', { x: 40, y: 40, w: 600, h: 400 }), singleton: false })
    expect(second.windows).toHaveLength(2)
    expect(second.activeId).toBe('b')
    expect(second.windows[1].z).toBeGreaterThan(second.windows[0].z)
  })

  it('reuses a singleton window instead of duplicating it', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'settings', { x: 10, y: 10, w: 600, h: 400 }), singleton: false })
    const second = wmReducer(first, { type: 'open', window: win('b', 'settings', { x: 40, y: 40, w: 600, h: 400 }), singleton: true })
    expect(second.windows).toHaveLength(1)
    expect(second.activeId).toBe('a')
  })

  it('raises a focused window above the rest', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', { x: 0, y: 0, w: 600, h: 400 }), singleton: false })
    const second = wmReducer(first, { type: 'open', window: win('b', 'files', { x: 20, y: 20, w: 600, h: 400 }), singleton: false })
    const focused = wmReducer(second, { type: 'focus', id: 'a' })
    expect(focused.activeId).toBe('a')
    expect(focused.windows[0].z).toBeGreaterThan(focused.windows[1].z)
  })

  it('minimizes the active window and activates the next one', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', { x: 0, y: 0, w: 600, h: 400 }), singleton: false })
    const second = wmReducer(first, { type: 'open', window: win('b', 'files', { x: 20, y: 20, w: 600, h: 400 }), singleton: false })
    const minimized = wmReducer(second, { type: 'minimize', id: 'b' })
    expect(minimized.windows[1].minimized).toBe(true)
    expect(minimized.activeId).toBe('a')
  })

  it('maximizes to bounds and restores the previous rect', () => {
    const rect = { x: 10, y: 20, w: 700, h: 500 }
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', rect), singleton: false })
    const max = wmReducer(first, { type: 'toggleMax', id: 'a', bounds })
    expect(max.windows[0].rect).toEqual(bounds)
    expect(max.windows[0].prevRect).toEqual(rect)
    const restored = wmReducer(max, { type: 'toggleMax', id: 'a', bounds })
    expect(restored.windows[0].rect).toEqual(rect)
    expect(restored.windows[0].maximized).toBe(false)
  })

  it('closes a window and selects the next active one', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', { x: 0, y: 0, w: 600, h: 400 }), singleton: false })
    const second = wmReducer(first, { type: 'open', window: win('b', 'files', { x: 20, y: 20, w: 600, h: 400 }), singleton: false })
    const closed = wmReducer(second, { type: 'close', id: 'b' })
    expect(closed.windows).toHaveLength(1)
    expect(closed.activeId).toBe('a')
  })

  it('does not move a maximized window', () => {
    const first = wmReducer(empty, { type: 'open', window: win('a', 'terminal', { x: 0, y: 0, w: 600, h: 400 }), singleton: false })
    const max = wmReducer(first, { type: 'toggleMax', id: 'a', bounds })
    const moved = wmReducer(max, { type: 'move', id: 'a', rect: { x: 20, y: 20, w: 600, h: 400 } })
    expect(moved.windows[0].rect).toEqual(bounds)
  })
})

describe('window geometry', () => {
  it('clamps windows so the title bar stays reachable', () => {
    const clamped = clampRect({ x: -5000, y: -5000, w: 700, h: 500 }, bounds)
    expect(clamped.x).toBeGreaterThan(-clamped.w)
    expect(clamped.y).toBe(0)
  })

  it('keeps windows inside the workspace width', () => {
    const clamped = clampRect({ x: 5000, y: 100, w: 700, h: 500 }, bounds)
    expect(clamped.x).toBeLessThanOrEqual(bounds.w - 140)
    expect(clamped.w).toBeLessThanOrEqual(bounds.w)
  })

  it('builds a workspace above the taskbar', () => {
    expect(workspaceBounds(1440, 900)).toEqual({ x: 0, y: 0, w: 1440, h: 854 })
  })
})

describe('session restore', () => {
  const isApp = (value: string) => value === 'terminal' || value === 'files'

  it('restores valid windows and clamps off-screen rects', () => {
    const restored = sanitizeWindows(
      [
        { id: 'a', appId: 'terminal', title: 'T', rect: { x: 10, y: 10, w: 600, h: 400 }, z: 2, minimized: false, maximized: false },
        { id: 'b', appId: 'files', title: 'F', rect: { x: 99999, y: 10, w: 600, h: 400 }, z: 1, minimized: false, maximized: false },
      ],
      bounds,
      isApp,
    )
    expect(restored).toHaveLength(2)
    expect(restored[1].rect.x).toBeLessThanOrEqual(bounds.w - 140)
  })

  it('rejects malformed and unknown windows', () => {
    const restored = sanitizeWindows(
      [
        null,
        { id: 'x', appId: 'nope', rect: { x: 0, y: 0, w: 500, h: 300 } },
        { id: 'y', appId: 'terminal', rect: { x: 0, y: 0, w: 500, h: 300 }, z: 'bad' },
        { id: 'z', appId: 'files', rect: { x: Number.NaN, y: 0, w: 500, h: 300 } },
      ],
      bounds,
      isApp,
    )
    expect(restored).toHaveLength(1)
    expect(restored[0].id).toBe('y')
  })
})
