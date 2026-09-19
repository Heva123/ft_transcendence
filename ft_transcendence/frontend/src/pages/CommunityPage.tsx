import { Link, useParams } from 'react-router-dom'
import CommunityHeader from '../features/chat/components/CommunityHeader'
import ConversationsPanel from '../features/chat/components/ConversationsPanel'
import { mockChannels } from '../features/chat/data/mockChannels'
import { mockCommunities } from '../features/chat/data/mockCommunities'
import type { Channel } from '../features/chat/types/Channel'
import type { Community } from '../features/chat/types/Community'
import PostCard from '../features/feed/components/PostCard'
import { mockPosts } from '../features/feed/data/mockPosts'
import type { Post } from '../features/feed/types/Post'
import './CommunityPage.css'

function CommunityPage() {
  let community: Community | undefined
  let channels: Channel[]
  let posts: Post[]
  let communityId: number
  let routeId: string | undefined

  routeId = useParams().communityId
  communityId = Number(routeId)
  community = mockCommunities.find((item) => item.id === communityId)
  channels = mockChannels.filter((item) => item.communityId === communityId)
  posts = mockPosts.filter((item) => item.community?.id === communityId)

  if (!community)
    return <h1>Community not found.</h1>

  return (
    <section className="community-page">
      <CommunityHeader community={community} />
      <nav className="community-tabs">
        <button className="active">Community feed</button>
        <button>Channels</button><button>Members</button>
        <button>Roles & permissions</button>
      </nav>
      <div className="community-layout">
        <main className="community-feed">
          <Link
            className="community-post-button"
            to={`/posts/new?community=${community.id}`}
          >
            + Post to {community.name}
          </Link>
          {posts.length === 0 ? <p>Your community is ready. Share the first idea.</p> :
            posts.map((post) => <PostCard key={post.id} post={post} />)}
        </main>
        <ConversationsPanel channels={channels} />
      </div>
    </section>
  )
}

export default CommunityPage