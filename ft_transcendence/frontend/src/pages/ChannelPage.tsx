import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChannelSidebar from '../features/chat/components/ChannelSidebar'
import CreateChannelModal from '../features/chat/components/CreateChannelModal'
import ChatArea from '../features/chat/components/ChatArea'
import {
  createChannel,
  getChannel,
  getChannels,
  getCommunity,
  getMembers,
} from '../features/chat/api/chatApi'
import { usePresence } from '../features/presence/hooks/usePresence'
import type { Channel } from '../features/chat/types/Channel'
import type { ChannelMember } from '../features/chat/types/Message'
import './ChannelPage.css'

type ChannelData = {
  channel: Channel
  channels: Channel[]
  communityName: string
  members: ChannelMember[]
  canCreateChannel: boolean
}

async function loadChannelData(channelId: string): Promise<ChannelData> {
  const channel = await getChannel(channelId)
  const [channels, community, members] = await Promise.all([
    getChannels(channel.communityId),
    getCommunity(channel.communityId),
    getMembers(channel.communityId),
  ])
  const role = community.members?.[0]?.role ?? ''

  return {
    channel,
    channels,
    communityName: community.name,
    members: members.map((member) => ({
      id: member.user.id,
      username: member.user.username,
    })),
    canCreateChannel: ['OWNER', 'ADMIN', 'MODERATOR'].includes(role),
  }
}

function ChannelRoom({ data }: { data: ChannelData }) {
  const onlineUsers = usePresence()
  const navigate = useNavigate()
  const [showHistory, setShowHistory] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  // Only members of this community count as online here.
  const onlineIds = new Set(onlineUsers.map((user) => user.userId))
  const onlineMembers = data.members.filter((member) => onlineIds.has(member.id))

  async function handleCreate(name: string, description: string) {
    const channel = await createChannel(data.channel.communityId, {
      name,
      description: description || undefined,
    })

    setShowCreate(false)
    navigate(`/channels/${channel.id}`)
  }

  return (
    <section className="channel-page">
      <ChannelSidebar
        channels={data.channels}
        activeChannelId={data.channel.id}
        communityName={data.communityName}
        onlineMembers={onlineMembers}
        onAddChannel={() => setShowCreate(true)}
        canCreateChannel={data.canCreateChannel}
      />
      <div className="channel-room">
        <header className="channel-room__header">
          <div>
            <h1># {data.channel.name}</h1>
            <p>{data.communityName} · {onlineMembers.length} online</p>
          </div>
          <button type="button"
            onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Current messages' : 'Earlier messages'}
          </button>
        </header>

        <ChatArea
          selectedChannelId={data.channel.id}
          members={data.members}
          showHistory={showHistory}
        />
      </div>

      {showCreate && (
        <CreateChannelModal
          onCancel={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </section>
  )
}

type PageState = {
  channelId: string
  data: ChannelData | null
  error: string
}

function ChannelPage() {
  const { channelId = '' } = useParams()
  const [state, setState] = useState<PageState>({
    channelId: '',
    data: null,
    error: '',
  })

  useEffect(() => {
    let active = true

    loadChannelData(channelId)
      .then((data) => {
        if (active)
          setState({ channelId, data, error: '' })
      })
      .catch(() => {
        if (active)
          setState({ channelId, data: null, error: 'Unable to load channel.' })
      })
    return () => {
      active = false
    }
  }, [channelId])

  if (state.channelId !== channelId)
    return <p>Loading channel...</p>
  if (state.error || !state.data)
    return <h1>{state.error || 'Unable to load channel.'}</h1>

  return <ChannelRoom key={channelId} data={state.data} />
}

export default ChannelPage
