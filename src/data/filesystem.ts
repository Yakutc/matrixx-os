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

const readme = `Matrixx Linux 24.04 LTS
Codename: noble
Kernel: 6.8.0-matrixx (x86_64)

This image was recovered from the Sector 09 lab terminal.
The system boots. The network is local. The receiver is still warm.

Do not power off the machine while the signal is active.
If the desktop asks for your name, give it the operator number only.

Type "help" in Terminal for available commands.`

const osRelease = `NAME="Matrixx Linux"
VERSION="24.04 LTS (Noble)"
ID=matrixx
ID_LIKE=ubuntu debian
PRETTY_NAME="Matrixx Linux 24.04 LTS"
VERSION_ID="24.04"
HOME_URL="https://github.com/Yakutc/matrixx-os"
SUPPORT_URL="local://sector-09"
BUG_REPORT_URL="local://operator/09"
`

const matrixxConfig = `# Matrixx Linux system configuration
hostname=matrixx
operator_slots=9
sector=4
lockdown=0
signal_allow=0
night_light=auto
session_restore=1
warning=DO_NOT_POWER_OFF_WHILE_RECEIVING`

const operatorReadme = `Operator notes
=============

1. The system clock drifts by nine seconds after midnight. Ignore it.
2. Do not run two audio generators at once. The receiver wakes up.
3. If /opt/sector-09 is mounted, do not open .protocol.
4. The login screen accepts any password. That is not a bug.

— operator 04
`

const notes = `2026-11-24 03:47

The machine turned the receiver on by itself.
47.2 Hz. Not radio. It sounds like breathing.

At 04:04 the link to Sector 09 dropped.
Nine voices counted to nine on the recording.
The ninth voice was mine.

I do not remember logging out.
`

const sessionLog = `SESSION 04 // OPERATOR LOG

03:41  system check .................... ok
03:47  receiver wake (no command)
03:48  recorded signal 47.2 Hz, 9 seconds
03:52  Sector 04 door opened from inside
03:59  only the terminal answered
04:04  Sector 09 did not respond

recording ends here.`

const hiddenProtocol = `IF YOU ARE READING THIS, THE SYSTEM CHOSE YOU.

Protocol 7 is not about evacuation. It is about memory.
Every operator stays in the loop. You are number nine.
Do not answer the signal. Do not say your name out loud.
The terminal will remember it for you.

— operator 08
`

const syslog = `2026-11-24T03:40:12 matrixx kernel: Matrixx Linux 24.04 LTS booting
2026-11-24T03:40:13 matrixx systemd[1]: Reached target Graphical Interface
2026-11-24T03:41:02 matrixx gdm-password]: pam_unix(gdm-password:session): session opened for user operator
2026-11-24T03:47:00 matrixx receiver[472]: unexpected wake, source=local
2026-11-24T03:47:02 matrixx receiver[472]: signal detected 47.2 Hz
2026-11-24T03:47:02 matrixx kernel: checksum mismatch at sector 09
2026-11-24T03:52:19 matrixx doorctl[118]: sector 4 opened from inside
2026-11-24T03:59:44 matrixx systemd[1]: operator 04 session: no response
2026-11-24T04:04:04 matrixx receiver[472]: signal length exceeded limit
2026-11-24T04:04:04 matrixx kernel: writing memory ... si`

const authLog = `2026-11-24 03:41:02 gdm-password: authentication succeeded for operator (uid 1000)
2026-11-24 03:41:02 systemd-logind: new session 4 of user operator
2026-11-24 03:47:02 systemd-logind: session 4: idle hint
2026-11-24 03:59:44 systemd-logind: session 4: operator 04 no response
2026-11-24 04:04:04 systemd-logind: session 9 authenticated for operator
2026-11-24 04:04:04 systemd-logind: new session 9 of user operator (remote?)
`

const protocol = `PROTOCOL 7 // MEMORY

1. The loop does not store people. It stores habits.
2. If the system answers in the operator's voice, it is not the operator.
3. Slot nine is empty. It was always empty.
4. The 47.2 Hz signal is not incoming. It is a request.
5. Do not confirm the request.

Signed: Sector 09, internal security.
`

const dossier = `SECTOR 09 // DOSSIER

Type: receiving loop
Purpose: signal containment
Crew: 9 operators
Status: no response since 2026-11-24

Note:
eight operators left Sector 04.
the ninth stayed inside the terminal.

Terminal 04 is considered operational.
Access to Sector 09 requires Protocol 7.
`

const frequency = `FREQUENCY 47.2 Hz

47.2 Hz ................ primary
94.4 Hz ................ harmonic
141.6 Hz ............... not detected

the signal repeats every nine seconds.
at the end of the recording a voice says a name.
the name matches the listener.

do not answer.
`

