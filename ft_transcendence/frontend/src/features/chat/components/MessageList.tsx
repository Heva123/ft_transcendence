import type { Message } from '../types/Message'
import MessageItem from './MessageItem'

type MessageListProps = {
  messages: Message[]
  selectedChannelId: string
}

function MessageList({ messages, selectedChannelId }: MessageListProps) {
  let visibleMessages: Message[]

  visibleMessages = messages.filter(
    (message) => message.channelId === selectedChannelId,
  )

  return (
    <section className="message-list">
      <p className="message-date">TODAY · 8 SEPTEMBER</p>

      {visibleMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      <p className="typing-status">Afnan is typing...</p>
    </section>
  )
}

export default MessageList