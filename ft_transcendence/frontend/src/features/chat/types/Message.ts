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
  createdAt: string
  attachment?: MessageAttachment
  readBy?: MessageReader[]
}
