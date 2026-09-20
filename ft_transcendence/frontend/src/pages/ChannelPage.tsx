import { useParams } from 'react-router-dom'
import ChannelSidebar from '../features/chat/components/ChannelSidebar'
import ChatArea from '../features/chat/components/ChatArea'
import { mockChannels } from '../features/chat/data/mockChannels'
import { mockCommunities } from '../features/chat/data/mockCommunities'
import type { Channel } from '../features/chat/types/Channel'
import type { Community } from '../features/chat/types/Community'
import './ChannelPage.css'

type ChannelWorkspaceProps = {
  channel: Channel
  channels: Channel[]
  communityName: string
}

function ChannelWorkspace({ channel, channels, communityName }: ChannelWorkspaceProps) {
  return (
    <section className="channel-page">
      <ChannelSidebar channels={channels} communityName={communityName} />
      <div className="channel-room">
         <header className="channel-room__header">
         <div>
            <h1># {channel.name}</h1>
            <p>{communityName} · 3 online</p>
         </div>

         <button type="button">Earlier messages</button>
         </header>
        <ChatArea selectedChannelId={channel.id} />
      </div>
    </section>
  )
}

function ChannelPage() {
  let routeId: string | undefined
  let channelId: string
  let channel: Channel | undefined
  let community: Community | undefined
  let channels: Channel[]

  routeId = useParams().channelId
  channelId = routeId ?? ''
  channel = mockChannels.find((item) => item.id === channelId)
  community = mockCommunities.find((item) => item.id === channel?.communityId)
  channels = mockChannels.filter((item) => item.communityId === channel?.communityId)

  if (!channel || !community)
    return <h1>Channel not found.</h1>

  return <ChannelWorkspace channel={channel} channels={channels} communityName={community.name} />
}

export default ChannelPage