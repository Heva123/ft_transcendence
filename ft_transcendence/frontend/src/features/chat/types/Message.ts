export type MessageAttachment = {
  name: string
  url: string
  type: string
  size: number
}

export type Message = {
  id: string
  channelId: string
  senderId: string
  sender: string
  text: string
  createdAt: string
  attachment?: MessageAttachment
}
