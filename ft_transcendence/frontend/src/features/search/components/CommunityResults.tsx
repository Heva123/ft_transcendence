import { Link } from 'react-router-dom'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import { usePagedSearch } from '../hooks/usePagedSearch'
import SearchEmptyState from './SearchEmptyState'
import SearchPager from './SearchPager'

type Props = {
  query: string
  topic: SearchTopic
  sort: SearchSort
}

function CommunityResults({ query, sort }: Props) {
  let state

  state = usePagedSearch(
    query,
    'communities',
    (data) => data.results.communities,
    sort === 'az'
      ? (a, b) => a.name.localeCompare(b.name)
      : undefined,
  )

  if (state.error)
    return <p>{state.error}</p>
  if (state.loading)
    return <p>Searching...</p>
  if (!state.total)
    return <SearchEmptyState query={query}
      onClear={() => window.location.assign('/search')} />

  return (
    <>
      <p className="search-page-count">
        Page {state.page} of {state.pages}
      </p>
      <div className="community-search-results">
        {state.items.map((item) => (
          <article className="community-card" key={item.id}>
            <div className="community-card__mark">
              {item.name.slice(0, 2).toUpperCase()}
            </div>
            <h2>{item.name}</h2>
            <p className="community-card__meta">42 COMMUNITY</p>
            <p>{item.description ?? ''}</p>
            <footer className="community-card__footer">
              <span>PROGRAMMING</span>
              <Link to={`/communities/${item.id}`}>
                View community
              </Link>
            </footer>
          </article>
        ))}
      </div>
      <SearchPager page={state.page} pages={state.pages}
        onChange={state.setPage} />
    </>
  )
}

export default CommunityResults
