import { Link } from 'react-router-dom'
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
          {message.sender === 'You'
            ? <strong>You</strong>
            : <Link to={`/profile/${message.senderId}`}>{message.sender}</Link>}
          {' '}· {message.createdAt}
        </p>

        {message.text && <p className="message-text">{message.text}</p>}

        {message.attachment && (
          <div className="message-attachment">
            <img src={message.attachment.url}
              alt={message.attachment.name} />
            <span>{message.attachment.name}</span>
          </div>
        )}

        {message.sender === 'You' && (
          <p className="message-read">✓✓ Read</p>
        )}
      </div>
    </article>
  )
}

export default MessageItem
