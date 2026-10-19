import { socket } from '../../../api/socket'
import type { ApiMessage } from './chatApi'
import type {
  JoinChannelPayload,
  MessageErrorEvent,
  MessageReadEvent,
  MessageReadPayload,
  PresencePayload,
  SendMessagePayload,
  TypingEvent,
  TypingPayload,
} from '../types/SocketEvents'

type Presence = Omit<PresencePayload, 'online'>
type Handler<T> = (data: T) => void

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

export function markMessageRead(payload: MessageReadPayload) {
  socket.emit('message:read', payload)
}

export function requestPresence() {
  socket.emit('presence:get')
}

/*
  Every listener is removed with the same function it was added with.
  Removing all listeners of an event would break other screens.
*/
function listen<T>(event: string, handler: Handler<T>) {
  socket.on(event, handler)
  return () => {
    socket.off(event, handler)
  }
}

export const onNewMessage = (h: Handler<ApiMessage>) => listen('message:new', h)
export const onMessageError = (h: Handler<MessageErrorEvent>) => listen('message:error', h)
export const onTypingStart = (h: Handler<TypingEvent>) => listen('typing:start', h)
export const onTypingStop = (h: Handler<TypingEvent>) => listen('typing:stop', h)
export const onMessageRead = (h: Handler<MessageReadEvent>) => listen('message:read', h)
export const onPresenceOnline = (h: Handler<Presence>) => listen('presence:online', h)
export const onPresenceOffline = (h: Handler<Presence>) => listen('presence:offline', h)
export const onPresenceSnapshot = (h: Handler<Presence[]>) => listen('presence:snapshot', h)
export const onSocketConnect = (h: () => void) => listen('connect', h)

export type UserUnblockedEvent = {
  blockerId: string
}

export const onUserUnblocked = (h: Handler<UserUnblockedEvent>) => listen('user:unblocked', h)
