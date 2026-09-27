export type SendMessagePayload = {
  channelId: string
  text: string
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
