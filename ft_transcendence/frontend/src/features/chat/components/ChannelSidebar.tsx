import { NavLink } from 'react-router-dom'
import type { Channel } from '../types/Channel'

type ChannelSidebarProps = {
  channels: Channel[]
  communityName: string
}

function ChannelSidebar({ channels, communityName }: ChannelSidebarProps) {
  return (
    <aside className="channel-sidebar">
      <p className="channel-sidebar__community">{communityName.toUpperCase()}</p>
      <h2>Channels</h2>

      {channels.map((channel) => (
        <NavLink
          key={channel.id}
          to={`/channels/${channel.id}`}
          className={({ isActive }) =>
            isActive ? 'channel-link active' : 'channel-link'
          }
        >
          # {channel.name}
        </NavLink>
      ))}

      <button type="button">+ Add channel</button>

      <p className="channel-sidebar__online">ONLINE — 3</p>
      <span>Heba</span><span>Afnan</span><span>Noor</span>
    </aside>
  )
}

export default ChannelSidebar