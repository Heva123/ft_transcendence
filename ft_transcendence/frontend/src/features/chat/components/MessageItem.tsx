import { Link } from 'react-router-dom'
import ProtectedImage from '../../../components/ProtectedImage'
import type { Message } from '../types/Message'

type MessageItemProps = {
  message: Message
  currentUserId?: string
  /** userId → username, used to name readers. */
  names?: Map<string, string>
}

function joinNames(names: string[]) {
  if (names.length <= 1)
    return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function MessageItem({ message, currentUserId, names }: MessageItemProps) {
  const isOwn = message.senderId === currentUserId
  const readers = (message.readBy ?? [])
    .filter((reader) => reader.userId !== message.senderId)
    .map((reader) => reader.username ?? names?.get(reader.userId) ?? 'someone')

  return (
    <article className={isOwn ? 'message-item own' : 'message-item'}>
      <div className="message-avatar">{message.sender.slice(0, 2).toUpperCase()}</div>
      <div className="message-body">
        <p className="message-meta">
          {isOwn
            ? <strong>You</strong>
            : <Link to={`/profile/${encodeURIComponent(message.sender)}`}>{message.sender}</Link>}
          {' '}· {message.time}
        </p>
        {message.text && <p className="message-text">{message.text}</p>}
        {message.attachment && (
          <div className="message-attachment">
            <ProtectedImage src={message.attachment.url} alt={message.attachment.name} />
            <span>{message.attachment.name}</span>
          </div>
        )}
        {isOwn && readers.length > 0 && (
          <p className="message-read">✓✓ Read by {joinNames(readers)}</p>
        )}
      </div>
    </article>
  )
}

export default MessageItem
