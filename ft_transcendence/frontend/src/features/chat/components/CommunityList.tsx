import { mockCommunities } from '../data/mockCommunities'

type CommunityListProps = {
  selectedCommunityId: number
  onSelectCommunity: (communityId: number) => void
}

function CommunityList({
  selectedCommunityId,
  onSelectCommunity,
}: CommunityListProps) {
  return (
    <section className="community-list">
      <h2>Communities</h2>

      {mockCommunities.map((community) => (
        <button
          key={community.id}
          type="button"
          className={
            community.id === selectedCommunityId
              ? 'community-button active'
              : 'community-button'
          }
          onClick={() => onSelectCommunity(community.id)}
        >
          {community.name}
        </button>
      ))}
    </section>
  )
}

export default CommunityList