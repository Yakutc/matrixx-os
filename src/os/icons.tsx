import type { CSSProperties, ReactNode } from 'react'
import type { AppId } from './types'

export type IconName =
  | AppId
  | 'min'
  | 'max'
  | 'restore'
  | 'close'
  | 'sound'
  | 'mute'
  | 'power'
  | 'lock'
  | 'reboot'
  | 'search'
  | 'arrow'
  | 'folder'
  | 'file'
  | 'crt'
  | 'logo'
  | 'chevron'
  | 'plus'
  | 'trash'
  | 'play'
  | 'stop'
  | 'check'
  | 'warning'
  | 'wave'
  | 'signal'
  | 'eye'
  | 'grid'
  | 'wifi'
  | 'bluetooth'
  | 'moon'
  | 'home'
  | 'user'

const paths: Record<IconName, ReactNode> = {
  terminal: (
    <>
      <rect x="2.5" y="4" width="19" height="16" />
      <path d="M6.5 9.5 10 12l-3.5 2.5" />
      <path d="M12.5 15H17" />
    </>
  ),
  files: (
    <>
      <path d="M3 7h6l2 2h10v10.5H3z" />
      <path d="M3 7V4.5h6l2 2" />
      <path d="M7 13h10" />
    </>
  ),
  notes: (
    <>
      <path d="M5 3h10l4 4v14H5z" />
      <path d="M15 3v4h4" />
      <path d="M8 11h7M8 14.5h7M8 18h4" />
    </>
  ),
  settings: (
    <>
      <path d="M3 6h8M15 6h6M3 12h4M11 12h10M3 18h10M17 18h4" />
      <rect x="11" y="4.5" width="4" height="3" />
      <rect x="7" y="10.5" width="4" height="3" />
      <rect x="13" y="16.5" width="4" height="3" />
    </>
  ),
  system: (
    <>
      <rect x="2.5" y="4" width="19" height="16" />
      <path d="M5.5 12h3l1.5-4 3 8 1.5-4h4" />
    </>
  ),
  snake: (
    <>
      <path d="M4 6h7v6H7v4h9V9h3" />
      <rect x="16" y="4" width="4" height="4" />
      <rect x="3" y="15" width="4" height="4" />
      <circle cx="18" cy="16" r="1" />
    </>
  ),
  fm: (
    <>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="M7.5 14a4.5 4.5 0 0 1 9 0" />
      <circle cx="12" cy="17" r="1" />
      <path d="M12 4v3" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 8v.5" />
    </>
  ),
  min: <path d="M5 12h14" />,
  max: <rect x="5" y="5" width="14" height="14" />,
  restore: (
    <>
      <rect x="4" y="8" width="12" height="12" />
      <path d="M8 8V4h12v12h-4" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  sound: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="m16 9 5 6M21 9l-5 6" />
    </>
  ),
  power: (
    <>
      <path d="M12 3v8" />
      <path d="M7.2 6.2a8 8 0 1 0 9.6 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v2" />
    </>
  ),
  reboot: (
    <>
      <path d="M19 8V4h-4" />
      <path d="M18.5 5A8.5 8.5 0 1 0 20 14" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  arrow: <path d="M4 12h15M14 6l6 6-6 6" />,
  folder: (
    <>
      <path d="M3 7h6l2 2h10v10.5H3z" />
      <path d="M3 7V4.5h6l2 2" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
    </>
  ),
  crt: (
    <>
      <rect x="2.5" y="4" width="19" height="14" />
      <path d="M8 21h8M12 18v3" />
      <path d="M5.5 8h13M5.5 11h13M5.5 14h13" />
    </>
  ),
  logo: (
    <>
      <path d="M4 4h-1v16h1M20 4h1v16h-1" />
      <path d="M7 16V8l5 5 5-5v8" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 4v16M4 12h16" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  play: <path d="M7 4v16l13-8z" />,
  stop: <rect x="6" y="6" width="12" height="12" />,
  check: <path d="m4 12 5 5L20 6" />,
  warning: (
    <>
      <path d="M12 3 22 20H2z" />
      <path d="M12 9v5M12 17v.5" />
    </>
  ),
  wave: <path d="M2 12h3l2-7 3 14 3-10 2 6 2-3h5" />,
  signal: (
    <>
      <path d="M5 20v-5M10 20V9M15 20v-8M20 20V4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="4" height="4" rx="1" />
      <rect x="10" y="4" width="4" height="4" rx="1" />
      <rect x="16" y="4" width="4" height="4" rx="1" />
      <rect x="4" y="10" width="4" height="4" rx="1" />
      <rect x="10" y="10" width="4" height="4" rx="1" />
      <rect x="16" y="10" width="4" height="4" rx="1" />
      <rect x="4" y="16" width="4" height="4" rx="1" />
      <rect x="10" y="16" width="4" height="4" rx="1" />
      <rect x="16" y="16" width="4" height="4" rx="1" />
    </>
  ),
  wifi: (
    <>
      <path d="M3 9a13 13 0 0 1 18 0" />
      <path d="M6.5 12.5a8 8 0 0 1 11 0" />
      <path d="M9.5 16a4 4 0 0 1 5 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bluetooth: <path d="M7 7l10 10-5 4V3l5 4L7 17" />,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" />,
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 18, className, strokeWidth = 1.5 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}

const APP_COLORS: Record<AppId, { a: string; b: string }> = {
  terminal: { a: '#5c2d4d', b: '#210019' },
  files: { a: '#ff8a3d', b: '#c7431a' },
  notes: { a: '#f6d32d', b: '#c99a00' },
  settings: { a: '#6a6a6a', b: '#333333' },
  system: { a: '#62a0ea', b: '#1c71d8' },
  snake: { a: '#57e389', b: '#26a269' },
  fm: { a: '#c061cb', b: '#813d9c' },
  about: { a: '#e95420', b: '#a33915' },
}

export function AppIcon({ appId, className }: { appId: AppId; className?: string }) {
  const color = APP_COLORS[appId]
  return (
    <span
      className={`app-icon ${className ?? ''}`}
      style={{ '--icon-a': color.a, '--icon-b': color.b } as CSSProperties}
      aria-hidden="true"
    >
      <Icon name={appId} strokeWidth={1.8} />
    </span>
  )
}
