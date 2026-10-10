import { socket } from '../../../api/socket'
import type { Message } from '../types/Message'
import type {
  JoinChannelPayload,
  PresencePayload,
  SendMessagePayload,
  TypingEvent,
  TypingPayload,
} from '../types/SocketEvents'

export function joinChannel(payload: JoinChannelPayload) {
  socket.emit('channel:join', payload)
}

export function leaveChannel(payload: JoinChannelPayload) {
  socket.emit('channel:leave', payload)
}

export function sendMessage(payload: SendMessagePayload) {
  socket.emit('message:send', payload)
}

export function startTyping(payload: TypingPayload) {
  socket.emit('typing:start', payload)
}

export function stopTyping(payload: TypingPayload) {
  socket.emit('typing:stop', payload)
}

export function onNewMessage(callback: (message: Message) => void) {
  socket.on('message:new', callback)
}

export function onTypingStart(callback: (data: TypingEvent) => void) {
  socket.on('typing:start', callback)
}

export function onTypingStop(callback: (data: TypingEvent) => void) {
  socket.on('typing:stop', callback)
}

export function onPresenceUpdate(
  callback: (data: PresencePayload) => void,
) {
  socket.on('presence:update', callback)
}

export function offPresenceUpdate(
  callback: (data: PresencePayload) => void,
) {
  socket.off('presence:update', callback)
}

export function removeChatListeners() {
  socket.off('message:new')
  socket.off('typing:start')
  socket.off('typing:stop')
}
