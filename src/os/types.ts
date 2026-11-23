export type AppId =
  | 'terminal'
  | 'files'
  | 'notes'
  | 'settings'
  | 'system'
  | 'snake'
  | 'fm'
  | 'about'

export type ThemeId = 'phosphor' | 'amber' | 'bone'
export type WallpaperId = 'grid' | 'signal' | 'orbit'
export type Phase = 'boot' | 'login' | 'desktop' | 'lock' | 'off'
export type ToastTone = 'info' | 'ok' | 'danger'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Settings {
  theme: ThemeId
  wallpaper: WallpaperId
  crt: boolean
  sound: boolean
  volume: number
  skipBoot: boolean
  reduceMotion: boolean
}

export interface WindowState {
  id: string
  appId: AppId
  title: string
  rect: Rect
  z: number
  minimized: boolean
  maximized: boolean
  prevRect?: Rect
  payload?: unknown
}

export interface OpenOptions {
  title?: string
  payload?: unknown
  rect?: Partial<Rect>
  singleton?: boolean
}

export interface AppProps {
  windowId: string
  payload?: unknown
}

export interface Toast {
  id: number
  text: string
  tone: ToastTone
}

export interface OSApi {
  settings: Settings
  setSettings: (patch: Partial<Settings>) => void
  resetSystem: () => void
  windows: WindowState[]
  activeId: string | null
  openWindow: (appId: AppId, options?: OpenOptions) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  moveWindow: (id: string, rect: Rect) => void
  phase: Phase
  bootDone: () => void
  login: () => void
  lock: () => void
  unlock: () => void
  reboot: () => void
  shutdown: () => void
  powerOn: () => void
  toasts: Toast[]
  notify: (text: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void
  playSound: (name: 'click' | 'open' | 'close' | 'error' | 'chime') => void
  triggerSignal: () => void
}
