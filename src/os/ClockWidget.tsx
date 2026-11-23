import { useOS } from './OSProvider'
import { longDate, timeParts, useClock } from './useClock'

const BARS = Array.from({ length: 18 }, (_, index) => index)

export function ClockWidget() {
  const { openWindow } = useOS()
  const now = useClock()
  const { hours, minutes, seconds } = timeParts(now)

  return (
    <div
      className="widget"
      role="button"
      tabIndex={0}
      aria-label="Открыть систему диагностики"
      onClick={() => openWindow('system')}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openWindow('system')
        }
      }}
    >
      <div className="widget__head">
        <span>ТЕРМИНАЛ 04 / МЕСТНОЕ</span>
        <span className="widget__tag">В СЕТИ</span>
      </div>
      <div className="widget__main">
        <div className="widget__time">
          <span>{hours}</span>
          <span className="widget__colon">:</span>
          <span>{minutes}</span>
          <span className="widget__seconds">{seconds}</span>
        </div>
        <div className="widget__date">
          <span>{longDate(now)}</span>
          <span>СЕКТОР 4</span>
        </div>
        <div className="widget__rows">
          <div className="widget__row">
            <span>ПИТАНИЕ</span>
            <b className="live">РЕЗЕРВ</b>
          </div>
          <div className="widget__row">
            <span>СИГНАЛ</span>
            <b>47.2 Гц</b>
          </div>
          <div className="widget__row">
            <span>ОБЪЕКТ 09</span>
            <b className="danger">НЕТ ОТВЕТА</b>
          </div>
        </div>
        <div className="widget__bars" aria-hidden="true">
          {BARS.map((index) => (
            <span
              key={index}
              style={{
                animationDelay: `${(index % 7) * -0.22}s`,
                animationDuration: `${1.1 + (index % 5) * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
