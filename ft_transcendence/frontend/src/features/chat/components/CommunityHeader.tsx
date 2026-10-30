import type { Community } from '../../communities/types/Community'

type Props = {
  community: Community
}

function CommunityHeader({ community }: Props) {
  return (
    <header className="community-header">
      <div className="community-header__mark">
        {community.name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <h1>{community.name}</h1>
        <p>{community.description}</p>
        <small>{community.members} members</small>
      </div>
    </header>
  )
}

export default CommunityHeader
