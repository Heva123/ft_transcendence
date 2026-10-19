import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import ChannelSidebar from '../features/chat/components/ChannelSidebar'
import ChannelFormModal from '../features/chat/components/ChannelFormModal'
import ChatArea from '../features/chat/components/ChatArea'
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannels,
  getCommunity,
  getMembers,
  updateChannel,
} from '../features/chat/api/chatApi'
import {
  canCreateChannel,
  canDeleteChannel,
  canEditChannel,
} from '../features/chat/channelRoles'
import { usePresence } from '../features/presence/hooks/usePresence'
import type { Channel } from '../features/chat/types/Channel'
import type { ChannelMember } from '../features/chat/types/Message'
import './ChannelPage.css'

type ChannelData = {
  channel: Channel
  channels: Channel[]
  communityName: string
  members: ChannelMember[]
  role: string
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
    role,
  }
}

function ChannelRoom({ data }: { data: ChannelData }) {
  const onlineUsers = usePresence()
  const navigate = useNavigate()
  const [showHistory, setShowHistory] = useState(false)
  const [modal, setModal] = useState<'none' | 'create' | 'edit' | 'delete'>('none')
  const [channel, setChannel] = useState(data.channel)
  const [channels, setChannels] = useState(data.channels)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  // Only members of this community count as online here.
  const onlineIds = new Set(onlineUsers.map((user) => user.userId))
  const onlineMembers = data.members.filter((member) => onlineIds.has(member.id))

  async function handleCreate(values: { name: string; description: string }) {
    const created = await createChannel(channel.communityId, {
      name: values.name,
      description: values.description || undefined,
    })

    setModal('none')
    navigate(`/channels/${created.id}`)
  }

  async function handleEdit(values: { name: string; description: string }) {
    const updated = await updateChannel(channel.id, values)

    setChannel(updated)
    setChannels((current) => current.map((entry) =>
      entry.id === updated.id ? updated : entry))
    setModal('none')
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteChannel(channel.id)
      const next = channels.find((entry) => entry.id !== channel.id)

      navigate(next ? `/channels/${next.id}` : `/communities/${channel.communityId}`,
        { replace: true })
    } catch {
      setDeleting(false)
      setModal('none')
      setError('Unable to delete the channel. Try again.')
    }
  }

  return (
    <section className="channel-page">
      <ChannelSidebar
        channels={channels}
        activeChannelId={channel.id}
        communityName={data.communityName}
        onlineMembers={onlineMembers}
        onAddChannel={() => setModal('create')}
        canCreateChannel={canCreateChannel(data.role)}
      />
      <div className="channel-room">
        <header className="channel-room__header">
          <div>
            <h1># {channel.name}</h1>
            <p>
              <Link to={`/communities/${channel.communityId}`}>{data.communityName}</Link>
              {' · '}{onlineMembers.length} online
            </p>
            {channel.description && (
              <p className="channel-room__description">{channel.description}</p>
            )}
          </div>
          <div className="channel-room__tools">
            <button type="button"
              onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? 'Current messages' : 'Earlier messages'}
            </button>
            {canEditChannel(data.role) && (
              <button type="button" onClick={() => setModal('edit')}>
                Channel settings
              </button>
            )}
          </div>
        </header>
        {error && <p className="channel-room__error" role="alert">{error}</p>}

        <ChatArea
          selectedChannelId={channel.id}
          members={data.members}
          showHistory={showHistory}
        />
      </div>

      {modal === 'create' && (
        <ChannelFormModal
          title="Create channel"
          intro={`Add a new channel to ${data.communityName}. Every member can read and post in it.`}
          submitLabel="Create channel"
          onCancel={() => setModal('none')}
          onSubmit={handleCreate}
        />
      )}
      {modal === 'edit' && (
        <ChannelFormModal
          title="Channel settings"
          intro="Rename the channel or change what it is for."
          submitLabel="Save changes"
          initial={{ name: channel.name, description: channel.description ?? '' }}
          onCancel={() => setModal('none')}
          onSubmit={handleEdit}
          onDelete={canDeleteChannel(data.role) ? () => setModal('delete') : undefined}
        />
      )}
      {modal === 'delete' && (
        <ConfirmDialog
          title={`Delete #${channel.name}?`}
          message="All messages in this channel will be deleted for everyone. This action cannot be undone."
          confirmLabel="Delete channel"
          busy={deleting}
          onCancel={() => setModal('edit')}
          onConfirm={handleDelete}
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
