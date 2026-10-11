import type { ApiNotification } from './notificationApi'
import type { Notification } from '../types/Notification'

export function toNotification(item: ApiNotification): Notification {
  let date: Date

  date = new Date(item.createdAt)
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    read: item.isRead,
    createdAt: date.toLocaleString(),
    targetUrl: null,
  }
}
