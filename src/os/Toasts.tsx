import { useOS } from './OSProvider'
import { Icon } from './icons'

export function Toasts() {
  const { toasts, dismissToast } = useOS()
  if (toasts.length === 0) return null
  return (
    <div className="notifications" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`notification notification--${toast.tone}`}
          onClick={() => dismissToast(toast.id)}
          title="Dismiss"
        >
          <span className="notification__icon">
            <Icon
              name={toast.tone === 'danger' ? 'warning' : toast.tone === 'ok' ? 'check' : 'about'}
              size={15}
            />
          </span>
          <span>
            <span className="notification__head">
              Matrixx Linux <span>now</span>
            </span>
            {toast.text}
          </span>
        </button>
      ))}
    </div>
  )
}
