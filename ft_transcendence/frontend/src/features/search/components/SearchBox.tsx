import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function SearchBoxInput({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const navigate = useNavigate()

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter')
      return
    const value = query.trim()
    if (!value)
      return
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <input
      className="topbar__search"
      type="search"
      aria-label="Search"
      placeholder="Search people, communities, posts..."
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

function SearchBox() {
  const location = useLocation()
  const urlQuery = location.pathname === "/search" ? new URLSearchParams(location.search).get("q") ?? "" : ""
  return <SearchBoxInput key={urlQuery} initialQuery={urlQuery} />
}

export default SearchBox
