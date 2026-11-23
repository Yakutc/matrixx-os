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
  const [tab, setTab] = useState<'resources' | 'processes'>('resources')
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
        triggerSignal()
        notify('Integrity check: 99.7% — one file was modified externally', 'danger')
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
    const accent = styles.getPropertyValue('--accent').trim() || '#e95420'
    const grid = styles.getPropertyValue('--border').trim() || 'rgba(255,255,255,.12)'
    context.clearRect(0, 0, width, height)
    context.strokeStyle = grid
    context.lineWidth = 1
    for (let x = 0; x < width; x += 28) {
      context.beginPath()
      context.moveTo(x + 0.5, 0)
      context.lineTo(x + 0.5, height)
      context.stroke()
    }
    for (let y = 0; y < height; y += 18) {
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
    context.lineWidth = 2
    context.stroke()
    context.lineTo(width, height)
    context.lineTo(0, height)
    context.closePath()
    context.fillStyle = 'rgba(233, 84, 32, 0.18)'
    context.fill()
  }, [history, settings.theme])

  const cpu = history[history.length - 1] ?? 0
  const { hours, minutes, seconds } = timeParts(now)
  const processes = [
    { pid: '1', name: 'systemd', status: 'Sleeping', load: '0%' },
    { pid: '472', name: 'matrixx-receiver', status: 'Waiting', load: '0%' },
    { pid: '612', name: 'gnome-shell', status: 'Running', load: '6%' },
    { pid: '704', name: 'Xwayland', status: 'Running', load: '2%' },
    { pid: '819', name: 'gdm', status: 'Sleeping', load: '0%' },
    ...windows.map((win, index) => ({
      pid: String(900 + index),
      name: APP_META[win.appId].short.toLowerCase().replace(/\s+/g, '-'),
      status: win.minimized ? 'Sleeping' : 'Running',
      load: `${3 + index * 2}%`,
    })),
    { pid: '999', name: 'sector9-signal', status: 'Waiting', load: '0%' },
  ]

  return (
    <div className="system">
      <div className="system__head">
        <div>
          <div className="system__title">System Monitor</div>
          <div className="system__subtitle">Matrixx Linux 24.04 LTS · Wayland</div>
        </div>
        <div className="system__clock">
          <b>
            {hours}:{minutes}:{seconds}
          </b>
          <span>Uptime {uptimeLabel()}</span>
        </div>
      </div>

      <div className="system__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'resources'}
          className={tab === 'resources' ? 'is-active' : ''}
          onClick={() => setTab('resources')}
        >
          Resources
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'processes'}
          className={tab === 'processes' ? 'is-active' : ''}
          onClick={() => setTab('processes')}
        >
          Processes
        </button>
      </div>

      <div className="system__scroll">
        {tab === 'resources' ? (
          <>
            <div className="system__stats">
              <div className="system__stat system__stat--wide">
                <div className="system__stat-label">CPU Usage</div>
                <div className="system__stat-value">
                  {Math.round(cpu)}
                  <span>%</span>
                </div>
                <canvas ref={canvasRef} className="system__chart" aria-label="CPU usage graph" />
              </div>
              <div className="system__stat">
                <div className="system__stat-label">Memory</div>
                <div className="system__stat-value">
                  61<span>%</span>
                </div>
                <div className="system__bar">
                  <span style={{ width: '61%' }} />
                </div>
                <div className="system__stat-foot">392 MiB / 640 MiB</div>
              </div>
              <div className="system__stat">
                <div className="system__stat-label">Temperature</div>
                <div className="system__stat-value">
                  47.2<span>°C</span>
                </div>
                <div className="system__stat-foot">Thermal state normal</div>
              </div>
              <div className="system__stat">
                <div className="system__stat-label">Signal</div>
                <div className="system__stat-value system__stat-value--accent">
                  47.2<span>Hz</span>
                </div>
                <div className="system__stat-foot">Awaiting response</div>
              </div>
            </div>

            <div className="system__section">
              <div className="system__section-title">File System Integrity</div>
              <div className={`system__integrity system__integrity--${integrity}`}>
                <div className="system__integrity-head">
                  <div>
                    <b>
                      {integrity === 'idle'
                        ? 'Check has not been run'
                        : integrity === 'running'
                          ? 'Verifying sectors…'
                          : '99.7% — one file was modified externally'}
                    </b>
                    <span>
                      {integrity === 'done'
                        ? 'Recommendation: do not open .protocol'
                        : 'Last check: 2026-11-24 04:04'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIntegrity('running')}
                    disabled={integrity === 'running'}
                  >
                    <Icon name="check" size={15} />
                    {integrity === 'running' ? 'Checking…' : 'Check Integrity'}
                  </button>
                </div>
                {(integrity === 'running' || integrity === 'done') && (
                  <div className="system__bar system__bar--integrity">
                    <span style={{ width: `${integrity === 'done' ? 100 : progress}%` }} />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="system__section">
            <div className="system__section-title">Processes</div>
            <div className="system__table">
              <div className="system__tr system__tr--head">
                <span>PID</span>
                <span>Name</span>
                <span>Status</span>
                <span>CPU</span>
              </div>
              {processes.map((process) => (
                <div className="system__tr" key={`${process.pid}-${process.name}`}>
                  <span className="muted">{process.pid}</span>
                  <span>{process.name}</span>
                  <span className={process.status === 'Running' ? 'live' : 'muted'}>
                    {process.status}
                  </span>
                  <span className="muted">{process.load}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="system__footer">
          <span>Matrixx Linux 24.04 LTS · 6.8.0-matrixx</span>
          <span>GNOME 46 · Wayland</span>
          <span>Sector 09: no response</span>
        </div>
      </div>
    </div>
  )
}
