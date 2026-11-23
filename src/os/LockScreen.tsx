import { useEffect } from 'react'
import { useOS } from './OSProvider'
import { Icon } from './icons'
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
      <div className="lock__inner">
        <div className="lock__time">
          {hours}:{minutes}
        </div>
        <div className="lock__label">{longDate(now)} · СИСТЕМА ЗАБЛОКИРОВАНА</div>
        <button type="button" className="btn btn--solid lock__btn" onClick={unlock}>
          <Icon name="lock" size={14} />
          РАЗБЛОКИРОВАТЬ
        </button>
      </div>
    </div>
  )
}
