import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getChannels,
  getCommunity,
} from '../features/chat/api/chatApi'
import { toCommunity } from '../features/chat/api/communityMapper'
import CommunityHeader from '../features/chat/components/CommunityHeader'
import ConversationsPanel from '../features/chat/components/ConversationsPanel'
import type { Channel } from '../features/chat/types/Channel'
import type { Community } from '../features/chat/types/Community'
import { getCommunityFeed } from '../features/feed/api/feedApi'
import PostCard from '../features/feed/components/PostCard'
import type { Post } from '../features/feed/types/Post'
import './CommunityPage.css'

type Data = {
  community: Community
  channels: Channel[]
  posts: Post[]
}

async function loadData(id: string) {
  let community
  let channels
  let feed

  [community, channels, feed] = await Promise.all([
    getCommunity(id),
    getChannels(id),
    getCommunityFeed(id),
  ])
  return {
    community: toCommunity(community),
    channels,
    posts: feed.posts,
  }
}

function CommunityView({ data }: { data: Data }) {
  return (
    <section className="community-page">
      <CommunityHeader community={data.community} />
      <nav className="community-tabs">
        <button className="active">Community feed</button>
        <button>Channels</button>
        <button>Members</button>
        <button>Roles & permissions</button>
      </nav>
      <div className="community-layout">
        <main className="community-feed">
          <Link className="community-post-button"
            to={`/posts/new?community=${data.community.id}`}>
            + Post to {data.community.name}
          </Link>
          {data.posts.length
            ? data.posts.map((post) =>
              <PostCard key={post.id} post={post} />)
            : <p>Your community is ready. Share the first idea.</p>}
        </main>
        <ConversationsPanel channels={data.channels} />
      </div>
    </section>
  )
}

function CommunityPage() {
  const { communityId = '' } = useParams()
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData(communityId)
      .then(setData)
      .catch(() => setError('Unable to load community.'))
  }, [communityId])

  if (error)
    return <h1>{error}</h1>
  if (!data)
    return <p>Loading community...</p>
  return <CommunityView data={data} />
}

export default CommunityPage
