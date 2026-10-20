import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../../api/apiClient'
import { getMyCommunities } from '../../chat/api/chatApi'
import type { SearchCommunity, SearchRequest } from '../api/searchApi'
import { usePagedSearch } from '../hooks/usePagedSearch'
import { useCurrentUser } from '../../auth/hooks/useCurrentUser'
import { canWriteSite } from '../../auth/utils/sitePermissions'
import SearchEmptyState from './SearchEmptyState'
import SearchPager, { PageSummary } from './SearchPager'

type Props = {
  request: SearchRequest
  onPage: (page: number) => void
  onClear: () => void
}
type CardProps = { item: SearchCommunity; member: boolean }

function CommunityResultCard({ item, member }: CardProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState({ joining: false, error: '' })
  // Guests can look at communities but cannot join.
  const canJoin = canWriteSite(useCurrentUser())

  async function handleJoin() {
    try {
      setStatus({ joining: true, error: '' })
      await apiRequest(`/communities/${item.id}/join`, { method: 'POST' })
      navigate(`/communities/${item.id}`)
    } catch { setStatus({ joining: false, error: 'Unable to join this community.' }) }
  }

  return <article className="community-card">
    <div className="community-card__mark">{item.name.slice(0, 2).toUpperCase()}</div>
    <h2>{item.name}</h2><p className="community-card__meta">42 COMMUNITY</p><p>{item.description ?? ''}</p>
    <footer className="community-card__footer"><span>COMMUNITY</span>
      {member ? <Link to={`/communities/${item.id}`}>View community</Link> : canJoin && <button type="button" onClick={handleJoin} disabled={status.joining}>{status.joining ? 'Joining...' : 'Join community'}</button>}
    </footer>
    {status.error && <p className="form-error">{status.error}</p>}
  </article>
}

function CommunityResults({ request, onPage, onClear }: Props) {
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set())
  const state = usePagedSearch(request, (data) => data.results.communities)

  useEffect(() => {
    getMyCommunities().then((items) => setMemberIds(new Set(items.map((item) => item.id))))
      .catch(() => setMemberIds(new Set()))
  }, [])

  if (state.error) return <p role="alert">{state.error}</p>
  if (state.loading) return <p role="status">Searching...</p>
  if (!state.total) return <SearchEmptyState query={request.query} onClear={onClear} />
  return <>
    <PageSummary {...state} />
    <div className="community-search-results">{state.items.map((item) => <CommunityResultCard key={item.id} item={item} member={memberIds.has(item.id)} />)}</div>
    <SearchPager {...state} onChange={onPage} />
  </>
}

export default CommunityResults
