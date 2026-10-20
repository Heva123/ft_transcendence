import { NavLink } from 'react-router-dom'
import { useChannelUnread } from '../hooks/useChannelUnread'
import type { Channel } from '../types/Channel'
import type { ChannelMember } from '../types/Message'

type ChannelSidebarProps = {
  channels: Channel[]
  activeChannelId: string
  communityName: string
  onlineMembers: ChannelMember[]
  onAddChannel: () => void
  canCreateChannel: boolean
}

function ChannelSidebar({
  channels,
  activeChannelId,
  communityName,
  onlineMembers,
  onAddChannel,
  canCreateChannel,
}: ChannelSidebarProps) {
  const unread = useChannelUnread(
    channels.map((channel) => channel.id),
    activeChannelId,
  )

  return (
    <aside className="channel-sidebar">
      <p className="channel-sidebar__community">{communityName.toUpperCase()}</p>
      <h2>Channels</h2>
      {channels.map((channel) => {
        const count = unread(channel.id)

        return (
          <NavLink
            key={channel.id}
            to={`/channels/${channel.id}`}
            className={({ isActive }) =>
              isActive ? 'channel-link active' : 'channel-link'}
          >
            <span># {channel.name}</span>
            {count > 0 && (
              <span className="channel-unread" aria-label={`${count} unread`}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </NavLink>
        )
      })}
      {canCreateChannel && (
        <button type="button" onClick={onAddChannel}>
          + Add channel
        </button>
      )}
      <p className="channel-sidebar__online">
        ONLINE — {onlineMembers.length}
      </p>
      {onlineMembers.map((user) => (
        <span key={user.id} className="channel-sidebar__person">{user.username}</span>
      ))}
    </aside>
  )
}

export default ChannelSidebar
