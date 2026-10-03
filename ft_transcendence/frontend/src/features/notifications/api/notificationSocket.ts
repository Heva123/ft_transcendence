import { socket } from '../../../api/socket'
import type { Notification } from '../types/Notification'

export function onNewNotification(
  callback: (notification: Notification) => void,
) {
  socket.on('notification:new', callback)
}

export function offNewNotification(
  callback: (notification: Notification) => void,
) {
  socket.off('notification:new', callback)
}

export function markNotificationRead(notificationId: string) {
  socket.emit('notification:read', { notificationId })
}
