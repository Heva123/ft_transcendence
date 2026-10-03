import CommunityCard from '../features/chat/components/CommunityCard'
import { mockCommunities } from '../features/chat/data/mockCommunities'
import './CommunitiesPage.css'

function CommunitiesPage() {
  return (
    <section className="communities-page">
      <header className="communities-page__header">
        <div>
          <h1>Find your corner.</h1>
          <p>A place for every curiosity. Find yours.</p>
        </div>

        <button className="create-community">+ Create community</button>
      </header>

      <div className="community-tools">
        <input type="search" placeholder="Search communities..." />
        <select>
          <option>All topics</option>
          <option>Programming</option>
        </select>
      </div>

      <div className="community-grid">
        {mockCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </section>
  )
}

export default CommunitiesPage