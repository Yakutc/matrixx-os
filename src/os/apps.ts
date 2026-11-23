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
    index: '01',
    title: 'ТЕРМИНАЛ',
    short: 'MSH',
    description: 'командная оболочка',
    singleton: false,
    width: 780,
    height: 480,
  },
  files: {
    index: '02',
    title: 'АРХИВ',
    short: 'DISK',
    description: 'виртуальный диск',
    singleton: false,
    width: 800,
    height: 520,
  },
  notes: {
    index: '03',
    title: 'ЖУРНАЛ',
    short: 'LOG',
    description: 'записи оператора',
    singleton: false,
    width: 720,
    height: 540,
  },
  settings: {
    index: '04',
    title: 'НАСТРОЙКИ',
    short: 'CFG',
    description: 'темы, звук, эффекты',
    singleton: true,
    width: 680,
    height: 580,
  },
  system: {
    index: '05',
    title: 'СИСТЕМА',
    short: 'SYS',
    description: 'диагностика и процессы',
    singleton: true,
    width: 640,
    height: 560,
  },
  snake: {
    index: '06',
    title: 'ЗМЕЙ',
    short: '09',
    description: 'протокол тренировки',
    singleton: true,
    width: 560,
    height: 560,
  },
  fm: {
    index: '07',
    title: 'MATRIXX FM',
    short: '47.2',
    description: 'генератор сигнала',
    singleton: true,
    width: 620,
    height: 500,
  },
  about: {
    index: '08',
    title: 'О СИСТЕМЕ',
    short: 'INFO',
    description: 'манифест сборки',
    singleton: true,
    width: 580,
    height: 500,
  },
}

export const APP_IDS = APP_ORDER.slice()

export function isAppId(value: string): value is AppId {
  return (APP_IDS as string[]).includes(value)
}

export function createDefaultRect(appId: AppId, bounds: Rect, offset: number): Rect {
  const meta = APP_META[appId]
  const reservedLeft = bounds.w < 1100 ? 280 : 0
  const maxWidth = bounds.w < 1100 ? bounds.w - reservedLeft : bounds.w - 16
  const w = Math.min(meta.width, maxWidth)
  const h = Math.min(meta.height, bounds.h - 16)
  if (bounds.w < 720) {
    return { x: bounds.x + 8, y: bounds.y + 8, w: bounds.w - 16, h: bounds.h - 16 }
  }
  const cascade = offset % 6
  const baseX = bounds.w < 1340 ? 258 : Math.round(bounds.w * 0.19)
  const x = Math.min(
    Math.max(bounds.x + baseX + cascade * 38, bounds.x + 24),
    bounds.x + bounds.w - w - 16,
  )
  const y = Math.min(
    bounds.y + 96 + cascade * 38,
    bounds.y + bounds.h - h - 16,
  )
  return { x, y, w, h }
}
