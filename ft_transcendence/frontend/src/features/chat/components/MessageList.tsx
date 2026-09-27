import type { Message } from '../types/Message'
import MessageItem from './MessageItem'

type MessageListProps = {
  messages: Message[]
  selectedChannelId: string
  typingUser: string
  blockedUser: string
}

function MessageList({
  messages,
  selectedChannelId,
  typingUser,
  blockedUser,
}: MessageListProps) {
  const visibleMessages = messages.filter((message) =>
    message.channelId === selectedChannelId
    && message.sender !== blockedUser)

  return (
    <section className="message-list">
      <p className="message-date">TODAY · 8 SEPTEMBER</p>
      {visibleMessages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      {blockedUser && (
        <p className="blocked-status">
          {blockedUser} is blocked. Their messages are hidden for you.
        </p>
      )}
      {typingUser && !blockedUser && (
        <p className="typing-status">{typingUser} is typing...</p>
      )}
    </section>
  )
}

export default MessageList
