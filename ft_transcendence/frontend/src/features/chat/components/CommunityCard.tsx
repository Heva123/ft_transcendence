import { Link } from 'react-router-dom'
import type { Community } from '../types/Community'

type Props = {
  community: Community
}

function CommunityCard({ community }: Props) {
  return (
    <article className="community-card">
      <div className="community-card__mark">
        {community.name.slice(0, 2).toUpperCase()}
      </div>
      <h2>{community.name}</h2>
      <p className="community-card__meta">
        {community.members} members
      </p>
      <p>{community.description}</p>
      <footer className="community-card__footer">
        <Link to={`/communities/${community.id}`}>
          View community
        </Link>
      </footer>
    </article>
  )
}

export default CommunityCard
