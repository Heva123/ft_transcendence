import type { ApiMessage } from './chatApi'
import type { Message } from '../types/Message'

export function toMessage(item: ApiMessage): Message {
  let date: Date
  let time: string

  date = new Date(item.createdAt)
  time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    id: item.id,
    channelId: item.channelId,
    senderId: item.author.id,
    sender: item.author.username,
    text: item.content,
    createdAt: time,
    attachment: item.attachment ?? undefined,
  }
}
