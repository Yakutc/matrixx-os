import { useEffect, useState } from 'react'
import { useOS } from './OSProvider'

type BootLine = { text: string; tone?: 'dim' | 'warn' | 'ok' }

const LINES: BootLine[] = [
  { text: 'MATRIXX BIOS v0.9.7 // НИИ-9, СЕКТОР 4', tone: 'dim' },
  { text: 'CPU ...................... 47.2 MHz', tone: 'ok' },
  { text: 'MEM ...................... 640 KB', tone: 'ok' },
  { text: 'CRT ...................... 60 Hz', tone: 'ok' },
  { text: 'СЕТЬ ..................... ЛОКАЛЬНАЯ', tone: 'ok' },
  { text: 'ОБЪЕКТ 09 ................ НЕТ ОТВЕТА', tone: 'warn' },
  { text: 'ПИТАНИЕ: НЕ ОТКЛЮЧАТЬ', tone: 'warn' },
  { text: 'ЗАГРУЗКА КОНТУРА ......... 100%', tone: 'ok' },
  { text: 'СИГНАЛ 47.2 Гц ........... ОЖИДАНИЕ', tone: 'warn' },
  { text: 'ДОБРО ПОЖАЛОВАТЬ, ОПЕРАТОР.', tone: 'dim' },
]

export function BootScreen({ onDone }: { onDone: () => void }) {
  const { settings } = useOS()
  const [visible, setVisible] = useState(0)
  const [stage, setStage] = useState<'typing' | 'logo'>('typing')
  const reduce =
    settings.reduceMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (reduce) {
      setVisible(LINES.length)
      setStage('logo')
      return
    }
    if (visible >= LINES.length) {
      const timer = window.setTimeout(() => setStage('logo'), 420)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(
      () => setVisible((current) => Math.min(current + 1, LINES.length)),
      170,
    )
    return () => window.clearTimeout(timer)
  }, [visible, reduce])

  const advance = () => {
    if (stage === 'typing') {
      setVisible(LINES.length)
      setStage('logo')
      return
    }
    onDone()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      if (stage === 'typing') {
        setVisible(LINES.length)
        setStage('logo')
        return
      }
      onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stage, onDone])

  return (
    <div className="boot" onPointerDown={advance} role="presentation">
      <div className="boot__inner">
        <div className="boot__top">
          <span>MATRIXX // RECOVERY CONSOLE</span>
          <span>СЕКТОР 4 · ТЕРМИНАЛ 04</span>
          <span>04.11.1997</span>
        </div>

        <div className="boot__lines" aria-live="polite">
          {LINES.slice(0, visible).map((line, index) => (
            <div
              key={`${index}-${line.text}`}
              className={`boot__line ${
                line.tone === 'ok'
                  ? 'boot__line--ok'
                  : line.tone === 'warn'
                    ? 'boot__line--warn'
                    : line.tone === 'dim'
                      ? 'boot__line--dim'
                      : ''
              }`}
            >
              <span>{line.text}</span>
            </div>
          ))}
        </div>

        <div className="boot__center">
          {stage === 'logo' && (
            <div className="boot__logo-stage">
              <div className="boot__logo" data-text="MATRIXX">
                MATRIXX
              </div>
              <div className="boot__sub">
                OS 0.9.7 <b>{'//'}</b> RECOVERY BUILD
              </div>
              <div className="boot__press">НАЖМИТЕ ЛЮБУЮ КЛАВИШУ</div>
            </div>
          )}
        </div>

        <div className="boot__foot">
          <div>
            <div>BUILD 0.9.7 · AMD 47.2</div>
            <div>MEM 640K OK · 1 DISK</div>
          </div>
          <div className="boot__progress" aria-hidden="true">
            <span style={{ width: `${(visible / LINES.length) * 100}%` }} />
          </div>
          <div>НЕ ОТКЛЮЧАТЬ ПИТАНИЕ</div>
        </div>
      </div>
    </div>
  )
}
