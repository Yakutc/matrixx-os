import { useEffect, useRef, useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import { KEYS, readObject, writeJson } from '../../os/storage'
import type { AppProps } from '../../os/types'
import { FmEngine, PRESETS, type FmPresetId } from './engine'

interface StoredFm {
  preset: FmPresetId
  bpm: number
  volume: number
}

function validPreset(value: unknown): value is FmPresetId {
  return value === 'night' || value === 'chase' || value === 'signal'
}

function loadFm(): StoredFm {
  const stored = readObject<Partial<StoredFm>>(KEYS.fm, {})
  const preset = validPreset(stored.preset) ? stored.preset : 'night'
  const bpm =
    typeof stored.bpm === 'number' && Number.isFinite(stored.bpm)
      ? Math.min(120, Math.max(70, Math.round(stored.bpm)))
      : PRESETS[preset].bpm
  const volume =
    typeof stored.volume === 'number' && Number.isFinite(stored.volume)
      ? Math.min(1, Math.max(0, stored.volume))
      : 0.6
  return { preset, bpm, volume }
}

export default function FmApp(_props: AppProps) {
  const { settings } = useOS()
  const initial = useRef(loadFm())
  const [preset, setPreset] = useState<FmPresetId>(initial.current.preset)
  const [bpm, setBpm] = useState(initial.current.bpm)
  const [volume, setVolume] = useState(initial.current.volume)
  const [playing, setPlaying] = useState(false)
  const engineRef = useRef<FmEngine | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  if (!engineRef.current) {
    engineRef.current = new FmEngine()
    engineRef.current.setPreset(initial.current.preset)
    engineRef.current.setBpm(initial.current.bpm)
    engineRef.current.setVolume(initial.current.volume)
  }

  useEffect(() => {
    writeJson(KEYS.fm, { preset, bpm, volume })
  }, [preset, bpm, volume])

  useEffect(() => {
    return () => {
      engineRef.current?.dispose()
    }
  }, [])

  useEffect(() => {
    if (!settings.sound && playing) {
      engineRef.current?.stop()
      setPlaying(false)
    }
  }, [playing, settings.sound])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    const data = new Uint8Array(128)

    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr))
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      if (width === 0 || height === 0) return
      if (canvas.width !== Math.floor(width * dpr)) resize()
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const styles = getComputedStyle(document.documentElement)
      const accent = styles.getPropertyValue('--accent').trim() || '#e95420'
      const green = styles.getPropertyValue('--green').trim() || '#2ec27e'
      const line = styles.getPropertyValue('--border').trim() || 'rgba(255,255,255,.12)'
      const surface = styles.getPropertyValue('--surface-sunken').trim() || '#1a1a1a'
      const muted = styles.getPropertyValue('--text-muted').trim() || '#9a9a9a'
      context.fillStyle = surface
      context.fillRect(0, 0, width, height)
      context.strokeStyle = line
      context.lineWidth = 1
      for (let x = 0; x < width; x += 32) {
        context.beginPath()
        context.moveTo(x + 0.5, 0)
        context.lineTo(x + 0.5, height)
        context.stroke()
      }

      const analyser = engineRef.current?.analyserNode
      if (analyser && engineRef.current?.isPlaying) {
        analyser.getByteFrequencyData(data)
        const bars = 44
        const gap = 2
        const barWidth = Math.max(2, width / bars - gap)
        const step = Math.floor(data.length / bars)
        for (let index = 0; index < bars; index += 1) {
          const value = data[index * step] / 255
          const barHeight = Math.max(2, value * height * 0.82)
          context.fillStyle = index % 6 === 0 ? green : accent
          context.globalAlpha = 0.38 + value * 0.62
          context.fillRect(index * (barWidth + gap) + 2, height - barHeight, barWidth, barHeight)
        }
        context.globalAlpha = 1
      } else {
        const phase = time / 900
        context.strokeStyle = accent
        context.globalAlpha = 0.45
        context.lineWidth = 1.5
        context.beginPath()
        for (let x = 0; x <= width; x += 2) {
          const y = height * 0.55 + Math.sin(x / 52 + phase) * height * 0.06
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
        context.globalAlpha = 1
        context.fillStyle = muted
        context.font = '12px Ubuntu, sans-serif'
        context.fillText('Stopped — press play to start the engine', 12, height - 12)
      }
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [playing, settings.theme])

  const toggle = async () => {
    const engine = engineRef.current
    if (!engine) return
    if (playing) {
      engine.stop()
      setPlaying(false)
      return
    }
    engine.setPreset(preset)
    engine.setBpm(bpm)
    engine.setVolume(volume)
    const started = await engine.start()
    setPlaying(started)
  }

  const choosePreset = (next: FmPresetId) => {
    setPreset(next)
    setBpm(PRESETS[next].bpm)
    engineRef.current?.setPreset(next)
  }

  const changeBpm = (value: number) => {
    setBpm(value)
    engineRef.current?.setBpm(value)
  }

  const changeVolume = (value: number) => {
    setVolume(value)
    engineRef.current?.setVolume(value)
  }

  const current = PRESETS[preset]

  return (
    <div className="fm">
      <div className="fm__head">
        <div>
          <div className="fm__kicker">Now Playing</div>
          <div className="fm__title">{current.title}</div>
          <div className="fm__subtitle">{current.subtitle}</div>
        </div>
        <div className={`fm__state ${playing ? 'is-live' : ''}`}>
          <span className={playing ? 'led' : 'led led--accent'} />
          {playing ? 'Playing' : 'Stopped'}
        </div>
      </div>

      <div className="fm__main">
        <div className="fm__art" data-preset={preset}>
          <span>M</span>
          <small>Matrixx Music</small>
        </div>
        <div className="fm__viz-wrap">
          <canvas ref={canvasRef} className="fm__viz" aria-label="Audio spectrum" />
          <div className="fm__freqs" aria-hidden="true">
            <span>47.2</span>
            <span>94.4</span>
            <span>141.6</span>
          </div>
        </div>
      </div>

      <div className="fm__controls">
        <button
          type="button"
          className={`fm__play ${playing ? 'is-playing' : ''}`}
          onClick={() => void toggle()}
          disabled={!settings.sound}
          aria-label={playing ? 'Stop' : 'Play'}
        >
          <Icon name={playing ? 'stop' : 'play'} size={20} />
        </button>
        <div className="fm__control">
          <div className="fm__control-head">
            <span>Tempo</span>
            <b>{bpm} BPM</b>
          </div>
          <input
            type="range"
            min="70"
            max="120"
            value={bpm}
            onChange={(event) => changeBpm(Number(event.target.value))}
            aria-label="Tempo"
          />
        </div>
        <div className="fm__control">
          <div className="fm__control-head">
            <span>Volume</span>
            <b>{Math.round(volume * 100)}%</b>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(event) => changeVolume(Number(event.target.value) / 100)}
            aria-label="Volume"
          />
        </div>
      </div>

      <div className="fm__presets" role="group" aria-label="Presets">
        {(Object.keys(PRESETS) as FmPresetId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`fm__preset ${preset === id ? 'is-active' : ''}`}
            onClick={() => choosePreset(id)}
            aria-pressed={preset === id}
          >
            <span>{PRESETS[id].title}</span>
            <span>{PRESETS[id].bpm} BPM</span>
          </button>
        ))}
      </div>

      <div className="fm__foot">
        {settings.sound ? (
          <span>Generative Web Audio · no samples, no network</span>
        ) : (
          <span className="danger">System sounds are off — enable them in Quick Settings</span>
        )}
        <span>Matrixx Linux</span>
      </div>
    </div>
  )
}
