import { useEffect, useState } from 'react'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import CommunityCard from '../../chat/components/CommunityCard'
import { mockCommunities } from '../../chat/data/mockCommunities'
import SearchEmptyState from './SearchEmptyState'

type Props = {
  query: string
  topic: SearchTopic
  sort: SearchSort
}

function CommunityResults({ query, topic, sort }: Props) {
  const [page, setPage] = useState(1)
  const value = query.trim().toLowerCase()
  let matches = mockCommunities.filter((item) =>
    `${item.name} ${item.description} ${item.topic}`
      .toLowerCase().includes(value))

  if (topic !== 'all')
    matches = matches.filter((item) =>
      item.topic.toLowerCase() === topic)
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
      <p className="search-page-count">Page {page} of {pages}</p>

      <div className="community-search-results">
        {items.map((item) =>
          <CommunityCard key={item.id} community={item} />)}
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

export default CommunityResults
