import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { socket } from '../../../api/socket'
import {
  markMessageRead,
  onMessageRead,
  onSocketConnect,
} from '../api/chatSocket'
import type { Message } from '../types/Message'
import type { MessageReadEvent } from '../types/SocketEvents'

function addReader(message: Message, data: MessageReadEvent) {
  const readers = message.readBy ?? []

  if (message.id !== data.messageId)
    return message
  if (readers.some((item) => item.userId === data.userId))
    return message
  return {
    ...message,
    readBy: [...readers, {
      userId: data.userId,
      username: data.username,
    }],
  }
}

export function useReadReceipts(
  channelId: string,
  messages: Message[],
  setMessages: Dispatch<SetStateAction<Message[]>>,
  currentUserId: string,
) {
  const marked = useRef(new Set<string>())

  useEffect(() => {
    return onMessageRead((data) => {
      setMessages((items) =>
        items.map((item) => addReader(item, data)))
    })
  }, [setMessages])

  useEffect(() => {
    function markAll() {
      if (!currentUserId || !socket.connected)
        return
      messages.forEach((message) => {
        if (message.senderId === currentUserId
          || marked.current.has(message.id))
          return
        marked.current.add(message.id)
        markMessageRead({ channelId, messageId: message.id })
      })
    }

    markAll()
    // Messages that arrived while offline are marked once we are back.
    return onSocketConnect(markAll)
  }, [channelId, messages, currentUserId])
}
