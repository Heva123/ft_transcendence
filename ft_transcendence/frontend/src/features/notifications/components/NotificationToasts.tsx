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
import './NotificationToasts.css'

const SHOW_MS = 6000
const MAX_TOASTS = 3

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
    <div className="notification-toasts" aria-live="polite" aria-relevant="additions">
      {visible.map((toast) => {
        const category = categoryOf(toast.type)

        return (
          <div key={toast.id} className="notification-toast" role="status">
            <span className={`notification-toast__badge ${category.className}`}>{category.label}</span>
            <div className="notification-toast__copy">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <div className="notification-toast__actions">
              {toast.targetUrl && (
                <Link to={toast.targetUrl} onClick={() => open(toast.id)}>View</Link>
              )}
              <button type="button" aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}>×</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default NotificationToasts
