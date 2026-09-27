import { mockHistory } from '../data/mockHistory'
import MessageItem from './MessageItem'

type MessageHistoryProps = {
  channelId: string
}

function MessageHistory({ channelId }: MessageHistoryProps) {
  const messages = mockHistory.filter(
    (message) => message.channelId === channelId,
  )

  return (
    <section className="message-history">
      <p className="message-date">YESTERDAY · MESSAGE HISTORY</p>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </section>
  )
}

export default MessageHistory
