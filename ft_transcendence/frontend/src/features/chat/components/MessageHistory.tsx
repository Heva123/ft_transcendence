import type { Message } from '../types/Message'
import MessageList from './MessageList'

type Props = {
  messages: Message[]
  currentUserId: string
  names: Map<string, string>
}

// Full channel history, grouped by day (design p55).
function MessageHistory(props: Props) {
  return (
    <section className="message-history">
      <p className="message-history__title">MESSAGE HISTORY · {props.messages.length} messages</p>
      <MessageList messages={props.messages}
        currentUserId={props.currentUserId} names={props.names}
        emptyText="This channel has no history yet." />
    </section>
  )
}

export default MessageHistory
