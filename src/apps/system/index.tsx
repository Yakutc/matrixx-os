import { useEffect, useRef, useState } from 'react'
import { APP_META } from '../../os/apps'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import type { AppProps } from '../../os/types'
import { timeParts, useClock } from '../../os/useClock'

const SYSTEM_START = Date.now()

function uptimeLabel(): string {
  const total = Math.floor((Date.now() - SYSTEM_START) / 1000)
  const hours = String(Math.floor(total / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export default function SystemApp(_props: AppProps) {
  const { windows, settings, triggerSignal, notify } = useOS()
  const now = useClock()
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: 36 }, (_, index) => 24 + Math.sin(index / 2.4) * 9 + Math.random() * 8),
  )
  const [integrity, setIntegrity] = useState<'idle' | 'running' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const integrityTimer = useRef<number | null>(null)

  useEffect(() => {
    setHistory((current) => {
      const last = current[current.length - 1] ?? 32
      const next = Math.min(94, Math.max(8, last + (Math.random() - 0.48) * 17))
      return [...current.slice(1), next]
    })
  }, [now])

  useEffect(() => {
    if (integrity !== 'running') return
    setProgress(0)
    let value = 0
    integrityTimer.current = window.setInterval(() => {
      value = Math.min(100, value + 7 + Math.random() * 12)
      setProgress(value)
      if (value >= 100) {
        if (integrityTimer.current) window.clearInterval(integrityTimer.current)
        setIntegrity('done')
        setHistory((current) => [...current])
        triggerSignal()
        notify('ЦЕЛОСТНОСТЬ: 99.7% · ОДИН ФАЙЛ ИЗМЕНЁН ИЗВНЕ', 'danger')
      }
    }, 130)
    return () => {
      if (integrityTimer.current) window.clearInterval(integrityTimer.current)
    }
  }, [integrity, notify, triggerSignal])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    context.scale(dpr, dpr)
    const styles = getComputedStyle(document.documentElement)
    const accent = styles.getPropertyValue('--accent').trim() || '#ffb347'
    const line = styles.getPropertyValue('--line').trim() || '#233126'
    context.clearRect(0, 0, width, height)
    context.strokeStyle = line
    context.lineWidth = 1
    for (let x = 0; x < width; x += 24) {
      context.beginPath()
      context.moveTo(x + 0.5, 0)
      context.lineTo(x + 0.5, height)
      context.stroke()
    }
    for (let y = 0; y < height; y += 16) {
      context.beginPath()
      context.moveTo(0, y + 0.5)
      context.lineTo(width, y + 0.5)
      context.stroke()
    }
    context.beginPath()
    history.forEach((value, index) => {
      const x = (index / (history.length - 1)) * width
      const y = height - (value / 100) * height
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.strokeStyle = accent
    context.lineWidth = 1.5
    context.stroke()
    context.lineTo(width, height)
    context.lineTo(0, height)
    context.closePath()
    context.fillStyle = `${accent}18`
    context.fill()
  }, [history, settings.theme])

  const cpu = history[history.length - 1] ?? 0
  const { hours, minutes, seconds } = timeParts(now)
  const processes = [
    { pid: '004', name: 'wm-04', status: 'работает', load: '2%' },
    { pid: '007', name: 'matrixx', status: 'работает', load: '6%' },
    { pid: '012', name: 'crt', status: settings.crt ? 'работает' : 'остановлен', load: '1%' },
    ...windows.map((win, index) => ({
      pid: String(100 + index).padStart(3, '0'),
      name: APP_META[win.appId].short.toLowerCase(),
      status: win.minimized ? 'свёрнут' : 'работает',
      load: `${3 + index * 2}%`,
    })),
    { pid: '047', name: 'signal', status: 'ожидание', load: '0%' },
  ]

  return (
    <div className="system">
      <div className="system__head">
        <div>
          <div className="system__kicker">ДИАГНОСТИКА / КОНТУР 04</div>
          <div className="system__title">SYS / 05</div>
        </div>
        <div className="system__clock">
          <b>
            {hours}:{minutes}:{seconds}
          </b>
          <span>UPTIME {uptimeLabel()}</span>
        </div>
      </div>

      <div className="system__scroll">
        <div className="system__stats">
          <div className="system__stat system__stat--wide">
            <div className="system__stat-label">ЗАГРУЗКА CPU</div>
            <div className="system__stat-value">
              {Math.round(cpu)}
              <span>%</span>
            </div>
            <canvas ref={canvasRef} className="system__chart" aria-label="График загрузки CPU" />
          </div>
          <div className="system__stat">
            <div className="system__stat-label">ПАМЯТЬ</div>
            <div className="system__stat-value">
              61<span>%</span>
            </div>
            <div className="system__bar">
              <span style={{ width: '61%' }} />
            </div>
            <div className="system__stat-foot">392 / 640 КБ</div>
          </div>
          <div className="system__stat">
            <div className="system__stat-label">ТЕМПЕРАТУРА</div>
            <div className="system__stat-value">
              47.2<span>°C</span>
            </div>
            <div className="system__stat-foot">КОНТУР СТАБИЛЕН</div>
          </div>
          <div className="system__stat">
            <div className="system__stat-label">СИГНАЛ</div>
            <div className="system__stat-value system__stat-value--live">
              47.2<span>Гц</span>
            </div>
            <div className="system__stat-foot">ОЖИДАНИЕ ОТВЕТА</div>
          </div>
        </div>

        <div className="system__section">
          <div className="section-label">ПРОЦЕССЫ</div>
          <div className="system__table">
            <div className="system__tr system__tr--head">
              <span>PID</span>
              <span>ИМЯ</span>
              <span>СТАТУС</span>
              <span>CPU</span>
            </div>
            {processes.map((process) => (
              <div className="system__tr" key={`${process.pid}-${process.name}`}>
                <span className="muted">{process.pid}</span>
                <span>{process.name}</span>
                <span className={process.status === 'работает' ? 'live' : 'muted'}>
                  {process.status}
                </span>
                <span className="muted">{process.load}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="system__section">
          <div className="section-label">ЦЕЛОСТНОСТЬ КОНТУРА</div>
          <div className={`system__integrity system__integrity--${integrity}`}>
            <div className="system__integrity-head">
              <div>
                <b>
                  {integrity === 'idle'
                    ? 'ПРОВЕРКА НЕ ЗАПУЩЕНА'
                    : integrity === 'running'
                      ? 'СВЕРКА СЕКТОРОВ…'
                      : '99.7% · ОДИН ФАЙЛ ИЗМЕНЁН ИЗВНЕ'}
                </b>
                <span>
                  {integrity === 'done'
                    ? 'рекомендуется не открывать .протокол'
                    : 'последняя сверка: 04.11.1997 04:04'}
                </span>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => setIntegrity('running')}
                disabled={integrity === 'running'}
              >
                <Icon name="check" size={13} />
                {integrity === 'running' ? 'СВЕРКА…' : 'ПРОВЕРИТЬ'}
              </button>
            </div>
            {(integrity === 'running' || integrity === 'done') && (
              <div className="system__bar system__bar--integrity">
                <span style={{ width: `${integrity === 'done' ? 100 : progress}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="system__footer">
          <span>MATRIXX OS 0.9.7 · matrixx-0.9.7</span>
          <span>НИИ-9 · СЕКТОР 4 · ТЕРМИНАЛ 04</span>
          <span>ОБЪЕКТ 09: НЕТ ОТВЕТА</span>
        </div>
      </div>
    </div>
  )
}
