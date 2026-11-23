import { useEffect } from 'react'
import { useOS } from './OSProvider'

export function OffScreen() {
  const { powerOn } = useOS()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') powerOn()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [powerOn])

  return (
    <div
      className="off"
      role="button"
      tabIndex={0}
      onClick={powerOn}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          powerOn()
        }
      }}
    >
      <div className="off__inner">
        <div className="off__title">ПИТАНИЕ<br />ОТКЛЮЧЕНО</div>
        <div className="off__sub">НАЖМИТЕ, ЧТОБЫ ВКЛЮЧИТЬ</div>
      </div>
    </div>
  )
}
