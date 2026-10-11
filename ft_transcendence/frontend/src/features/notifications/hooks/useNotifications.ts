import { useEffect, useState } from 'react'
import {
  getNotifications,
  readNotification,
} from '../api/notificationApi'
import { toNotification } from '../api/notificationMapper'
import {
  offNewNotification,
  onNewNotification,
} from '../api/notificationSocket'
import type { Notification } from '../types/Notification'

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    getNotifications()
      .then((data) => setItems(data.items.map(toNotification)))

    function handleNew(item: unknown) {
      setItems((current) => [
        toNotification(item as Parameters<typeof toNotification>[0]),
        ...current,
      ])
    }

    onNewNotification(handleNew)
    return () => offNewNotification(handleNew)
  }, [])

  async function markRead(id: string) {
    await readNotification(id)
    setItems((current) => current.map((item) =>
      item.id === id ? { ...item, read: true } : item))
  }

  async function markAllRead() {
    let unread: Notification[]

    unread = items.filter((item) => !item.read)
    await Promise.all(unread.map((item) => readNotification(item.id)))
    setItems((current) => current.map((item) =>
      ({ ...item, read: true })))
  }

  return { notifications: items, markRead, markAllRead }
}
