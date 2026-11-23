export interface FsFile {
  type: 'file'
  name: string
  content: string
  owner: string
  updated: string
  hidden?: boolean
}

export interface FsDir {
  type: 'dir'
  name: string
  owner: string
  updated: string
  children: FsNode[]
  hidden?: boolean
}

export type FsNode = FsFile | FsDir

const readme = `MATRIXX OS 0.9.7 // RECOVERY BUILD
НИИ-9, сектор 4, терминал 04.

Система восстановлена из резервного образа 04.11.1997.
Не отключайте питание. Сеть помнит больше, чем мы.

Доступные команды: help
Архив: открывается из рабочего стола.
Если вы читаете это — терминал всё ещё в сети.`

const operatorReadme = `ОПЕРАТОРУ.

1. Питание нестабильно. Резервный контур держит примерно 47 минут.
2. Не запускайте два генератора одновременно.
3. Файл .протокол не открывать без распоряжения.
4. Если услышите сигнал — не отвечайте.

— смена 04`

const operatorNotes = `04.11.1997

В 03:47 система сама включила приёмник.
Частота 47.2 Гц. Не радио. Похоже на дыхание.

В 04:04 пропала связь с объектом 09. На записи
девять голосов считают до девяти. Девятый — мой.

Я не помню, как вышел из сектора.
`

const sessionLog = `СЕАНС 04 // ЖУРНАЛ ОПЕРАТОРА

03:41 — проверка контура. норма.
03:47 — приёмник включился без команды.
03:48 — записан сигнал 47.2 Гц. длина 9 секунд.
03:52 — дверь сектора 4 открыта изнутри.
03:59 — на связи только терминал.
04:04 — объект 09 не отвечает.

дальше запись обрывается.
`

const hiddenProtocol = `ЕСЛИ ТЫ ЭТО ЧИТАЕШЬ, ЗНАЧИТ СИСТЕМА ТЕБЯ ВЫБРАЛА.

Протокол 7 не про эвакуацию. Он про память.
Каждый оператор остаётся в контуре. Ты — девятый.
Не отвечай на сигнал. Не называй своё имя вслух.
Терминал запомнит его вместо тебя.

— оператор 08
`

const kernelLog = `[04.11.1997 03:40:12] matrixx 0.9.7 recovery image mounted
[04.11.1997 03:40:13] crt controller ......... ok
[04.11.1997 03:40:14] memory ................ 640k / 640k
[04.11.1997 03:41:02] operator 04 authenticated
[04.11.1997 03:47:00] unexpected receiver wake
[04.11.1997 03:47:02] signal detected ........ 47.2 hz
[04.11.1997 03:47:02] checksum mismatch ...... sector 09
[04.11.1997 03:52:19] sector 4 door ......... open
[04.11.1997 03:59:44] operator 04 ........... no response
[04.11.1997 04:04:04] signal length exceeded limit
[04.11.1997 04:04:04] writing memory .... си`

const matrixxConfig = `# MATRIXX OS 0.9.7 — конфигурация контура
theme=phosphor
crt=1
sound=1
lockdown=0
signal_allow=0
operator_slots=9
sector=4
warning=DO_NOT_POWER_OFF`

const protocolSeven = `ПРОТОКОЛ 7 // ПАМЯТЬ

1. Контур не хранит людей. Контур хранит привычки.
2. Если система отвечает голосом оператора — это не оператор.
3. Девятый слот пуст. Он всегда был пуст.
4. Сигнал 47.2 Гц — не входящий. Это запрос.
5. Не подтверждайте запрос.

Подпись: НИИ-9, отдел режима.
`

const dossier = `ОБЪЕКТ 09 // ДОСЬЕ

Тип: приёмный контур.
Назначение: удержание сигнала.
Экипаж: 9 операторов.
Состояние: не отвечает с 04.11.1997.

Примечание:
восемь операторов вышли из сектора.
девятый остался в терминале.

Терминал 04 признан рабочим.
Доступ к объекту 09 — только по протоколу 7.
`

const frequency = `ЧАСТОТА 47.2 Гц

47.2 hz ................ основная
94.4 hz ................ гармоника
141.6 hz ............... не зафиксирована

сигнал повторяется каждые 9 секунд.
в конце записи слышен голос, называющий имя.
имя совпадает с именем слушателя.

не отвечай.
`

