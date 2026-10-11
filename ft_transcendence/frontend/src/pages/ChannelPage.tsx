import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChannelSidebar from '../features/chat/components/ChannelSidebar'
import CreateChannelModal from '../features/chat/components/CreateChannelModal'
import ChatArea from '../features/chat/components/ChatArea'
import MessageHistory from '../features/chat/components/MessageHistory'
import {
  createChannel,
  getChannel,
  getChannels,
  getCommunity,
} from '../features/chat/api/chatApi'
import { usePresence } from '../features/presence/hooks/usePresence'
import type { Channel } from '../features/chat/types/Channel'
import './ChannelPage.css'

type ChannelData = {
  channel: Channel
  channels: Channel[]
  communityName: string
  canCreateChannel: boolean
}

async function loadChannelData(channelId: string) {
  let channel: Channel
  let channels: Channel[]
  let community: Awaited<ReturnType<typeof getCommunity>>
  let role: string

  channel = await getChannel(channelId)
  channels = await getChannels(channel.communityId)
  community = await getCommunity(channel.communityId)
  role = community.members?.[0]?.role ?? ''

  return {
    channel,
    channels,
    communityName: community.name,
    canCreateChannel: ['OWNER', 'ADMIN', 'MODERATOR'].includes(role),
  }
}

function ChannelRoom({ data }: { data: ChannelData }) {
  const onlineUsers = usePresence()
  const navigate = useNavigate()
  const [showHistory, setShowHistory] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  async function handleCreate(name: string, description: string) {
    let channel: Channel

    channel = await createChannel(data.channel.communityId, {
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
        communityName={data.communityName}
        onlineUsers={onlineUsers}
        onAddChannel={() => setShowCreate(true)}
        canCreateChannel={data.canCreateChannel}
      />
      <div className="channel-room">
        <header className="channel-room__header">
          <div>
            <h1># {data.channel.name}</h1>
            <p>{data.communityName} · {onlineUsers.length} online</p>
          </div>
          <button type="button"
            onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Current messages' : 'Earlier messages'}
          </button>
        </header>

        {showHistory
          ? <MessageHistory channelId={data.channel.id} />
          : <ChatArea selectedChannelId={data.channel.id} />}
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

function ChannelPage() {
  const { channelId = '' } = useParams()
  const [data, setData] = useState<ChannelData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    loadChannelData(channelId)
      .then(setData)
      .catch(() => setError('Unable to load channel.'))
  }, [channelId])

  if (error)
    return <h1>{error}</h1>
  if (!data)
    return <p>Loading channel...</p>

  return <ChannelRoom data={data} />
}

export default ChannelPage
