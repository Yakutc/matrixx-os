import { useCallback, useEffect, useRef, useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import { KEYS, readObject, writeJson } from '../../os/storage'
import type { AppProps } from '../../os/types'
import {
  COLS,
  ROWS,
  createInitialState,
  step,
  turnDirection,
  type Point,
  type SnakeState,
} from './logic'

type Status = 'ready' | 'playing' | 'paused' | 'over'

const CELL = 20
const WIDTH = COLS * CELL
const HEIGHT = ROWS * CELL

const DIRECTIONS: Record<string, Point> = {
  arrowup: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
}

function readBest(): number {
  const stored = readObject<{ best?: unknown }>(KEYS.snake, {})
  return typeof stored.best === 'number' && Number.isFinite(stored.best)
    ? Math.max(0, Math.floor(stored.best))
    : 0
}

export default function SnakeApp({ windowId }: AppProps) {
  const { activeId, settings, playSound } = useOS()
  const [status, setStatus] = useState<Status>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<SnakeState>(createInitialState())
  const queueRef = useRef<Point[]>([])
  const statusRef = useRef<Status>('ready')
  const scoreRef = useRef(0)
  const bestRef = useRef(best)
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const colorsRef = useRef({
    bg: '#0a0f0b',
    panel: '#0c120d',
    line: '#233126',
    live: '#b6ff5c',
    accent: '#ffb347',
    danger: '#ff5540',
  })

  const startGame = useCallback(() => {
    gameRef.current = createInitialState()
    queueRef.current = []
    scoreRef.current = 0
    setScore(0)
    statusRef.current = 'playing'
    setStatus('playing')
    playSound('click')
  }, [playSound])

  const togglePause = useCallback(() => {
    if (statusRef.current === 'playing') {
      statusRef.current = 'paused'
      setStatus('paused')
    } else if (statusRef.current === 'paused') {
      statusRef.current = 'playing'
      setStatus('playing')
    }
  }, [])

  const turn = useCallback((direction: Point) => {
    const current = queueRef.current[queueRef.current.length - 1] ?? gameRef.current.dir
    const next = turnDirection(current, direction)
    if (next === current) return
    if (queueRef.current.length < 3) queueRef.current.push(next)
  }, [])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement)
    colorsRef.current = {
      bg: styles.getPropertyValue('--bg-2').trim() || '#0a0f0b',
      panel: styles.getPropertyValue('--panel').trim() || '#0c120d',
      line: styles.getPropertyValue('--line').trim() || '#233126',
      live: styles.getPropertyValue('--live').trim() || '#b6ff5c',
      accent: styles.getPropertyValue('--accent').trim() || '#ffb347',
      danger: styles.getPropertyValue('--danger').trim() || '#ff5540',
    }
  }, [settings.theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = WIDTH * dpr
    canvas.height = HEIGHT * dpr
    const context = canvas.getContext('2d')
    if (!context) return
    let raf = 0
    let last = performance.now()
    let accumulated = 0

    const draw = (time: number) => {
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const colors = colorsRef.current
      context.fillStyle = colors.bg
      context.fillRect(0, 0, WIDTH, HEIGHT)
      context.fillStyle = colors.line
      for (let y = 0; y < ROWS; y += 1) {
        for (let x = 0; x < COLS; x += 1) {
          context.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 1)
        }
      }
      const game = gameRef.current
      const pulse = 0.68 + Math.sin(time / 220) * 0.28
      context.save()
      context.translate(game.food.x * CELL + CELL / 2, game.food.y * CELL + CELL / 2)
      context.rotate(Math.PI / 4)
      context.fillStyle = colors.accent
      context.globalAlpha = pulse
      const size = CELL * 0.56
      context.fillRect(-size / 2, -size / 2, size, size)
      context.restore()
      game.snake.forEach((part, index) => {
        const head = index === 0
        context.fillStyle = game.alive ? (head ? colors.accent : colors.live) : colors.danger
        context.globalAlpha = head ? 1 : 0.86 - index * 0.012
        context.fillRect(
          part.x * CELL + 2,
          part.y * CELL + 2,
          CELL - 4,
          CELL - 4,
        )
      })
      context.globalAlpha = 1
      const head = game.snake[0]
      if (head) {
        context.fillStyle = colors.bg
        const eye = 3
        const offsetX = game.dir.x === 0 ? 5 : game.dir.x > 0 ? CELL - 7 : 3
        const offsetY = game.dir.y === 0 ? 5 : game.dir.y > 0 ? CELL - 7 : 3
        context.fillRect(head.x * CELL + offsetX, head.y * CELL + offsetY, eye, eye)
        context.fillRect(
          head.x * CELL + (game.dir.x === 0 ? CELL - 8 : offsetX),
          head.y * CELL + (game.dir.y === 0 ? CELL - 8 : offsetY),
          eye,
          eye,
        )
      }
    }

    const tick = () => {
      const game = gameRef.current
      const nextDir = queueRef.current.shift()
      if (nextDir) game.dir = nextDir
      const next = step(game)
      gameRef.current = next
      if (!next.alive) {
        statusRef.current = 'over'
        setStatus('over')
        playSound('error')
        if (next.score > bestRef.current) {
          bestRef.current = next.score
          setBest(next.score)
          writeJson(KEYS.snake, { best: next.score })
        }
        return
      }
      scoreRef.current = next.score
      setScore(next.score)
    }

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop)
      const delta = Math.min(120, time - last)
      last = time
      if (statusRef.current === 'playing') {
        accumulated += delta
        const interval = Math.max(72, 152 - Math.floor(scoreRef.current / 5) * 12)
        while (accumulated >= interval) {
          accumulated -= interval
          tick()
          if (statusRef.current !== 'playing') break
        }
      }
      draw(time)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playSound])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (activeId !== windowId) return
      const key = event.key.toLowerCase()
      if (key === 'r') {
        event.preventDefault()
        startGame()
        return
      }
      if (key === ' ' || key === 'enter') {
        event.preventDefault()
        if (statusRef.current === 'playing') {
          togglePause()
          return
        }
        if (statusRef.current === 'paused') {
          togglePause()
          return
        }
        startGame()
        return
      }
      const direction = DIRECTIONS[key]
      if (!direction) return
      event.preventDefault()
      if (statusRef.current === 'ready' || statusRef.current === 'over') {
        startGame()
      }
      turn(direction)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId, windowId, startGame, togglePause, turn])

  useEffect(() => {
    if (activeId !== windowId && statusRef.current === 'playing') {
      statusRef.current = 'paused'
      setStatus('paused')
    }
  }, [activeId, windowId])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === 'playing') {
        statusRef.current = 'paused'
        setStatus('paused')
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    if (touch) touchRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchRef.current
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return
    if (statusRef.current === 'ready' || statusRef.current === 'over') startGame()
    if (Math.abs(dx) > Math.abs(dy)) turn({ x: dx > 0 ? 1 : -1, y: 0 })
    else turn({ x: 0, y: dy > 0 ? 1 : -1 })
  }

  const level = 1 + Math.floor(score / 5)

  return (
    <div className="snake" data-status={status}>
      <div className="snake__head">
        <div className="snake__metric">
          <span>СЧЁТ</span>
          <b>{String(score).padStart(3, '0')}</b>
        </div>
        <div className="snake__metric">
          <span>РЕКОРД</span>
          <b>{String(best).padStart(3, '0')}</b>
        </div>
        <div className="snake__metric">
          <span>СКОРОСТЬ</span>
          <b>{String(level).padStart(2, '0')}</b>
        </div>
        <div className="snake__status">
          <span className={status === 'playing' ? 'led' : 'led led--accent'} />
          {status === 'playing'
            ? 'ПОТОК АКТИВЕН'
            : status === 'paused'
              ? 'ПАУЗА'
              : status === 'over'
                ? 'СИГНАЛ ПОТЕРЯН'
                : 'ОЖИДАНИЕ'}
        </div>
      </div>

      <div className="snake__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <canvas
          ref={canvasRef}
          className="snake__canvas"
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          role="img"
          aria-label="Игровое поле змейки"
        />
        <div className="snake__scan" aria-hidden="true" />
        {status !== 'playing' && (
          <div className="snake__overlay">
            {status === 'ready' && (
              <>
                <div className="snake__brand">ЗМЕЙ</div>
                <div className="snake__sub">ПРОТОКОЛ 09 / ТРЕНИРОВКА КОНТУРА</div>
                <p className="snake__text">
                  Соберите сигнал. Не касайтесь стен и собственного следа. Каждые пять единиц
                  скорость растёт.
                </p>
                <button type="button" className="btn btn--solid snake__start" onClick={startGame}>
                  <Icon name="play" size={13} />
                  НАЧАТЬ
                </button>
              </>
            )}
            {status === 'paused' && (
              <>
                <div className="snake__brand">ПАУЗА</div>
                <div className="snake__sub">ПОТОК ПРИОСТАНОВЛЕН</div>
                <button type="button" className="btn btn--solid snake__start" onClick={togglePause}>
                  <Icon name="play" size={13} />
                  ПРОДОЛЖИТЬ
                </button>
              </>
            )}
            {status === 'over' && (
              <>
                <div className="snake__brand snake__brand--danger">СИГНАЛ ПОТЕРЯН</div>
                <div className="snake__sub">
                  СЧЁТ {String(score).padStart(3, '0')} · РЕКОРД {String(best).padStart(3, '0')}
                </div>
                <p className="snake__text">
                  {score >= best && score > 0
                    ? 'новый рекорд записан в контур.'
                    : 'контур остывает. попробуйте ещё раз.'}
                </p>
                <button type="button" className="btn btn--solid snake__start" onClick={startGame}>
                  <Icon name="reboot" size={13} />
                  ЗАНОВО
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="snake__foot">
        <span>СТРЕЛКИ / WASD — ДВИЖЕНИЕ</span>
        <span>ПРОБЕЛ — ПАУЗА</span>
        <span>R — ЗАНОВО</span>
      </div>
    </div>
  )
}
