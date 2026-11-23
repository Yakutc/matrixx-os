import type { AppId, Rect } from './types'

export interface AppMeta {
  index: string
  title: string
  short: string
  description: string
  singleton: boolean
  width: number
  height: number
}

export const APP_ORDER: AppId[] = [
  'terminal',
  'files',
  'notes',
  'settings',
  'system',
  'snake',
  'fm',
  'about',
]

export const APP_META: Record<AppId, AppMeta> = {
  terminal: {
    index: '1',
    title: 'Terminal',
    short: 'Terminal',
    description: 'Command line',
    singleton: false,
    width: 900,
    height: 560,
  },
  files: {
    index: '2',
    title: 'Files',
    short: 'Files',
    description: 'Browse your files',
    singleton: false,
    width: 940,
    height: 600,
  },
  notes: {
    index: '3',
    title: 'Text Editor',
    short: 'Text Editor',
    description: 'Write and save notes',
    singleton: false,
    width: 880,
    height: 600,
  },
  settings: {
    index: '4',
    title: 'Settings',
    short: 'Settings',
    description: 'Appearance, sound, system',
    singleton: true,
    width: 900,
    height: 620,
  },
  system: {
    index: '5',
    title: 'System Monitor',
    short: 'System Monitor',
    description: 'CPU, memory and processes',
    singleton: true,
    width: 920,
    height: 600,
  },
  snake: {
    index: '6',
    title: 'Snake',
    short: 'Snake',
    description: 'Classic game',
    singleton: true,
    width: 780,
    height: 640,
  },
  fm: {
    index: '7',
    title: 'Music',
    short: 'Music',
    description: 'Generative synthwave player',
    singleton: true,
    width: 900,
    height: 600,
  },
  about: {
    index: '8',
    title: 'About',
    short: 'About',
    description: 'Matrixx Linux 24.04 LTS',
    singleton: true,
    width: 760,
    height: 600,
  },
}

export const APP_IDS = APP_ORDER.slice()

export function isAppId(value: string): value is AppId {
  return (APP_IDS as string[]).includes(value)
}

export function createDefaultRect(appId: AppId, bounds: Rect, offset: number): Rect {
  const meta = APP_META[appId]
  const w = Math.min(meta.width, bounds.w - 16)
  const h = Math.min(meta.height, bounds.h - 16)
  if (bounds.w < 720) {
    return { x: 0, y: 0, w: bounds.w, h: bounds.h }
  }
  const cascade = (offset % 6) * 28
  const x = Math.min(
    Math.max(88 + cascade, bounds.x + (bounds.w - w) / 2 - 40 + cascade),
    bounds.x + bounds.w - w - 16,
  )
  const y = Math.min(
    Math.max(bounds.y + 28 + cascade, bounds.y + (bounds.h - h) / 2 - 20),
    bounds.y + bounds.h - h - 16,
  )
  return { x, y, w, h }
}
