import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import { usePagedSearch } from '../hooks/usePagedSearch'
import PersonResultCard from './PersonResultCard'
import SearchEmptyState from './SearchEmptyState'
import SearchPager from './SearchPager'

type Props = {
  query: string
  topic: SearchTopic
  sort: SearchSort
}

function PeopleResults({ query, sort }: Props) {
  let state

  state = usePagedSearch(
    query,
    'users',
    (data) => data.results.users,
    sort === 'az'
      ? (a, b) => a.username.localeCompare(b.username)
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
      <div className="people-results">
        {state.items.map((person) =>
          <PersonResultCard key={person.id} person={person} />)}
      </div>
      <SearchPager page={state.page} pages={state.pages}
        onChange={state.setPage} />
    </>
  )
}

export default PeopleResults
