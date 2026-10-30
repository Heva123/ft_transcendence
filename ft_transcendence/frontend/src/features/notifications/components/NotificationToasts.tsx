import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  announceNotificationsChanged,
  readNotification,
} from '../api/notificationApi'
import { toNotification } from '../api/notificationMapper'
import { onNewNotification } from '../api/notificationSocket'
import { categoryOf } from '../notificationTypes'
import type { Notification } from '../types/Notification'

const SHOW_MS = 6000
const MAX_TOASTS = 3

// Badge colour per notification category (Tailwind classes from our design tokens).
const BADGE: Record<string, string> = {
  post: 'bg-cyan',
  like: 'bg-pink',
  friend: 'bg-yellow',
  community: 'bg-lilac',
  channel: 'bg-mint',
  report: 'bg-peach',
  general: 'bg-surface',
}

// Small pop-up in the corner when a notification arrives live.
function NotificationToasts() {
  const [toasts, setToasts] = useState<Notification[]>([])
  const { pathname } = useLocation()

  useEffect(() => onNewNotification((item) => {
    const toast = toNotification(item)

    setToasts((current) => [toast, ...current].slice(0, MAX_TOASTS))
    window.setTimeout(() => {
      setToasts((current) => current.filter((entry) => entry.id !== toast.id))
    }, SHOW_MS)
  }), [])

  function dismiss(id: string) {
    setToasts((current) => current.filter((entry) => entry.id !== id))
  }

  function open(id: string) {
    dismiss(id)
    readNotification(id)
      .then(announceNotificationsChanged)
      .catch(() => undefined)
  }

  // The notifications page already shows new items live.
  const visible = pathname === '/notifications' ? [] : toasts

  return (
    <div
      className="notification-toasts pointer-events-none fixed right-4 bottom-4 z-40 grid w-[min(360px,calc(100vw-32px))] gap-2 max-[720px]:bottom-[76px]"
      aria-live="polite" aria-relevant="additions">
      {visible.map((toast) => {
        const category = categoryOf(toast.type)

        return (
          <div key={toast.id} role="status"
            className="notification-toast pointer-events-auto grid animate-toast-in grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-panel border border-ink bg-surface p-3 shadow-block motion-reduce:animate-none">
            <span className={`rounded-control border border-ink px-2 py-1 text-[10px] font-bold ${BADGE[category.className] ?? 'bg-surface'}`}>
              {category.label}
            </span>
            <div>
              <strong className="text-[13px]">{toast.title}</strong>
              <p className="mt-1 mb-0 text-xs wrap-anywhere">{toast.message}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {toast.targetUrl && (
                <Link to={toast.targetUrl} onClick={() => open(toast.id)}
                  className="font-bold text-plum">View</Link>
              )}
              <button type="button" aria-label="Dismiss notification"
                className="cursor-pointer border-0 bg-transparent text-lg leading-none"
                onClick={() => dismiss(toast.id)}>×</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotificationToasts
