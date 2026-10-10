import { useEffect, useState } from 'react'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import { mockPeople } from '../data/mockPeople'
import PersonResultCard from './PersonResultCard'
import SearchEmptyState from './SearchEmptyState'

type Props = {
  query: string
  topic: SearchTopic
  sort: SearchSort
}

function PeopleResults({ query, topic, sort }: Props) {
  const [page, setPage] = useState(1)
  const value = query.trim().toLowerCase()
  let matches = mockPeople.filter((person) =>
    `${person.name} ${person.skills.join(' ')} ${person.topic}`
      .toLowerCase().includes(value))

  if (topic !== 'all')
    matches = matches.filter((person) =>
      person.topic.toLowerCase() === topic)
  if (sort === 'az')
    matches = [...matches].sort((a, b) => a.name.localeCompare(b.name))

  const pages = Math.max(1, Math.ceil(matches.length / 3))
  const items = matches.slice((page - 1) * 3, page * 3)

  useEffect(() => setPage(1), [query, topic, sort])

  if (!matches.length)
    return <SearchEmptyState query={query}
      onClear={() => window.location.assign('/search')} />

  return (
    <>
      <p className="search-page-count">
        Page {page} of {pages} · results {(page - 1) * 3 + 1}–
        {Math.min(page * 3, matches.length)}
      </p>

      <div className="people-results">
        {items.map((person) =>
          <PersonResultCard key={person.id} person={person}
            badge={person.skills[0]} />)}
      </div>

      <div className="search-pagination">
        <button disabled={page === 1}
          onClick={() => setPage(page - 1)}>Previous</button>
        {Array.from({ length: pages }, (_, index) => (
          <button key={index + 1}
            className={page === index + 1 ? 'active' : ''}
            onClick={() => setPage(index + 1)}>
            {index + 1}
          </button>
        ))}
        <button disabled={page === pages}
          onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </>
  )
}

export default PeopleResults
