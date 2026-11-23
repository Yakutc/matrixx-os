import type { Rect, WindowState } from './types'

export const TASKBAR_H = 46
export const MIN_WINDOW_W = 360
export const MIN_WINDOW_H = 240
export const MIN_VISIBLE = 140

export interface WMState {
  windows: WindowState[]
  activeId: string | null
  z: number
  seq: number
}

export type WMAction =
  | { type: 'open'; window: WindowState; singleton: boolean }
  | { type: 'close'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'toggleMax'; id: string; bounds: Rect }
  | { type: 'move'; id: string; rect: Rect }
  | { type: 'bounds'; bounds: Rect }
  | { type: 'restore'; windows: WindowState[] }

export function workspaceBounds(width: number, height: number): Rect {
  return { x: 0, y: 0, w: Math.max(320, width), h: Math.max(280, height - TASKBAR_H) }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function topWindow(windows: WindowState[]): WindowState | null {
  let top: WindowState | null = null
  for (const win of windows) {
    if (win.minimized) continue
    if (!top || win.z > top.z) top = win
  }
  return top
}

export function clampRect(rect: Rect, bounds: Rect): Rect {
  const minW = Math.min(MIN_WINDOW_W, bounds.w)
  const minH = Math.min(MIN_WINDOW_H, bounds.h)
  const w = clamp(rect.w, minW, bounds.w)
  const h = clamp(rect.h, minH, bounds.h)
  const x = clamp(rect.x, bounds.x - w + MIN_VISIBLE, bounds.x + bounds.w - MIN_VISIBLE)
  const y = clamp(rect.y, bounds.y, bounds.y + bounds.h - 34)
  return { x, y, w, h }
}

export function isUsableRect(rect: Rect): boolean {
  return (
    Number.isFinite(rect.x) &&
    Number.isFinite(rect.y) &&
    Number.isFinite(rect.w) &&
    Number.isFinite(rect.h) &&
    rect.w > 80 &&
    rect.h > 60
  )
}

export function isRectVisible(rect: Rect, bounds: Rect): boolean {
  return (
    isUsableRect(rect) &&
    rect.x < bounds.x + bounds.w &&
    rect.y < bounds.y + bounds.h &&
    rect.x + rect.w > bounds.x &&
    rect.y + rect.h > bounds.y
  )
}

function nextActive(windows: WindowState[]): string | null {
  return topWindow(windows)?.id ?? null
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case 'open': {
      if (action.singleton) {
        const existing = state.windows.find((win) => win.appId === action.window.appId)
        if (existing) {
          const z = state.z + 1
          return {
            ...state,
            activeId: existing.id,
            z,
            windows: state.windows.map((win) =>
              win.id === existing.id
                ? {
                    ...win,
                    minimized: false,
                    z,
                    payload: action.window.payload ?? win.payload,
                    title: action.window.title || win.title,
                  }
                : win,
            ),
          }
        }
      }
      const z = state.z + 1
      return {
        ...state,
        activeId: action.window.id,
        z,
        seq: Math.max(state.seq, action.window.z),
        windows: [...state.windows, { ...action.window, z }],
      }
    }
    case 'close': {
      const windows = state.windows.filter((win) => win.id !== action.id)
      return {
        ...state,
        windows,
        activeId: state.activeId === action.id ? nextActive(windows) : state.activeId,
      }
    }
    case 'focus': {
      const target = state.windows.find((win) => win.id === action.id)
      if (!target) return state
      const z = state.z + 1
      return {
        ...state,
        activeId: action.id,
        z,
        windows: state.windows.map((win) =>
          win.id === action.id ? { ...win, z, minimized: false } : win,
        ),
      }
    }
    case 'minimize': {
      const windows = state.windows.map((win) =>
        win.id === action.id ? { ...win, minimized: true } : win,
      )
      return {
        ...state,
        windows,
        activeId: state.activeId === action.id ? nextActive(windows) : state.activeId,
      }
    }
    case 'toggleMax': {
      const { bounds } = action
      const windows = state.windows.map((win) => {
        if (win.id !== action.id) return win
        if (win.maximized) {
          const restored = clampRect(win.prevRect ?? win.rect, bounds)
          return { ...win, maximized: false, prevRect: undefined, rect: restored }
        }
        return { ...win, maximized: true, prevRect: win.rect, rect: { ...bounds } }
      })
      const z = state.z + 1
      return {
        ...state,
        activeId: action.id,
        z,
        windows: windows.map((win) => (win.id === action.id ? { ...win, z } : win)),
      }
    }
    case 'move': {
      const windows = state.windows.map((win) =>
        win.id === action.id && !win.maximized ? { ...win, rect: action.rect } : win,
      )
      return { ...state, windows }
    }
    case 'bounds': {
      const windows = state.windows.map((win) =>
        win.maximized
          ? { ...win, rect: { ...action.bounds } }
          : { ...win, rect: clampRect(win.rect, action.bounds) },
      )
      return { ...state, windows }
    }
    case 'restore': {
      const z = action.windows.reduce((max, win) => Math.max(max, win.z), 0)
      return {
        windows: action.windows,
        activeId: topWindow(action.windows)?.id ?? null,
        z: z + 1,
        seq: Math.max(state.seq, z),
      }
    }
    default:
      return state
  }
}

export function persistableWindows(windows: WindowState[]): WindowState[] {
  return windows.map(({ payload: _payload, ...rest }) => rest)
}

export function sanitizeWindows(
  raw: unknown,
  bounds: Rect,
  isValidApp: (value: string) => boolean,
): WindowState[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: WindowState[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const win = item as Partial<WindowState>
    if (typeof win.id !== 'string' || win.id.length === 0 || win.id.length > 80) continue
    if (seen.has(win.id)) continue
    if (typeof win.appId !== 'string' || !isValidApp(win.appId)) continue
    if (!win.rect || typeof win.rect !== 'object') continue
    const rect = win.rect as Rect
    if (!isUsableRect(rect)) continue
    const z = typeof win.z === 'number' && Number.isFinite(win.z) ? win.z : 1
    const maximized = win.maximized === true
    const prevRect =
      win.prevRect && typeof win.prevRect === 'object' && isUsableRect(win.prevRect)
        ? clampRect(win.prevRect, bounds)
        : undefined
    seen.add(win.id)
    out.push({
      id: win.id,
      appId: win.appId as WindowState['appId'],
      title: typeof win.title === 'string' ? win.title.slice(0, 80) : 'ОКНО',
      rect: maximized ? { ...bounds } : clampRect(rect, bounds),
      z,
      minimized: win.minimized === true,
      maximized,
      prevRect,
    })
  }
  return out.slice(0, 16)
}