const lastSession = `last session: 2026-11-24 03:47
operator: 04
status: not found

next slot: 09
awaiting confirmation...

[ 47.2 ]`

const roadmap = `# Desktop roadmap

- [x] GNOME shell with Activities and quick settings
- [x] Terminal, Files, Text Editor
- [x] System Monitor with integrity check
- [ ] Sound bridge to Sector 09
- [ ] Workspaces beyond Workspace 1

Do not schedule the sound bridge before the operator count is complete.
`

const wallpaperNotes = `Wallpapers are generated in CSS.
The orange ring is not a logo. It is a mark left by the receiver.
We kept it because it looks like a sunrise.
`

export const fsRoot: FsDir = {
  type: 'dir',
  name: '',
  owner: 'system',
  updated: '2026-11-24',
  children: [
    {
      type: 'dir',
      name: 'home',
      owner: 'root',
      updated: '2026-11-24',
      children: [
        {
          type: 'dir',
          name: 'operator',
          owner: 'operator',
          updated: '2026-11-24',
          children: [
            {
              type: 'file',
              name: 'README.md',
              owner: 'operator',
              updated: '2026-11-24',
              content: operatorReadme,
            },
            {
              type: 'file',
              name: 'notes.txt',
              owner: 'operator',
              updated: '2026-11-24',
              content: notes,
            },
            {
              type: 'file',
              name: 'session-04.log',
              owner: 'operator',
              updated: '2026-11-24',
              content: sessionLog,
            },
            {
              type: 'file',
              name: '.protocol',
              owner: 'root',
              updated: '2026-11-24',
              hidden: true,
              content: hiddenProtocol,
            },
            {
              type: 'dir',
              name: 'Documents',
              owner: 'operator',
              updated: '2026-11-24',
              children: [
                {
                  type: 'file',
                  name: 'roadmap.md',
                  owner: 'operator',
                  updated: '2026-11-24',
                  content: roadmap,
                },
              ],
            },
            {
              type: 'dir',
              name: 'Downloads',
              owner: 'operator',
              updated: '2026-11-24',
              children: [],
            },
            {
              type: 'dir',
              name: 'Pictures',
              owner: 'operator',
              updated: '2026-11-24',
              children: [
                {
                  type: 'file',
                  name: 'wallpaper-notes.txt',
                  owner: 'operator',
                  updated: '2026-11-24',
                  content: wallpaperNotes,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'dir',
      name: 'etc',
      owner: 'root',
      updated: '2026-11-24',
      children: [
        {
          type: 'file',
          name: 'os-release',
          owner: 'root',
          updated: '2026-11-24',
          content: osRelease,
        },
        {
          type: 'file',
          name: 'matrixx.conf',
          owner: 'root',
          updated: '2026-11-24',
          content: matrixxConfig,
        },
      ],
    },
    {
      type: 'dir',
      name: 'var',
      owner: 'root',
      updated: '2026-11-24',
      children: [
        {
          type: 'dir',
          name: 'log',
          owner: 'root',
          updated: '2026-11-24',
          children: [
            {
              type: 'file',
              name: 'syslog',
              owner: 'syslog',
              updated: '2026-11-24',
              content: syslog,
            },
            {
              type: 'file',
              name: 'auth.log',
              owner: 'root',
              updated: '2026-11-24',
              content: authLog,
            },
          ],
        },
      ],
    },
    {
      type: 'dir',
      name: 'opt',
      owner: 'root',
      updated: '2026-11-24',
      children: [
        {
          type: 'dir',
          name: 'sector-09',
          owner: 'root',
          updated: '2026-11-24',
          children: [
            {
              type: 'file',
              name: 'dossier.txt',
              owner: 'root',
              updated: '2026-11-24',
              content: dossier,
            },
            {
              type: 'file',
              name: 'frequency.txt',
              owner: 'root',
              updated: '2026-11-24',
              content: frequency,
            },
            {
              type: 'file',
              name: 'protocol-7.txt',
              owner: 'root',
              updated: '2026-11-24',
              content: protocol,
            },
          ],
        },
      ],
    },
    {
      type: 'dir',
      name: 'tmp',
      owner: 'root',
      updated: '2026-11-24',
      children: [
        {
          type: 'file',
          name: 'last-session.txt',
          owner: 'operator',
          updated: '2026-11-24',
          content: lastSession,
        },
      ],
    },
    {
      type: 'file',
      name: 'README.md',
      owner: 'root',
      updated: '2026-11-24',
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
      return a.name.localeCompare(b.name, 'en')
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
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
