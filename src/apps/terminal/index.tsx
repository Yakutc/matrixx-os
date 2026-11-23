import { useEffect, useRef, useState } from 'react'
import { APP_META, APP_ORDER, isAppId } from '../../os/apps'
import { useOS } from '../../os/OSProvider'
import type { AppId, AppProps, ThemeId } from '../../os/types'
import {
  listDir,
  normalizePath,
  readTextFile,
  resolveDir,
  type FsNode,
} from '../../data/filesystem'
import { parseCommand } from './parse'

type LineKind = 'cmd' | 'out' | 'sys' | 'err' | 'accent' | 'ok'

interface Line {
  id: number
  kind: LineKind
  text: string
  prompt?: string
}

const COMMANDS = [
  'help',
  'ls',
  'cd',
  'pwd',
  'cat',
  'open',
  'clear',
  'whoami',
  'date',
  'echo',
  'theme',
  'crt',
  'sound',
  'matrix',
  'neofetch',
  'signal',
  'sudo',
  'history',
  'banner',
  'exit',
]

const ALIASES: Record<string, AppId> = {
  terminal: 'terminal',
  терминал: 'terminal',
  files: 'files',
  архив: 'files',
  notes: 'notes',
  журнал: 'notes',
  settings: 'settings',
  настройки: 'settings',
  system: 'system',
  система: 'system',
  snake: 'snake',
  змей: 'snake',
  fm: 'fm',
  radio: 'fm',
  about: 'about',
  'о системе': 'about',
}

const THEMES: ThemeId[] = ['phosphor', 'amber', 'bone']
const HOME = '/home/operator'
const SESSION_START = Date.now()

const BANNER = [
  'MATRIXX MSH 0.9.7 / КОНТУР 04',
  'СЕАНС ВОССТАНОВЛЕН. ОПЕРАТОР НЕ ПОДТВЕРЖДЁН.',
  'Введите help. Не открывайте .протокол без распоряжения.',
]

const HELP = `ДОСТУПНЫЕ КОМАНДЫ

  help            этот список
  ls [-a] [путь]  содержимое каталога
  cd [путь]       сменить каталог
  pwd             текущий каталог
  cat <файл>      прочитать файл
  open <модуль>   открыть приложение
  clear           очистить экран
  whoami          текущий оператор
  date            системное время
  echo <текст>    вывести строку
  theme <имя>     phosphor | amber | bone
  crt <on|off>    эффекты экрана
  sound <on|off>  звук интерфейса
  matrix          запустить поток
  neofetch        сведения о системе
  signal          проверить частоту 47.2
  history         история команд
  banner          снова показать метку
  exit            выйти из оболочки`

const LOGO = `  ▄▄▄▄▄▄▄▄▄▄▄▄
  █  M A T   █
  █  R I X   █
  █  0 9 7   █
  ▀▀▀▀▀▀▀▀▀▀▀▀`

function promptFor(cwd: string): string {
  const path = cwd === HOME ? '~' : cwd
  return `operator@matrixx:${path}$`
}

function nodeLabel(node: FsNode): string {
  return node.type === 'dir' ? `${node.name}/` : node.name
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const context = canvas.getContext('2d')
    if (!context) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = parent.clientWidth
    const height = parent.clientHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.scale(dpr, dpr)
    const fontSize = 13
    const columns = Math.max(1, Math.floor(width / 14))
    const drops = Array.from({ length: columns }, () => Math.random() * height)
    const glyphs = '01МАТРИКСОПЕРАТОР09747xX#$%&'
    let frame = 0
    let raf = 0
    let last = 0

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      if (time - last < 55) return
      last = time
      frame += 1
      context.fillStyle = 'rgba(5, 8, 6, 0.2)'
      context.fillRect(0, 0, width, height)
      context.font = `${fontSize}px "IBM Plex Mono", monospace`
      for (let index = 0; index < columns; index += 1) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)]
        const x = index * 14 + 2
        const y = drops[index]
        context.fillStyle = Math.random() > 0.82 ? '#ffb347' : '#b6ff5c'
        context.fillText(char, x, y)
        drops[index] = y > height + Math.random() * 90 ? 0 : y + 13
      }
      if (frame > 90) {
        context.fillStyle = 'rgba(5, 8, 6, 0.6)'
        context.fillRect(0, 0, width, height)
      }
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="term__rain" aria-hidden="true" />
}

