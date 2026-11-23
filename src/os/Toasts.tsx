import { useOS } from './OSProvider'

export function Toasts() {
  const { toasts, dismissToast } = useOS()
  if (toasts.length === 0) return null
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast--${toast.tone}`}
          onClick={() => dismissToast(toast.id)}
          title="Закрыть"
        >
          <b>{toast.tone === 'danger' ? '!!' : toast.tone === 'ok' ? 'OK' : '>>'}</b>
          {toast.text}
        </button>
      ))}
    </div>
  )
}
