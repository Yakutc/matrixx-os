import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/handjet/index.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/golos-text/400.css'
import '@fontsource/golos-text/500.css'
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
import App from './App'

import { loadSettings } from './os/storage'

const bootSettings = loadSettings()
const documentRoot = document.documentElement
documentRoot.dataset.theme = bootSettings.theme
documentRoot.dataset.wallpaper = bootSettings.wallpaper
documentRoot.dataset.crt = bootSettings.crt ? 'on' : 'off'
documentRoot.dataset.reduceMotion = bootSettings.reduceMotion ? 'on' : 'off'
const themeColor = document.querySelector('meta[name="theme-color"]')
const themeColors = {
  phosphor: '#050806',
  amber: '#080604',
  bone: '#e8e2d2',
}
themeColor?.setAttribute('content', themeColors[bootSettings.theme])

const container = document.getElementById('root')
if (!container) throw new Error('root element missing')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
