import { useEffect, useState } from 'react'
import {
  offNewNotification,
  onNewNotification,
} from '../api/notificationSocket'
import type { Notification } from '../types/Notification'

export function useNotifications(initial: Notification[]) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initial)

  useEffect(() => {
    function handleNew(item: Notification) {
      setNotifications((current) => [item, ...current])
    }

    onNewNotification(handleNew)
    return () => offNewNotification(handleNew)
  }, [])

  function markRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item))
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true })))
  }

  return { notifications, markRead, markAllRead }
}
