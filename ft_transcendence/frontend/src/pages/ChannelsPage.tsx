import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getChannels,
  getMyCommunities,
} from '../features/chat/api/chatApi'

// Open the first channel of the first community that has one.
async function findFirstChannel() {
  const communities = await getMyCommunities()

  for (const community of communities) {
    const channels = await getChannels(community.id)

    if (channels.length)
      return channels[0].id
  }
  return ''
}

function ChannelsPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    findFirstChannel()
      .then((id) => id
        ? navigate(`/channels/${id}`, { replace: true })
        : setError('No channels yet. Join a community or ask an admin to add a channel.'))
      .catch(() => setError('Unable to load channels.'))
  }, [navigate])

  if (error)
    return <h1>{error}</h1>
  return <p>Loading your channels...</p>
}

export default ChannelsPage
