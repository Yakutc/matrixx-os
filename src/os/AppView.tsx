import type { ComponentType } from 'react'
import type { AppId, AppProps } from './types'
import TerminalApp from '../apps/terminal'
import FilesApp from '../apps/files'
import NotesApp from '../apps/notes'
import SettingsApp from '../apps/settings'
import SystemApp from '../apps/system'
import SnakeApp from '../apps/snake'
import FmApp from '../apps/fm'
import AboutApp from '../apps/about'

const COMPONENTS: Record<AppId, ComponentType<AppProps>> = {
  terminal: TerminalApp,
  files: FilesApp,
  notes: NotesApp,
  settings: SettingsApp,
  system: SystemApp,
  snake: SnakeApp,
  fm: FmApp,
  about: AboutApp,
}

export function AppView({ appId, windowId, payload }: AppProps & { appId: AppId }) {
  const Component = COMPONENTS[appId]
  return <Component windowId={windowId} payload={payload} />
}
