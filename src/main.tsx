import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import '@fontsource/ubuntu-mono/400.css'
import '@fontsource/ubuntu-mono/700.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/shell.css'
import './styles/windows.css'
import './apps/terminal/terminal.css'
import './apps/files/files.css'
import './apps/notes/notes.css'
import './apps/settings/settings.css'
import './apps/system/system.css'
import './apps/snake/snake.css'
import './apps/fm/fm.css'
import './apps/about/about.css'
import './styles/gnome-apps.css'
import App from './App'
import { loadSettings } from './os/storage'

const bootSettings = loadSettings()
const documentRoot = document.documentElement
documentRoot.dataset.theme = bootSettings.theme
documentRoot.dataset.wallpaper = bootSettings.wallpaper
documentRoot.dataset.reduceMotion = bootSettings.reduceMotion ? 'on' : 'off'
documentRoot.dataset.nightLight = bootSettings.nightLight ? 'on' : 'off'
const themeColor = document.querySelector('meta[name="theme-color"]')
const themeColors = {
  dark: '#1e1e1e',
  light: '#f2f2f2',
  hc: '#000000',
}
themeColor?.setAttribute('content', themeColors[bootSettings.theme])

const container = document.getElementById('root')
if (!container) throw new Error('root element missing')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
