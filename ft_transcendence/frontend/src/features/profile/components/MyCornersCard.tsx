import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyCommunities, type ApiCommunity } from '../../chat/api/chatApi'
import '../../friends/components/Friends.css'

// Communities I belong to, plus a link to friends (design p62 "My corners").
function MyCornersCard() {
  const [communities, setCommunities] = useState<ApiCommunity[] | null>(null)

  useEffect(() => {
    getMyCommunities().then(setCommunities).catch(() => setCommunities([]))
  }, [])

  return (
    <section className="profile-card">
      <h3>My corners</h3>
      {communities === null && <p className="settings-muted">Loading…</p>}
      {communities?.length === 0 && <p className="settings-muted">You have not joined a community yet.</p>}
      <div className="corner-list">
        {communities?.map((community) => (
          <Link key={community.id} className="people-button" to={`/communities/${community.id}`}>
            {community.name}
          </Link>
        ))}
      </div>
      <p><Link className="text-link" to="/friends">View friends</Link></p>
    </section>
  )
}

export default MyCornersCard
