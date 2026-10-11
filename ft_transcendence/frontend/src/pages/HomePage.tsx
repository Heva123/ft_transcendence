import { useState } from 'react'
import { Link } from 'react-router-dom'
import Feed from '../features/feed/components/Feed'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import './HomePage.css'

function MomentumCard() {
  return (
    <aside className="momentum-card">
      <strong>⚡ A little momentum</strong>
      <p>Small steps. Shared progress.</p>
      <span>12 friends online</span>
      <span>3 active conversations</span>
      <span>2 new community posts</span>
      <Link to="/channels">Open your channels</Link>
    </aside>
  )
}

function PeopleCard() {
  return (
    <aside className="people-card">
      <span>FIND YOUR PEOPLE</span>
      <h2>Systems Circle</h2>
      <p>C, C++ and the joy of understanding what happens underneath.</p>
      <Link to="/communities/2">Explore community</Link>
    </aside>
  )
}

function HomePage() {
  const [feedMode, setFeedMode] = useState<'global' | 'communities'>('global')
  const user = useCurrentUser()
  const username = user?.username ?? 'there'
  const initials = user?.username.slice(0, 2).toUpperCase() ?? '--'

  return (
    <section className="home-page">
      <header className="home-page__header">
        <div>
          <h1>Good to see you, {username}.</h1>
          <p>A new day for sharing, learning and building together.</p>
        </div>
        <div className="home-page__actions">
          <span className="community-badge">42 COMMUNITY</span>
          <Link className="create-post-link" to="/posts/new">
            + Create post
          </Link>
        </div>
      </header>

      <div className="home-layout">
        <main>
          <div className="feed-tabs">
            <button
              className={feedMode === 'global' ? 'feed-tab active' : 'feed-tab'}
              onClick={() => setFeedMode('global')}
            >
              GLOBAL FEED
            </button>
            <button
              className={feedMode === 'communities' ? 'feed-tab active' : 'feed-tab'}
              onClick={() => setFeedMode('communities')}
            >
              My communities
            </button>
          </div>

          <section className="post-composer">
            <div className="post-composer__avatar">{initials}</div>
            <div>
              <p>What are you building today?</p>
              <Link className="post-composer__action" to="/posts/new">
                Share an idea
              </Link>
              <Link className="post-composer__photo" to="/posts/new">
                Add a photo
              </Link>
            </div>
          </section>

          <Feed mode={feedMode} />
        </main>

        <div className="home-rail">
          <MomentumCard />
          <PeopleCard />
        </div>
      </div>
    </section>
  )
}

export default HomePage
