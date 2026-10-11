import CommunityCard from '../features/chat/components/CommunityCard'
import { useMyCommunities } from '../features/chat/hooks/useMyCommunities'
import './CommunitiesPage.css'

function CommunitiesPage() {
  const { communities, error } = useMyCommunities()

  return (
    <section className="communities-page">
      <header className="communities-page__header">
        <div>
          <h1>Find your corner.</h1>
          <p>A place for every curiosity. Find yours.</p>
        </div>
        <button className="create-community">+ Create community</button>
      </header>

      {error && <p>{error}</p>}

      <div className="community-grid">
        {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </section>
  )
}

export default CommunitiesPage
