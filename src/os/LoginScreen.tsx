import { useState } from 'react'
import { useOS } from './OSProvider'
import { Icon } from './icons'
import { Wallpaper } from './Wallpaper'
import { longDate, timeParts, useClock } from './useClock'

export function LoginScreen() {
  const { login, settings, setSettings, shutdown } = useOS()
  const now = useClock()
  const [password, setPassword] = useState('')
  const { hours, minutes } = timeParts(now)

  return (
    <div className="gdm">
      <div className="gdm__bg">
        <Wallpaper />
      </div>
      <div className="gdm__shade" />

        <div className="gdm__top">
        <div className="gdm__top-group">
          <span className="gdm__top-static" aria-hidden="true">
            <Icon name="user" size={15} />
          </span>
        </div>
        <div className="gdm__top-group">
          <button
            type="button"
            aria-label={settings.sound ? 'Mute sound' : 'Unmute sound'}
            onClick={() => setSettings({ sound: !settings.sound })}
          >
            <Icon name={settings.sound ? 'sound' : 'mute'} size={15} />
          </button>
          <button type="button" aria-label="Power off" onClick={shutdown}>
            <Icon name="power" size={15} />
          </button>
        </div>
      </div>

      <div className="gdm__clock">
        <b>
          {hours}:{minutes}
        </b>
        <span>{longDate(now)}</span>
      </div>

      <div className="gdm__panel">
        <div className="gdm__avatar">O</div>
        <div className="gdm__user">operator</div>
        <form
          className="gdm__form"
          onSubmit={(event) => {
            event.preventDefault()
            login()
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            aria-label="Password"
            autoFocus
            autoComplete="off"
          />
          <button type="submit">Sign In</button>
        </form>
        <div className="gdm__hint">No password is required on this system · Press Enter</div>
      </div>

      <div className="gdm__foot">Matrixx Linux 24.04 LTS</div>
    </div>
  )
}
