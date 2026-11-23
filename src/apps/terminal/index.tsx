import { useEffect, useRef, useState } from 'react'
import { APP_META, APP_ORDER, isAppId } from '../../os/apps'
import { useOS } from '../../os/OSProvider'
import type { AppId, AppProps, ThemeId, WallpaperId } from '../../os/types'
import {
  formatBytes,
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
  'hostname',
  'uname',
  'uptime',
  'date',
  'echo',
  'theme',
  'wallpaper',
  'sound',
  'cmatrix',
  'matrix',
  'fastfetch',
  'neofetch',
  'signal',
  'apt',
  'sudo',
  'history',
  'banner',
  'exit',
]

const ALIASES: Record<string, AppId> = {
  terminal: 'terminal',
  files: 'files',
  nautilus: 'files',
  editor: 'notes',
  'text editor': 'notes',
  notes: 'notes',
  settings: 'settings',
  'system monitor': 'system',
  monitor: 'system',
  snake: 'snake',
  music: 'fm',
  player: 'fm',
  about: 'about',
}

const THEMES: ThemeId[] = ['dark', 'light', 'hc']
const WALLPAPERS: WallpaperId[] = ['noble', 'minimal', 'sunset']
const HOME = '/home/operator'

const BANNER = [
  'Matrixx Linux 24.04 LTS (GNU/Linux 6.8.0-matrixx x86_64)',
  'Last login: Mon Nov 24 03:41:02 2026 from tty1',
  'Type "help" to list available commands.',
]

const HELP = `Available commands

  help                   show this list
  ls [-a] [-l] [path]    list directory contents
  cd [path]              change directory
  pwd                    print working directory
  cat <file>             print a file
  open <app>             open an application
  clear                  clear the screen
  whoami                 print current user
  hostname               print host name
  uname -a               print kernel information
  uptime                 show system uptime
  date                   show current date
  echo <text>            print text
  theme <name>           dark | light | hc
  wallpaper <name>       noble | minimal | sunset
  sound <on|off>         toggle interface sounds
  cmatrix                run the matrix rain
  fastfetch              show system information
  signal                 check 47.2 Hz
  apt                    package manager demo
  sudo                   run a command as root
  history                command history
  banner                 print the system banner
  exit                   close the session`

const LOGO = `     ██████████
   ██          ██
  ██    ████    ██
  ██    ████    ██
  ██            ██
   ██          ██
     ██████████`

function promptFor(cwd: string): string {
  const path = cwd === HOME ? '~' : cwd.replace(HOME, '~')
  return `operator@matrixx:${path}$`
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
    const glyphs = '01MATRIXoperator9742$#%&'
    let frame = 0
    let raf = 0
    let last = 0

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      if (time - last < 55) return
      last = time
      frame += 1
      context.fillStyle = 'rgba(20, 20, 20, 0.22)'
      context.fillRect(0, 0, width, height)
      context.font = `${fontSize}px "Ubuntu Mono", monospace`
      for (let index = 0; index < columns; index += 1) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)]
        const x = index * 14 + 2
        const y = drops[index]
        context.fillStyle = Math.random() > 0.86 ? '#ffffff' : '#2ec27e'
        context.fillText(char, x, y)
        drops[index] = y > height + Math.random() * 90 ? 0 : y + 13
      }
      if (frame > 90) context.clearRect(0, 0, width, height)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} className="term__rain" aria-hidden="true" />
}

function nodeName(node: FsNode): string {
  return node.type === 'dir' ? `${node.name}/` : node.name
}

