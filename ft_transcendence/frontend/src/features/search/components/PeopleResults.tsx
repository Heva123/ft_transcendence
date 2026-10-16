import type { SearchRequest } from '../api/searchApi'
import { usePagedSearch } from '../hooks/usePagedSearch'
import PersonResultCard from './PersonResultCard'
import SearchEmptyState from './SearchEmptyState'
import SearchPager, { PageSummary } from './SearchPager'

type Props = {
  request: SearchRequest
  onPage: (page: number) => void
  onClear: () => void
}

function PeopleResults({ request, onPage, onClear }: Props) {
  // The same list shows people by name, or by skill on the Skills tab.
  const state = usePagedSearch(request, (data) =>
    request.type === 'skills' ? data.results.skills : data.results.users)

  if (state.error)
    return <p role="alert">{state.error}</p>
  if (state.loading)
    return <p role="status">Searching...</p>
  if (!state.total)
    return <SearchEmptyState query={request.query} onClear={onClear} />

  return (
    <>
      <PageSummary {...state} />
      <div className="people-results">
        {state.items.map((person) =>
          <PersonResultCard key={person.id} person={person}
            highlight={request.type === 'skills' ? request.query : undefined} />)}
      </div>
      <SearchPager {...state} onChange={onPage} />
    </>
  )
}

export default PeopleResults
