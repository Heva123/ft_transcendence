import type { Community } from '../types/Community'

type CommunityHeaderProps = {
  community: Community
}

function CommunityHeader({ community }: CommunityHeaderProps) {
  return (
    <header className="community-header">
      <div className="community-header__mark">
        {community.name.slice(0, 2).toUpperCase()}
      </div>

      <div>
        <h1>{community.name}</h1>
        <p>{community.description}</p>
        <small>
          {community.members} members · {community.activity}
        </small>
      </div>
    </header>
  )
}

export default CommunityHeader