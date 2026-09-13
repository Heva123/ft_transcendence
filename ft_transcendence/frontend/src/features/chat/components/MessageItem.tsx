import type { Message } from '../types/Message'

type MessageItemProps = {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  let initials: string

  initials = message.sender === 'You'
    ? 'AF'
    : message.sender.slice(0, 2).toUpperCase()

  return (
    <article className="message-item">
      <div className="message-avatar">{initials}</div>

      <div className="message-body">
        <p className="message-meta">
          <strong>{message.sender}</strong> · {message.createdAt}
        </p>

        <p className="message-text">{message.text}</p>

        {message.sender === 'You' && (
          <p className="message-read">✓✓ Read by Heba and Afnan</p>
        )}
      </div>
    </article>
  )
}

export default MessageItem