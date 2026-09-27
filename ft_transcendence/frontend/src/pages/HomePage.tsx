import { Link } from 'react-router-dom'
import Feed from '../features/feed/components/Feed'
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
  return (
    <section className="home-page">
      <header className="home-page__header">
        <div>
          <h1>Good to see you, Afnan.</h1>
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
            <button className="feed-tab active">GLOBAL FEED</button>
            <button className="feed-tab">My communities</button>
          </div>

          <section className="post-composer">
            <div className="post-composer__avatar">AF</div>
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

          <Feed />
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
