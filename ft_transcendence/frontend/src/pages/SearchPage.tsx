import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getMyCommunities, type ApiCommunity } from '../features/chat/api/chatApi'
import type { SearchRequest, SearchType, SortOrder } from '../features/search/api/searchApi'
import CommunityResults from '../features/search/components/CommunityResults'
import PeopleResults from '../features/search/components/PeopleResults'
import PostResults from '../features/search/components/PostResults'
import './SearchPage.css'

export type SearchTab = 'people' | 'communities' | 'posts'

const TABS: { id: SearchTab; label: string; type: SearchType; heading: string }[] = [
  { id: 'people', label: 'People', type: 'users', heading: 'Find your next collaborator.' },
  { id: 'communities', label: 'Communities', type: 'communities', heading: 'Find a place to belong.' },
  { id: 'posts', label: 'Posts', type: 'posts', heading: 'Ideas worth finding.' },
]

// People sort by name. Communities and posts sort by date.
function sortOptions(tab: SearchTab): { value: SortOrder; label: string }[] {
  if (tab === 'people')
    return [{ value: 'asc', label: 'Name A–Z' }, { value: 'desc', label: 'Name Z–A' }]
  return [{ value: 'desc', label: 'Newest first' }, { value: 'asc', label: 'Oldest first' }]
}

function SearchForm({ initial, onSearch, onClear }: {
  initial: string
  onSearch: (value: string) => void
  onClear: () => void
}) {
  const [input, setInput] = useState(initial)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = input.trim()
    if (value)
      onSearch(value)
  }

  return (
    <form className="search-controls" onSubmit={submit} role="search">
      <input value={input} aria-label="Search"
        onChange={(event) => setInput(event.target.value)}
        placeholder="Search people, communities, posts..." />
      <button type="submit">Search</button>
      <button type="button" onClick={() => { setInput(''); onClear() }}>Clear</button>
    </form>
  )
}

function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const query = params.get('q') ?? ''
  const tab = (TABS.find((item) => item.id === params.get('tab'))?.id ?? 'people') as SearchTab
  const options = sortOptions(tab)
  const sort = (options.find((item) => item.value === params.get('sort'))?.value ?? options[0].value)
  const page = Math.max(1, Number(params.get('page')) || 1)
  const communityId = tab === 'posts' ? params.get('community') ?? '' : ''
  const current = TABS.find((item) => item.id === tab) ?? TABS[0]

  useEffect(() => {
    getMyCommunities().then(setCommunities).catch(() => setCommunities([]))
  }, [])

  // Changing any filter starts again from page 1.
  function update(changes: Record<string, string>) {
    const next = new URLSearchParams(params)

    Object.entries(changes).forEach(([key, value]) => {
      if (value)
        next.set(key, value)
      else
        next.delete(key)
    })
    if (!('page' in changes))
      next.delete('page')
    setParams(next)
  }

  const request: SearchRequest = {
    query,
    type: current.type,
    page,
    sort,
    communityId: communityId || undefined,
  }
  const resultProps = {
    request,
    onPage: (value: number) => update({ page: String(value) }),
    onClear: () => setParams({}),
  }

  return (
    <main className="search-page">
      <header className="search-page__header">
        <div>
          <h1>{current.heading}</h1>
          <p>Search across your campus community.</p>
        </div>
        <span className="community-badge">42 COMMUNITY</span>
      </header>

      <SearchForm key={query} initial={query}
        onSearch={(value) => update({ q: value })}
        onClear={() => setParams({})} />

      <nav className="search-tabs" aria-label="Search type">
        {TABS.map((item) => (
          <button key={item.id} type="button"
            className={tab === item.id ? 'active' : ''}
            aria-pressed={tab === item.id}
            onClick={() => update({ tab: item.id, sort: '', community: '' })}>
            {item.label}
          </button>
        ))}
      </nav>

      {query && (
        <div className="search-filters">
          {tab === 'posts' && (
            <label>
              Community:
              <select value={communityId}
                onChange={(event) => update({ community: event.target.value })}>
                <option value="">All posts I can see</option>
                {communities.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            Sort:
            <select value={sort}
              onChange={(event) => update({ sort: event.target.value })}>
              {options.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      <section className="search-results">
        {query && tab === 'people' && <PeopleResults {...resultProps} />}
        {query && tab === 'communities' && <CommunityResults {...resultProps} />}
        {query && tab === 'posts' && <PostResults {...resultProps} />}
        {!query && <p>Enter something to search.</p>}
      </section>
    </main>
  )
}

export default SearchPage
