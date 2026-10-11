import { useEffect, useState } from 'react'
import { getMessages } from '../api/chatApi'
import { toMessage } from '../api/messageMapper'
import type { Message } from '../types/Message'
import MessageItem from './MessageItem'

type Props = {
  channelId: string
}

function MessageHistory({ channelId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getMessages(channelId)
      .then((items) => setMessages(items.map(toMessage)))
      .catch(() => setError('Unable to load message history.'))
  }, [channelId])

  if (error)
    return <p>{error}</p>

  return (
    <section className="message-history">
      <p className="message-date">EARLIER MESSAGES</p>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </section>
  )
}

export default MessageHistory