const lastSession = `последний сеанс: 04.11.1997 03:47
оператор: 04
статус: не найден

следующий слот: 09
ожидание подтверждения...

[ 47.2 ]`

export const fsRoot: FsDir = {
  type: 'dir',
  name: '',
  owner: 'system',
  updated: '04.11.1997',
  children: [
    {
      type: 'dir',
      name: 'home',
      owner: 'system',
      updated: '04.11.1997',
      children: [
        {
          type: 'dir',
          name: 'operator',
          owner: 'operator',
          updated: '04.11.1997',
          children: [
            {
              type: 'file',
              name: 'README.txt',
              owner: 'operator',
              updated: '04.11.1997',
              content: operatorReadme,
            },
            {
              type: 'file',
              name: 'заметки.txt',
              owner: 'operator',
              updated: '04.11.1997',
              content: operatorNotes,
            },
            {
              type: 'file',
              name: 'сеанс-04.txt',
              owner: 'operator',
              updated: '04.11.1997',
              content: sessionLog,
            },
            {
              type: 'file',
              name: '.протокол.txt',
              owner: 'root',
              updated: '04.11.1997',
              hidden: true,
              content: hiddenProtocol,
            },
          ],
        },
      ],
    },
    {
      type: 'dir',
      name: 'sys',
      owner: 'system',
      updated: '04.11.1997',
      children: [
        {
          type: 'file',
          name: 'kernel.log',
          owner: 'system',
          updated: '04.11.1997',
          content: kernelLog,
        },
        {
          type: 'file',
          name: 'matrixx.cfg',
          owner: 'root',
          updated: '04.11.1997',
          content: matrixxConfig,
        },
        {
          type: 'file',
          name: 'протокол-7.txt',
          owner: 'root',
          updated: '04.11.1997',
          content: protocolSeven,
        },
      ],
    },
    {
      type: 'dir',
      name: 'объект-09',
      owner: 'root',
      updated: '04.11.1997',
      children: [
        {
          type: 'file',
          name: 'досье.txt',
          owner: 'root',
          updated: '04.11.1997',
          content: dossier,
        },
        {
          type: 'file',
          name: 'частота.txt',
          owner: 'root',
          updated: '04.11.1997',
          content: frequency,
        },
      ],
    },
    {
      type: 'dir',
      name: 'tmp',
      owner: 'system',
      updated: '04.11.1997',
      children: [
        {
          type: 'file',
          name: 'last-session.txt',
          owner: 'system',
          updated: '04.11.1997',
          content: lastSession,
        },
      ],
    },
    {
      type: 'file',
      name: 'README.txt',
      owner: 'system',
      updated: '04.11.1997',
      content: readme,
    },
  ],
}

export function normalizePath(cwd: string, target: string): string {
  const base = target.startsWith('/') ? [] : cwd.split('/').filter(Boolean)
  const parts = target.split('/')
  for (const part of parts) {
    if (!part || part === '.') continue
    if (part === '..') {
      base.pop()
      continue
    }
    base.push(part)
  }
  return `/${base.join('/')}`
}

export function resolveNode(path: string): FsNode | null {
  const parts = path.split('/').filter(Boolean)
  let current: FsNode = fsRoot
  for (const part of parts) {
    if (current.type !== 'dir') return null
    const found: FsNode | undefined = current.children.find(
      (child: FsNode) => child.name === part,
    )
    if (!found) return null
    current = found
  }
  return current
}

export function resolveDir(path: string): FsDir | null {
  const node = resolveNode(path)
  return node && node.type === 'dir' ? node : null
}

export function listDir(path: string, showHidden = false): FsNode[] {
  const dir = resolveDir(path)
  if (!dir) return []
  return dir.children
    .filter((child) => showHidden || !child.hidden)
    .slice()
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name, 'ru')
    })
}

export function readTextFile(path: string): FsFile | null {
  const node = resolveNode(path)
  return node && node.type === 'file' ? node : null
}

export function parentPath(path: string): string {
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return `/${parts.join('/')}`
}

export function formatBytes(content: string): string {
  const bytes = new TextEncoder().encode(content).length
  if (bytes < 1024) return `${bytes} б`
  return `${(bytes / 1024).toFixed(1)} КБ`
}
