import { useEffect, useState } from 'react'
import {
  announceNotificationsChanged,
  getNotifications,
  readNotification,
} from '../api/notificationApi'
import { toNotification } from '../api/notificationMapper'
import { onNewNotification } from '../api/notificationSocket'
import type { Notification } from '../types/Notification'

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([])
  const [status, setStatus] = useState({ loading: true, error: '' })

  useEffect(() => {
    let active = true

    getNotifications()
      .then((data) => {
        if (!active)
          return
        setItems(data.items.map(toNotification))
        setStatus({ loading: false, error: '' })
      })
      .catch(() => {
        if (active)
          setStatus({ loading: false, error: 'We couldn’t load your updates.' })
      })

    const stop = onNewNotification((item) => {
      setItems((current) => [toNotification(item), ...current])
    })
    return () => {
      active = false
      stop()
    }
  }, [])

  async function markRead(id: string) {
    try {
      await readNotification(id)
      setItems((current) => current.map((item) =>
        item.id === id ? { ...item, read: true } : item))
      announceNotificationsChanged()
    } catch {
      setStatus((current) => ({ ...current, error: 'Could not mark that update as read.' }))
    }
  }

  async function markAllRead() {
    const unread = items.filter((item) => !item.read)
    const results = await Promise.allSettled(unread.map((item) => readNotification(item.id)))
    const done = new Set(unread
      .filter((_, index) => results[index].status === 'fulfilled')
      .map((item) => item.id))

    setItems((current) => current.map((item) =>
      done.has(item.id) ? { ...item, read: true } : item))
    if (done.size < unread.length)
      setStatus((current) => ({ ...current, error: 'Some updates could not be marked as read.' }))
    announceNotificationsChanged()
  }

  return { notifications: items, ...status, markRead, markAllRead }
}
