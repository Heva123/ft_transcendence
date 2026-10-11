import type { Message } from '../types/Message'
import MessageItem from './MessageItem'

type Props = {
  messages: Message[]
  selectedChannelId: string
  typingUser: string
  blockedUser: string
  currentUserId: string
}

function MessageList(props: Props) {
  let visibleMessages: Message[]
  let today: string

  today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  }).toUpperCase()

  visibleMessages = props.messages.filter((message) =>
    message.channelId === props.selectedChannelId
    && message.sender !== props.blockedUser)

  return (
    <section className="message-list">
      <p className="message-date">TODAY · {today}</p>

      {visibleMessages.map((message) => (
        <MessageItem key={message.id} message={message}
          currentUserId={props.currentUserId} />
      ))}

      {props.blockedUser && (
        <p className="blocked-status">
          {props.blockedUser} is blocked. Their messages are hidden for you.
        </p>
      )}

      {props.typingUser && !props.blockedUser && (
        <p className="typing-status">
          {props.typingUser} is typing...
        </p>
      )}
    </section>
  )
}

export default MessageList
