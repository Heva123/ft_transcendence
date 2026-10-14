import { Link } from 'react-router-dom'
import ProtectedImage from '../../../components/ProtectedImage'
import type { Message } from '../types/Message'

type MessageItemProps = {
  message: Message
  currentUserId?: string
}

function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isOwn = message.senderId === currentUserId
  const initials = message.sender === 'You'
    ? 'AF'
    : message.sender.slice(0, 2).toUpperCase()

  return (
    <article className="message-item">
      <div className="message-avatar">{initials}</div>
      <div className="message-body">
        <p className="message-meta">
          {message.sender === 'You'
            ? <strong>You</strong>
            : <Link to={`/profile/${encodeURIComponent(message.sender)}`}>{message.sender}</Link>}
          {' '}· {message.createdAt}
        </p>
        {message.text && <p className="message-text">{message.text}</p>}
        {message.attachment && (
          <div className="message-attachment">
            <ProtectedImage src={message.attachment.url} alt={message.attachment.name} />
            <span>{message.attachment.name}</span>
          </div>
        )}
        {isOwn && Boolean(message.readBy?.length) && <p className="message-read">✓✓ Read</p>}
      </div>
    </article>
  )
}

export default MessageItem
