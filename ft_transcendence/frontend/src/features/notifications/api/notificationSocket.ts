import { socket } from '../../../api/socket'
import type { ApiNotification } from './notificationApi'

export function onNewNotification(
  callback: (notification: ApiNotification) => void,
) {
  socket.on('notification:new', callback)
  return () => {
    socket.off('notification:new', callback)
  }
}
