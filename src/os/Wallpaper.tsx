import { useOS } from './OSProvider'

export function Wallpaper() {
  const { settings } = useOS()
  const wallpaper = settings.wallpaper
  return (
    <div className="wallpaper" data-wallpaper={wallpaper} aria-hidden="true">
      <div className="wallpaper__grid" />
      {wallpaper === 'signal' && (
        <div className="wallpaper__signal">
          <svg viewBox="0 0 1600 220" preserveAspectRatio="none">
            <path
              d="M0 110 C 70 24, 130 196, 200 110 S 340 24 410 110 S 550 196 620 110 S 760 24 830 110 S 970 196 1040 110 S 1180 24 1250 110 S 1390 196 1460 110 S 1540 80 1600 110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M0 110 H1600"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.35"
              strokeDasharray="4 8"
            />
          </svg>
        </div>
      )}
      {wallpaper === 'orbit' && <div className="wallpaper__orbit" />}
      <div className="wallpaper__vignette" />
      <div className="wallpaper__word">MATRIXX</div>
      <div className="wallpaper__side">НИИ-9 · СЕКТОР 4 · ТЕРМИНАЛ 04</div>
      <div className="wallpaper__stamp">НЕ ОТКЛЮЧАТЬ ПИТАНИЕ</div>
      <span className="wallpaper__mark wallpaper__mark--a" />
      <span className="wallpaper__mark wallpaper__mark--b" />
      <span className="wallpaper__mark wallpaper__mark--c" />
      <div className="wallpaper__scan" />
      <div className="wallpaper__grain" />
    </div>
  )
}
