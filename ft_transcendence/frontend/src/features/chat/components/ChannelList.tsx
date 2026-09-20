import { mockChannels } from '../data/mockChannels'
import './Chat.css'

type ChannelListProps = {
  selectedCommunityId: string
  selectedChannelId: string
  onSelectChannel: (channelId: string) => void
}

function ChannelList({
  selectedCommunityId,
  selectedChannelId,
  onSelectChannel,
}: ChannelListProps) {
  const visibleChannels = mockChannels.filter(
    (channel) => channel.communityId === selectedCommunityId,
  )

  return (
    <section className="channel-list">
      <h2>Channels</h2>

      {visibleChannels.map((channel) => (
        <button
          key={channel.id}
          type="button"
          className={
            channel.id === selectedChannelId
              ? 'channel-button active'
              : 'channel-button'
          }
          onClick={() => onSelectChannel(channel.id)}
        >
          # {channel.name}
        </button>
      ))}
    </section>
  )
}

export default ChannelList