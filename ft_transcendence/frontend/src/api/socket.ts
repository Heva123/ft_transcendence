import { io } from 'socket.io-client'
import { expireSession } from './session'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

export const socket = io(SOCKET_URL, {
  autoConnect: false,
})

// The server sends auth:error and then disconnects when the token is invalid.
socket.on('auth:error', () => expireSession())

export function connectSocket(token: string) {
  socket.auth = { token }
  socket.connect()
}

export function disconnectSocket() {
  socket.disconnect()
}
