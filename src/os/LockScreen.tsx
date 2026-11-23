import { useEffect } from 'react'
import { useOS } from './OSProvider'
import { Wallpaper } from './Wallpaper'
import { longDate, timeParts, useClock } from './useClock'

export function LockScreen() {
  const { unlock } = useOS()
  const now = useClock()
  const { hours, minutes } = timeParts(now)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') unlock()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unlock])

  return (
    <div className="lock">
      <div className="gdm__bg">
        <Wallpaper />
      </div>
      <div className="lock__shade" />
      <div className="lock__clock">
        <div className="lock__time">
          {hours}:{minutes}
        </div>
        <div className="lock__date">{longDate(now)}</div>
      </div>
      <div className="lock__bottom">
        <div className="lock__avatar">O</div>
        <div className="lock__user">operator</div>
        <button type="button" className="lock__btn" onClick={unlock}>
          Unlock
        </button>
      </div>
    </div>
  )
}
