import { useOS } from './OSProvider'

export function Wallpaper() {
  const { settings } = useOS()
  return (
    <div className="wallpaper" data-wallpaper={settings.wallpaper} aria-hidden="true">
      <div className="wallpaper__base" />
      <div className="wallpaper__glow" />
      <div className="wallpaper__ring" />
      <div className="wallpaper__brand">
        <b>Matrixx Linux</b> · 24.04 LTS
      </div>
      <div className="wallpaper__version">Wayland · GNOME 46</div>
    </div>
  )
}
