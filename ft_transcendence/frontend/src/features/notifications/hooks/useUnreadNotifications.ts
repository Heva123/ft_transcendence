import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  NOTIFICATIONS_CHANGED,
  getNotifications,
} from '../api/notificationApi'
import { onNewNotification } from '../api/notificationSocket'

/** Unread count for the bell. Live on notification:new, refreshed on navigation. */
export function useUnreadNotifications() {
  const [count, setCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    let active = true

    function refresh() {
      getNotifications()
        .then((data) => {
          if (active)
            setCount(data.unreadCount)
        })
        .catch(() => undefined)
    }

    refresh()
    const stop = onNewNotification(() => setCount((current) => current + 1))
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh)
    return () => {
      active = false
      stop()
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh)
    }
  }, [location.pathname])

  return count
}
