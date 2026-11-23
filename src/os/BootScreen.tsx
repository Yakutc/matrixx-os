import { useEffect, useState } from 'react'
import { useOS } from './OSProvider'

const SYSTEMD_LINES = [
  { time: '0.000', text: 'Matrixx Linux 24.04 LTS (GNU/Linux 6.8.0-matrixx x86_64)', tone: 'dim' },
  { time: '0.214', text: 'Loaded Linux Kernel 6.8.0-matrixx', tone: 'dim' },
  { time: '0.418', text: 'Mounted /home', tone: 'ok' },
  { time: '0.532', text: 'Started Network Manager', tone: 'ok' },
  { time: '0.744', text: 'Started D-Bus System Message Bus', tone: 'ok' },
  { time: '0.902', text: 'Reached target Local File Systems', tone: 'ok' },
  { time: '1.104', text: 'Started GNOME Display Manager', tone: 'ok' },
  { time: '1.238', text: 'Reached target Graphical Interface', tone: 'ok' },
  { time: '1.240', text: 'Matrixx Linux 24.04 LTS — tty1', tone: 'warn' },
]

export function BootScreen({ onDone }: { onDone: () => void }) {
  const { settings } = useOS()
  const [stage, setStage] = useState<'grub' | 'systemd'>('grub')
  const reduce =
    settings.reduceMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (reduce) {
      setStage('systemd')
      const timer = window.setTimeout(onDone, 600)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(
      () => {
        if (stage === 'grub') setStage('systemd')
        else onDone()
      },
      stage === 'grub' ? 1600 : 1900,
    )
    return () => window.clearTimeout(timer)
  }, [stage, reduce, onDone])

  useEffect(() => {
    const advance = () => {
      if (stage === 'grub') setStage('systemd')
      else onDone()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onDone()
        return
      }
      advance()
    }
    const onPointer = () => advance()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [stage, onDone])

  if (stage === 'grub') {
    return (
      <div className="boot" role="presentation">
        <div className="grub">
          <div className="grub__frame">
            <div className="grub__title">GNU GRUB version 2.12</div>
            <div className="grub__sub">
              Matrixx Linux 24.04 LTS — recovery image
            </div>
            <div className="grub__entry is-selected">
              <span>›</span>
              Matrixx Linux 24.04 LTS
            </div>
            <div className="grub__entry">
              <span>›</span>
              Advanced options for Matrixx Linux
            </div>
            <div className="grub__entry">
              <span>›</span>
              Memory test (memtest86+)
            </div>
            <div className="grub__hint">
              Use the ↑ and ↓ keys to select which entry is highlighted.
              <br />
              Press enter to boot the selected OS.
              <br />
              <span className="grub__timer">Booting Matrixx Linux in 3 seconds…</span>
            </div>
          </div>
        </div>
        <div className="boot__skip">Click or press any key to continue</div>
      </div>
    )
  }

  return (
    <div className="boot" role="presentation">
      <div className="systemd">
        {SYSTEMD_LINES.map((line) => (
          <div className="systemd__line" key={`${line.time}-${line.text}`}>
            <span className="systemd__dim">[{line.time}] </span>
            <span className={line.tone === 'ok' ? 'systemd__ok' : line.tone === 'warn' ? 'systemd__warn' : 'systemd__dim'}>
              {line.tone === 'ok' ? '[  OK  ] ' : ''}
            </span>
            {line.text}
          </div>
        ))}
        <div className="systemd__line">
          <span className="systemd__dim">[  OK  ] </span>
          Started User Manager for UID 1000
          <span className="boot__cursor" />
        </div>
      </div>
      <div className="boot__skip">Click or press any key to skip</div>
    </div>
  )
}
