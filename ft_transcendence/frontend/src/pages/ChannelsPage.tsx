import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getChannels,
  getMyCommunities,
} from '../features/chat/api/chatApi'

async function findFirstChannel() {
  let communities
  let channels

  communities = await getMyCommunities()
  if (!communities.length)
    return ''
  channels = await getChannels(communities[0].id)
  return channels[0]?.id ?? ''
}

function ChannelsPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    findFirstChannel()
      .then((id) => id
        ? navigate(`/channels/${id}`, { replace: true })
        : setError('No channels yet.'))
      .catch(() => setError('Unable to load channels.'))
  }, [navigate])

  if (error)
    return <h1>{error}</h1>
  return <p>Loading your channels...</p>
}

export default ChannelsPage
