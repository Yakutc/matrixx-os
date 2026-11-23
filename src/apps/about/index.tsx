import { useState } from 'react'
import { useOS } from '../../os/OSProvider'
import type { AppProps } from '../../os/types'

const ROWS = [
  ['OS Name', 'Matrixx Linux'],
  ['Version', '24.04 LTS (Noble)'],
  ['OS Type', '64-bit'],
  ['Kernel', '6.8.0-matrixx'],
  ['GNOME', '46.0'],
  ['Window System', 'Wayland'],
  ['Memory', '640 MiB'],
  ['Processor', 'Matrixx 47.2 MHz'],
  ['Disk', '640 KB'],
  ['Graphics', 'LLVMpipe (software)'],
]

export default function AboutApp(_props: AppProps) {
  const { notify, triggerSignal } = useOS()
  const [clicks, setClicks] = useState(0)

  const touchLogo = () => {
    const next = clicks + 1
    if (next >= 5) {
      setClicks(0)
      notify('The signal is still there.', 'danger')
      triggerSignal()
      return
    }
    setClicks(next)
  }

  return (
    <div className="about">
      <div className="about__hero">
        <button
          type="button"
          className="about__logo"
          onClick={touchLogo}
          aria-label="Matrixx Linux logo"
          title="About Matrixx Linux"
        >
          M
        </button>
        <div className="about__name">Matrixx Linux</div>
        <div className="about__version">24.04 LTS (Noble)</div>
        <div className="about__actions">
          <button
            type="button"
            className="btn"
            onClick={() => notify('System is up to date', 'ok')}
          >
            Check for Updates
          </button>
        </div>
      </div>

      <div className="about__body">
        <div className="about__group">
          {ROWS.map(([label, value]) => (
            <div className="about__row" key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </div>

        <div className="about__links">
          <a href="https://github.com/Yakutc/matrixx-os" target="_blank" rel="noopener noreferrer">
            Website
          </a>
          <a
            href="https://github.com/Yakutc/matrixx-os/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report an Issue
          </a>
          <a href="https://github.com/Yakutc/matrixx-os" target="_blank" rel="noopener noreferrer">
            Credits
          </a>
        </div>

        <p className="about__legal">
          Matrixx Linux is a browser desktop environment. It is not affiliated with Canonical or
          the GNOME Project. Built with React, Web Audio and Canvas.
        </p>
      </div>
    </div>
  )
}
