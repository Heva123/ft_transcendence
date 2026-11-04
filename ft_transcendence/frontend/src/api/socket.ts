import { io } from 'socket.io-client'
import { apiRequest } from './apiClient'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})




socket.on('auth:error', () => {
  apiRequest('/users/me')
    .then(() => {
      if (socket.connected)
        socket.emit('presence:get')
      else
        socket.connect()
    })
    .catch(() => undefined)
})

export function connectSocket(token: string) {
  socket.auth = { token }
  socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}
