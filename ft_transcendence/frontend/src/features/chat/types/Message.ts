export type MessageAttachment = {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export type MessageReader = {
  userId: string
  username?: string
}

export type Message = {
  id: string
  channelId: string
  senderId: string
  sender: string
  text: string
  /** ISO date from the backend, used for day groups. */
  sentAt: string
  /** Display time, e.g. "09:41". */
  time: string
  attachment?: MessageAttachment
  readBy?: MessageReader[]
}

export type ChannelMember = {
  id: string
  username: string
}
