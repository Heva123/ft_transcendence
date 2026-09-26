import Feed from '../features/feed/components/Feed'
import { Link } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  return (
    <section className="home-page">
      <header className="home-page__header">
        <p className="home-page__eyebrow">42 COMMUNITY</p>
        <h1>Good to see you, Afnan.</h1>
        <p>A new day for sharing, learning and building together.</p>
      </header>

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

            <Link className="post-composer__action" to="/posts/new">
              Add a photo
            </Link>
        </div>
      </section>

      <Feed />
    </section>
  )
}

export default HomePage