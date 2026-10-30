import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getChannels,
  getMyCommunities,
} from '../api/chatApi'

type Result = { channelId: string; communities: number }

// Open the first channel of the first community that has one.
async function findFirstChannel(): Promise<Result> {
  const communities = await getMyCommunities()

  for (const community of communities) {
    const channels = await getChannels(community.id)

    if (channels.length)
      return { channelId: channels[0].id, communities: communities.length }
  }
  return { channelId: '', communities: communities.length }
}

function ChannelsPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'error' | 'noCommunity' | 'noChannel'>('loading')

  useEffect(() => {
    findFirstChannel()
      .then((result) => {
        if (result.channelId)
          navigate(`/channels/${result.channelId}`, { replace: true })
        else
          setState(result.communities ? 'noChannel' : 'noCommunity')
      })
      .catch(() => setState('error'))
  }, [navigate])

  if (state === 'loading')
    return <p>Loading your channels...</p>
  if (state === 'error')
    return <h1>Unable to load channels.</h1>

  // Channels belong to a community, so the next step is always a community.
  return (
    <section className="channels-empty">
      <h1>No channels yet.</h1>
      <p>
        {state === 'noCommunity'
          ? 'Channels live inside communities. Join or create a community first.'
          : 'Your communities have no channels yet. Open a community: owners, admins and moderators can add one with "+ New channel".'}
      </p>
      <Link to="/communities">Go to communities</Link>
    </section>
  )
}

export default ChannelsPage
