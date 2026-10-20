import { io } from 'socket.io-client'
import { apiRequest } from './apiClient'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})

// The server can send auth:error while it is still checking a new
// connection, so a valid login must not end here. Ask the API first:
// a refused token (401) ends the session inside apiRequest.
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
