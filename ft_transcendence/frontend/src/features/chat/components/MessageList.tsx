import { Fragment } from 'react'
import { dayLabel } from '../api/messageMapper'
import type { Message } from '../types/Message'
import MessageItem from './MessageItem'

type Props = {
  messages: Message[]
  currentUserId: string
  names: Map<string, string>
  typingUsers?: string[]
  emptyText?: string
}

function typingText(users: string[]) {
  if (users.length === 1)
    return `${users[0]} is typing…`
  if (users.length === 2)
    return `${users[0]} and ${users[1]} are typing…`
  return `${users.length} people are typing…`
}

// Messages grouped under a date header per day (design p52, p55).
function MessageList(props: Props) {
  const rows = props.messages.map((message, index) => {
    const day = dayLabel(message.sentAt)
    const previous = props.messages[index - 1]

    return { message, day, showDay: !previous || dayLabel(previous.sentAt) !== day }
  })

  return (
    <section className="message-list">
      {props.messages.length === 0 && (
        <p className="message-empty">{props.emptyText ?? 'No messages yet. Say hello.'}</p>
      )}

      {rows.map(({ message, day, showDay }) => (
        <Fragment key={message.id}>
          {showDay && <p className="message-date">{day}</p>}
          <MessageItem message={message}
            currentUserId={props.currentUserId} names={props.names} />
        </Fragment>
      ))}

      {Boolean(props.typingUsers?.length) && (
        <p className="typing-status">{typingText(props.typingUsers ?? [])}</p>
      )}
    </section>
  )
}

export default MessageList
