import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../../api/apiClient'
import { getMyCommunities } from '../../chat/api/chatApi'
import type { SearchCommunity } from '../api/searchApi'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import { usePagedSearch } from '../hooks/usePagedSearch'
import SearchEmptyState from './SearchEmptyState'
import SearchPager from './SearchPager'

type Props = { query: string; topic: SearchTopic; sort: SearchSort }
type CardProps = { item: SearchCommunity; member: boolean }

function CommunityResultCard({ item, member }: CardProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState({ joining: false, error: '' })

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
      {member ? <Link to={`/communities/${item.id}`}>View community</Link> : <button type="button" onClick={handleJoin} disabled={status.joining}>{status.joining ? 'Joining...' : 'Join community'}</button>}
    </footer>
    {status.error && <p className="form-error">{status.error}</p>}
  </article>
}

function CommunityResults({ query, sort }: Props) {
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set())
  const state = usePagedSearch(
    query,
    'communities',
    (data) => data.results.communities,
    sort === 'az' ? (a, b) => a.name.localeCompare(b.name) : undefined,
  )

  useEffect(() => {
    getMyCommunities().then((items) => setMemberIds(new Set(items.map((item) => item.id))))
      .catch(() => setMemberIds(new Set()))
  }, [])

  if (state.error) return <p>{state.error}</p>
  if (state.loading) return <p>Searching...</p>
  if (!state.total) return <SearchEmptyState query={query} onClear={() => window.location.assign('/search')} />
  return <>
    <p className="search-page-count">Page {state.page} of {state.pages}</p>
    <div className="community-search-results">{state.items.map((item) => <CommunityResultCard key={item.id} item={item} member={memberIds.has(item.id)} />)}</div>
    <SearchPager page={state.page} pages={state.pages} onChange={state.setPage} />
  </>
}

export default CommunityResults
