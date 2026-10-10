import { NavLink } from 'react-router-dom'
import type { PresencePayload } from '../types/SocketEvents'
import type { Channel } from '../types/Channel'

type ChannelSidebarProps = {
  channels: Channel[]
  communityName: string
  onlineUsers: PresencePayload[]
}

function ChannelSidebar({
  channels,
  communityName,
  onlineUsers,
}: ChannelSidebarProps) {
  return (
    <aside className="channel-sidebar">
      <p className="channel-sidebar__community">{communityName.toUpperCase()}</p>
      <h2>Channels</h2>
      {channels.map((channel) => (
        <NavLink
          key={channel.id}
          to={`/channels/${channel.id}`}
          className={({ isActive }) =>
            isActive ? 'channel-link active' : 'channel-link'}
        >
          # {channel.name}
        </NavLink>
      ))}
      <button type="button">+ Add channel</button>
      <p className="channel-sidebar__online">
        ONLINE — {onlineUsers.length}
      </p>
      {onlineUsers.map((user) => (
        <span key={user.userId}>{user.username}</span>
      ))}
    </aside>
  )
}

export default ChannelSidebar