export default function TerminalApp({ windowId, payload }: AppProps) {
  const {
    openWindow,
    settings,
    setSettings,
    triggerSignal,
    playSound,
    activeId,
    windows,
  } = useOS()
  const [cwd, setCwd] = useState(HOME)
  const [value, setValue] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [matrixOn, setMatrixOn] = useState(false)
  const idRef = useRef(0)
  const booted = useRef(false)
  const initialCommand = useRef(false)
  const historyIndex = useRef(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const matrixTimer = useRef<number | null>(null)

  const line = (kind: LineKind, text: string, prompt?: string): Line => ({
    id: ++idRef.current,
    kind,
    text,
    prompt,
  })

  const push = (kind: LineKind, text: string) => {
    setLines((current) => [...current, line(kind, text)])
  }

  const pushBlock = (kind: LineKind, text: string) => {
    const rows = text.split('\n')
    setLines((current) => [
      ...current,
      ...rows.map((row) => line(kind, row)),
    ])
  }

  const showBanner = () => {
    setLines((current) => [
      ...current,
      line('accent', LOGO),
      ...BANNER.map((text) => line('sys', text)),
      line('out', ''),
    ])
  }

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    showBanner()
  }, [])

  useEffect(() => {
    const scroll = scrollRef.current
    if (!scroll) return
    scroll.scrollTop = scroll.scrollHeight
  }, [lines, matrixOn])

  useEffect(() => {
    if (activeId === windowId) inputRef.current?.focus()
  }, [activeId, windowId])

  useEffect(() => {
    const command = (payload as { command?: unknown } | undefined)?.command
    if (initialCommand.current || typeof command !== 'string' || !command.trim()) return
    initialCommand.current = true
    const timer = window.setTimeout(() => run(command), 160)
    return () => window.clearTimeout(timer)
  }, [payload])

  useEffect(() => {
    return () => {
      if (matrixTimer.current) window.clearTimeout(matrixTimer.current)
    }
  }, [])

  const finishOutput = (kind: LineKind, text: string) => {
    push(kind, text)
  }

  const run = (rawInput: string) => {
    const parsed = parseCommand(rawInput)
    if (!parsed) return
    const prompt = promptFor(cwd)
    setLines((current) => [...current, line('cmd', rawInput, prompt)])
    setHistory((current) => [...current, rawInput])
    historyIndex.current = -1
    setValue('')
    const { name, args } = parsed
    const argText = args.join(' ')

    if (name === 'help') {
      pushBlock('out', HELP)
      return
    }

    if (name === 'ls') {
      const showHidden = args.includes('-a')
      const pathArg = args.find((arg) => !arg.startsWith('-'))
      const target = pathArg ? normalizePath(cwd, pathArg) : cwd
      const dir = resolveDir(target)
      if (!dir) {
        finishOutput('err', `ls: каталог не найден: ${pathArg ?? target}`)
        return
      }
      const nodes = listDir(target, showHidden)
      if (nodes.length === 0) {
        finishOutput('sys', 'каталог пуст')
        return
      }
      for (const node of nodes) {
        finishOutput(node.type === 'dir' ? 'accent' : 'out', nodeLabel(node))
      }
      return
    }

    if (name === 'cd') {
      const target = args[0] ? normalizePath(cwd, args[0]) : HOME
      if (!resolveDir(target)) {
        finishOutput('err', `cd: каталог не найден: ${args[0] ?? ''}`)
        return
      }
      setCwd(target)
      return
    }

    if (name === 'pwd') {
      finishOutput('out', cwd)
      return
    }

    if (name === 'cat') {
      if (!args[0]) {
        finishOutput('err', 'cat: укажите файл')
        return
      }
      const target = normalizePath(cwd, args[0])
      const file = readTextFile(target)
      if (!file) {
        finishOutput('err', `cat: файл не найден: ${args[0]}`)
        return
      }
      pushBlock(file.hidden ? 'accent' : 'out', file.content)
      if (file.hidden) finishOutput('err', 'этот файл не должен был открыться.')
      return
    }

    if (name === 'open') {
      if (!args[0]) {
        finishOutput('sys', `модули: ${APP_ORDER.map((id) => APP_META[id].title).join(' · ')}`)
        return
      }
      const key = argText.toLowerCase()
      const candidate = Object.hasOwn(ALIASES, key) ? ALIASES[key] : undefined
      const alias = candidate && isAppId(candidate) ? candidate : undefined
      if (!alias) {
        finishOutput('err', `open: неизвестный модуль: ${argText}`)
        return
      }
      openWindow(alias)
      finishOutput('ok', `запуск: ${APP_META[alias].title}`)
      return
    }

    if (name === 'clear') {
      setLines([])
      return
    }

    if (name === 'whoami') {
      finishOutput('out', 'оператор (слот 09) · допуск не подтверждён')
      return
    }

    if (name === 'date') {
      finishOutput('out', new Date().toLocaleString('ru-RU'))
      return
    }

    if (name === 'echo') {
      finishOutput('out', args.join(' '))
      return
    }

    if (name === 'theme') {
      if (!args[0]) {
        finishOutput('sys', `текущая тема: ${settings.theme} · доступно: ${THEMES.join(' · ')}`)
        return
      }
      if (!THEMES.includes(args[0] as ThemeId)) {
        finishOutput('err', `theme: неизвестная тема: ${args[0]}`)
        return
      }
      setSettings({ theme: args[0] as ThemeId })
      finishOutput('ok', `тема: ${args[0]}`)
      return
    }

    if (name === 'crt') {
      if (args[0] !== 'on' && args[0] !== 'off') {
        finishOutput('sys', `crt: сейчас ${settings.crt ? 'on' : 'off'} · используйте on/off`)
        return
      }
      setSettings({ crt: args[0] === 'on' })
      finishOutput('ok', `crt: ${args[0]}`)
      return
    }

    if (name === 'sound') {
      if (args[0] !== 'on' && args[0] !== 'off') {
        finishOutput('sys', `sound: сейчас ${settings.sound ? 'on' : 'off'} · используйте on/off`)
        return
      }
      setSettings({ sound: args[0] === 'on' })
      finishOutput('ok', `sound: ${args[0]}`)
      return
    }

    if (name === 'matrix') {
      setMatrixOn(true)
      finishOutput('ok', 'поток запущен. не смотрите в центр.')
      if (matrixTimer.current) window.clearTimeout(matrixTimer.current)
      matrixTimer.current = window.setTimeout(() => setMatrixOn(false), 4600)
      return
    }

    if (name === 'neofetch') {
      const uptime = Math.floor((Date.now() - SESSION_START) / 1000)
      pushBlock('accent', LOGO)
      finishOutput('out', '')
      finishOutput('out', 'ОПЕРАТОР ....... оператор (слот 09)')
      finishOutput('out', 'ХОСТ ........... терминал 04 / НИИ-9')
      finishOutput('out', 'СИСТЕМА ........ matrixx 0.9.7 recovery')
      finishOutput('out', 'ОБОЛОЧКА ....... msh 0.9')
      finishOutput('out', `ТЕМА ........... ${settings.theme}`)
      finishOutput('out', `ОКНА ........... ${windows.length}`)
      finishOutput('out', `СЕАНС .......... ${uptime} с`)
      finishOutput('out', 'СИГНАЛ ......... 47.2 Гц / ожидание')
      return
    }

    if (name === 'signal') {
      triggerSignal()
      playSound('error')
      finishOutput('accent', '47.2 Гц. ответ получен.')
      finishOutput('err', 'не отвечай.')
      return
    }

    if (name === 'sudo') {
      finishOutput('err', 'у оператора нет прав. и это к лучшему.')
      return
    }

    if (name === 'history') {
      if (history.length === 0) {
        finishOutput('sys', 'история пуста')
        return
      }
      history.forEach((item, index) => {
        finishOutput('out', `${String(index + 1).padStart(2, '0')}  ${item}`)
      })
      return
    }

    if (name === 'banner') {
      showBanner()
      return
    }

    if (name === 'exit') {
      finishOutput('err', 'выход невозможен. контур не отпускает.')
      return
    }

    finishOutput('err', `команда не найдена: ${name}. введите help.`)
  }

  const complete = () => {
    if (!value) {
      pushBlock('sys', `доступно: ${COMMANDS.join('  ')}`)
      return
    }
    const matches = COMMANDS.filter((command) => command.startsWith(value.toLowerCase()))
    if (matches.length === 1) {
      setValue(`${matches[0]} `)
      return
    }
    if (matches.length > 1) {
      pushBlock('sys', matches.join('  '))
    }
  }

  return (
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Терминал MATRIXX"
    >
      <div className="term__meta">
        <span>MSH 0.9.7</span>
        <span>КОНТУР 04 · {cwd}</span>
        <span className="live">● СВЯЗЬ</span>
      </div>
      <div className="term__scroll" ref={scrollRef}>
        {lines.map((entry) => (
          <div key={entry.id} className={`term__line term__line--${entry.kind}`}>
            {entry.prompt && <span className="term__prompt">{entry.prompt}</span>}
            {entry.kind === 'cmd' && entry.prompt ? ' ' : ''}
            <span>{entry.text}</span>
          </div>
        ))}
        <div className="term__inputline">
          <span className="term__prompt">{promptFor(cwd)}</span>
          <input
            ref={inputRef}
            className="term__input"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              historyIndex.current = -1
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (value.trim()) run(value)
                return
              }
              if (event.key === 'Tab') {
                event.preventDefault()
                complete()
                return
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                if (history.length === 0) return
                const next =
                  historyIndex.current < 0
                    ? history.length - 1
                    : Math.max(0, historyIndex.current - 1)
                historyIndex.current = next
                setValue(history[next])
                return
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                if (historyIndex.current < 0) return
                const next = historyIndex.current + 1
                if (next >= history.length) {
                  historyIndex.current = -1
                  setValue('')
                  return
                }
                historyIndex.current = next
                setValue(history[next])
              }
            }}
            aria-label="Ввод команды"
            autoComplete="off"
            spellCheck={false}
            style={{ width: `${Math.max(1, value.length)}ch` }}
          />
          <span className="term__caret" aria-hidden="true" />
        </div>
      </div>
      {matrixOn && <MatrixRain />}
    </div>
  )
}
