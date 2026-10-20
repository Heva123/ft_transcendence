import type { ApiMessage } from './chatApi'
import type { Message, MessageReader } from '../types/Message'

/*
  The history endpoint does not return readers yet.
  When the backend adds `reads`, receipts will also show after a reload.
*/
function toReaders(item: ApiMessage): MessageReader[] | undefined {
  if (!item.reads?.length)
    return undefined
  return item.reads.map((read) => ({
    userId: read.userId,
    username: read.user?.username,
  }))
}

export function toMessage(item: ApiMessage): Message {
  const date = new Date(item.createdAt)

  return {
    id: item.id,
    channelId: item.channelId,
    senderId: item.author.id,
    sender: item.author.username,
    text: item.content,
    sentAt: item.createdAt,
    time: date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    attachment: item.attachment ?? undefined,
    readBy: toReaders(item),
  }
}

/** "Today", "Yesterday" or "8 September" style label for a day group. */
export function dayLabel(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()

  yesterday.setDate(today.getDate() - 1)
  const label = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  }).toUpperCase()
  if (date.toDateString() === today.toDateString())
    return `TODAY · ${label}`
  if (date.toDateString() === yesterday.toDateString())
    return `YESTERDAY · ${label}`
  return label
}
