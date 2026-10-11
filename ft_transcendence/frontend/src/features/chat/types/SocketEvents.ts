export type SendMessagePayload = {
  channelId: string
  content: string
  attachmentId?: string
}

export type TypingPayload = {
  channelId: string
}

export type TypingEvent = {
  channelId: string
  userId: string
  username: string
}

export type PresencePayload = {
  userId: string
  username: string
  online: boolean
}

export type JoinChannelPayload = {
  channelId: string
}

export type MessageReadPayload = {
  channelId: string
  messageId: string
}

export type MessageReadEvent = {
  messageId: string
  userId: string
  username?: string
  readAt: string
}
