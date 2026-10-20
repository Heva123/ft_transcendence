import { useState } from 'react'
import { Link } from 'react-router-dom'
import Feed from '../features/feed/components/Feed'
import UserAvatar from "../components/UserAvatar";
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { canWriteSite } from '../features/auth/utils/sitePermissions'
import './HomePage.css'

function MomentumCard() {
  return <aside className="momentum-card">
    <strong>⚡ Keep the momentum</strong>
    <p>Continue your conversations and community work.</p>
    <Link to="/channels">Open your channels</Link>
  </aside>
}

function PeopleCard() {
  return <aside className="people-card">
    <span>FIND YOUR PEOPLE</span>
    <h2>Discover communities</h2>
    <p>Find students who share your interests, projects and learning goals.</p>
    <Link to="/communities/discover">Explore communities</Link>
  </aside>
}

function HomePage() {
  const [feedMode, setFeedMode] = useState<'global' | 'communities'>('global')
  const user = useCurrentUser()
  const username = user?.username ?? 'there'
  // Guests (read-only) get no create buttons.
  const canWrite = canWriteSite(user)

  return <section className="home-page">
    <header className="home-page__header">
      <div><h1>Good to see you, {username}.</h1><p>A new day for sharing, learning and building together.</p></div>
      <div className="home-page__actions"><span className="community-badge">42 COMMUNITY</span>{canWrite && <Link className="create-post-link" to="/posts/new">+ Create post</Link>}</div>
    </header>
    <div className="home-layout"><main>
      <div className="feed-tabs">
        <button className={feedMode === 'global' ? 'feed-tab active' : 'feed-tab'} onClick={() => setFeedMode('global')}>GLOBAL FEED</button>
        <button className={feedMode === 'communities' ? 'feed-tab active' : 'feed-tab'} onClick={() => setFeedMode('communities')}>My communities</button>
      </div>
      {canWrite && <section className="post-composer">
        <div className="post-composer__avatar">
          <UserAvatar
            username={user?.username ?? "User"}
            avatarUrl={user?.avatarUrl}
            className="post-composer__avatar-img"
            alt={`${user?.username ?? "User"}'s avatar`}
          />
        </div>

        <div>
          <p>What are you building today?</p>
          <Link className="post-composer__action" to="/posts/new">
            Share an idea
          </Link>
          <Link className="post-composer__photo" to="/posts/new">
            Add a photo
          </Link>
        </div>
      </section>}
      <Feed mode={feedMode} />
    </main><div className="home-rail"><MomentumCard /><PeopleCard /></div></div>
  </section>
}

export default HomePage
