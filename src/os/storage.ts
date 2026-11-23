import type { Settings, ThemeId, WallpaperId } from './types'

export const KEYS = {
  settings: 'matrixx.settings.v1',
  session: 'matrixx.session.v1',
  notes: 'matrixx.notes.v1',
  snake: 'matrixx.snake.v1',
  fm: 'matrixx.fm.v1',
  flags: 'matrixx.flags.v1',
} as const

export const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  wallpaper: 'noble',
  sound: true,
  volume: 0.55,
  skipBoot: false,
  reduceMotion: false,
  nightLight: false,
}

const THEMES: ThemeId[] = ['dark', 'light', 'hc']
const WALLPAPERS: WallpaperId[] = ['noble', 'minimal', 'sunset']

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null) return fallback
    return parsed as T
  } catch {
    return fallback
  }
}

export function readObject<T extends object>(key: string, fallback: T): T {
  const raw = readJson<unknown>(key, null)
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback
  return raw as T
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKeys(keys: string[]): void {
  for (const key of keys) {
    try {
      localStorage.removeItem(key)
    } catch {
      void 0
    }
  }
}

export function loadSettings(): Settings {
  const raw = readObject<Partial<Settings>>(KEYS.settings, {})
  return {
    theme: THEMES.includes(raw.theme as ThemeId) ? (raw.theme as ThemeId) : DEFAULT_SETTINGS.theme,
    wallpaper: WALLPAPERS.includes(raw.wallpaper as WallpaperId)
      ? (raw.wallpaper as WallpaperId)
      : DEFAULT_SETTINGS.wallpaper,
    sound: typeof raw.sound === 'boolean' ? raw.sound : DEFAULT_SETTINGS.sound,
    volume:
      typeof raw.volume === 'number' && Number.isFinite(raw.volume)
        ? Math.min(1, Math.max(0, raw.volume))
        : DEFAULT_SETTINGS.volume,
    skipBoot: typeof raw.skipBoot === 'boolean' ? raw.skipBoot : DEFAULT_SETTINGS.skipBoot,
    reduceMotion:
      typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    nightLight:
      typeof raw.nightLight === 'boolean' ? raw.nightLight : DEFAULT_SETTINGS.nightLight,
  }
}

export function saveSettings(settings: Settings): void {
  writeJson(KEYS.settings, settings)
}

export function clearSystemStorage(): void {
  removeKeys(Object.values(KEYS))
}
