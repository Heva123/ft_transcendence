import { Link } from 'react-router-dom'
import type { Channel } from '../types/Channel'

type ConversationsPanelProps = {
  channels: Channel[]
}

function ConversationsPanel({ channels }: ConversationsPanelProps) {
  return (
    <aside className="conversations-panel">
      <h2>Conversations</h2>

      {channels.map((channel) => (
        <Link key={channel.id} to={`/channels/${channel.id}`}>
          # {channel.name}
        </Link>
      ))}

      <button type="button">+ New channel</button>
      <button className="leave-community" type="button">
        Leave community
      </button>
    </aside>
  )
}

export default ConversationsPanel