export default function TerminalApp({ windowId, payload }: AppProps) {
  const {
    openWindow,
    settings,
    setSettings,
    triggerSignal,
    playSound,
    activeId,
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
    setLines((current) => [...current, ...rows.map((row) => line(kind, row))])
  }

  const showBanner = () => {
    setLines((current) => [
      ...current,
      line('accent', 'Matrixx Linux 24.04 LTS'),
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
    const timer = window.setTimeout(() => run(command), 180)
    return () => window.clearTimeout(timer)
  }, [payload])

  useEffect(() => {
    return () => {
      if (matrixTimer.current) window.clearTimeout(matrixTimer.current)
    }
  }, [])

  const finishOutput = (kind: LineKind, text: string) => push(kind, text)

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
      const showHidden = args.some((arg) => arg.startsWith('-') && arg.includes('a'))
      const long = args.some((arg) => arg.startsWith('-') && arg.includes('l'))
      const pathArg = args.find((arg) => !arg.startsWith('-'))
      const target = pathArg ? normalizePath(cwd, pathArg) : cwd
      const dir = resolveDir(target)
      if (!dir) {
        finishOutput('err', `ls: cannot access '${pathArg ?? target}': No such file or directory`)
        return
      }
      const nodes = listDir(target, showHidden)
      if (nodes.length === 0) {
        finishOutput('sys', 'total 0')
        return
      }
      if (long) {
        finishOutput('out', 'total ' + nodes.length)
        for (const node of nodes) {
          const kind = node.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'
          const size = node.type === 'file' ? formatBytes(node.content) : '4096'
          finishOutput(
            node.type === 'dir' ? 'accent' : 'out',
            `${kind} 2 ${node.owner} ${node.owner} ${size.padEnd(7)} Nov 24 03:41 ${node.name}`,
          )
        }
        return
      }
      for (const node of nodes) {
        finishOutput(node.type === 'dir' ? 'accent' : 'out', nodeName(node))
      }
      return
    }

    if (name === 'cd') {
      if (args[0] === '~') {
        setCwd(HOME)
        return
      }
      const target = args[0] ? normalizePath(cwd, args[0]) : HOME
      if (!resolveDir(target)) {
        finishOutput('err', `cd: ${args[0] ?? ''}: No such file or directory`)
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
        finishOutput('err', 'cat: missing file operand')
        return
      }
      const target = normalizePath(cwd, args[0])
      const file = readTextFile(target)
      if (!file) {
        finishOutput('err', `cat: ${args[0]}: No such file or directory`)
        return
      }
      pushBlock(file.hidden ? 'accent' : 'out', file.content)
      if (file.hidden) finishOutput('err', 'You should not have opened that file.')
      return
    }

    if (name === 'open') {
      if (!args[0]) {
        finishOutput('sys', `Applications: ${APP_ORDER.map((id) => APP_META[id].title).join(', ')}`)
        return
      }
      const key = argText.toLowerCase()
      const candidate = Object.hasOwn(ALIASES, key) ? ALIASES[key] : undefined
      const alias = candidate && isAppId(candidate) ? candidate : undefined
      if (!alias) {
        finishOutput('err', `open: unknown application: ${argText}`)
        return
      }
      openWindow(alias)
      finishOutput('ok', `Launching ${APP_META[alias].title}…`)
      return
    }

    if (name === 'clear') {
      setLines([])
      return
    }

    if (name === 'whoami') {
      finishOutput('out', 'operator')
      return
    }

    if (name === 'hostname') {
      finishOutput('out', 'matrixx')
      return
    }

    if (name === 'uname') {
      finishOutput('out', 'Linux matrixx 6.8.0-matrixx #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux')
      return
    }

    if (name === 'uptime') {
      finishOutput('out', ' 03:47:02 up 9 min,  1 user,  load average: 0.47, 0.42, 0.19')
      return
    }

    if (name === 'date') {
      finishOutput('out', new Date().toString())
      return
    }

    if (name === 'echo') {
      finishOutput('out', args.join(' '))
      return
    }

    if (name === 'theme') {
      if (!args[0]) {
        finishOutput('sys', `Current theme: ${settings.theme} · available: ${THEMES.join(', ')}`)
        return
      }
      if (!THEMES.includes(args[0] as ThemeId)) {
        finishOutput('err', `theme: unknown theme: ${args[0]}`)
        return
      }
      setSettings({ theme: args[0] as ThemeId })
      finishOutput('ok', `Theme set to ${args[0]}`)
      return
    }

    if (name === 'wallpaper') {
      if (!args[0]) {
        finishOutput('sys', `Current wallpaper: ${settings.wallpaper} · available: ${WALLPAPERS.join(', ')}`)
        return
      }
      if (!WALLPAPERS.includes(args[0] as WallpaperId)) {
        finishOutput('err', `wallpaper: unknown wallpaper: ${args[0]}`)
        return
      }
      setSettings({ wallpaper: args[0] as WallpaperId })
      finishOutput('ok', `Wallpaper set to ${args[0]}`)
      return
    }

    if (name === 'sound') {
      if (args[0] !== 'on' && args[0] !== 'off') {
        finishOutput('sys', `sound: currently ${settings.sound ? 'on' : 'off'} · use on/off`)
        return
      }
      setSettings({ sound: args[0] === 'on' })
      finishOutput('ok', `sound: ${args[0]}`)
      return
    }

    if (name === 'matrix' || name === 'cmatrix') {
      setMatrixOn(true)
      finishOutput('ok', 'Starting matrix rain. Press Ctrl+C to stop.')
      if (matrixTimer.current) window.clearTimeout(matrixTimer.current)
      matrixTimer.current = window.setTimeout(() => setMatrixOn(false), 4600)
      return
    }

    if (name === 'fastfetch' || name === 'neofetch') {
      pushBlock('accent', LOGO)
      finishOutput('out', '')
      finishOutput('out', 'operator@matrixx')
      finishOutput('out', '-----------------')
      finishOutput('out', 'OS: Matrixx Linux 24.04 LTS x86_64')
      finishOutput('out', 'Host: Sector 09 / Terminal 04')
      finishOutput('out', 'Kernel: 6.8.0-matrixx')
      finishOutput('out', 'Shell: bash 5.2.21')
      finishOutput('out', 'DE: GNOME 46 (Wayland)')
      finishOutput('out', `Theme: ${settings.theme}`)
      finishOutput('out', 'Icons: Yaru')
      finishOutput('out', 'Terminal: gnome-terminal')
      finishOutput('out', 'CPU: Matrixx 47.2 MHz (1)')
      finishOutput('out', 'Memory: 640 MiB / 640 MiB')
      return
    }

    if (name === 'signal') {
      triggerSignal()
      playSound('error')
      finishOutput('accent', '47.2 Hz. Answer received.')
      finishOutput('err', 'Do not answer.')
      return
    }

    if (name === 'apt') {
      finishOutput('err', 'E: Could not open lock file /var/lib/dpkg/lock-frontend (13: Permission denied)')
      finishOutput('sys', 'E: Are you root?')
      return
    }

    if (name === 'sudo') {
      finishOutput('err', 'operator is not in the sudoers file. This incident has been reported.')
      return
    }

    if (name === 'history') {
      if (history.length === 0) {
        finishOutput('sys', 'history is empty')
        return
      }
      history.forEach((item, index) => {
        finishOutput('out', `${String(index + 1).padStart(3, '0')}  ${item}`)
      })
      return
    }

    if (name === 'banner') {
      showBanner()
      return
    }

    if (name === 'exit') {
      finishOutput('err', 'There is no logout from this session.')
      return
    }

    finishOutput('err', `bash: ${name}: command not found`)
  }

  const complete = () => {
    if (!value) {
      pushBlock('sys', `Available: ${COMMANDS.join('  ')}`)
      return
    }
    const matches = COMMANDS.filter((command) => command.startsWith(value.toLowerCase()))
    if (matches.length === 1) {
      setValue(`${matches[0]} `)
      return
    }
    if (matches.length > 1) pushBlock('sys', matches.join('  '))
  }

  return (
    <div
      className="term"
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Terminal"
    >
      <div className="term__meta">
        <span className="term__tab">operator@matrixx: ~</span>
        <span className="term__meta-right">bash</span>
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
            aria-label="Command input"
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
