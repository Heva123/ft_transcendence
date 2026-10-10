import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function SearchBox() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    let value: string

    if (event.key !== 'Enter')
      return
    value = query.trim()
    if (!value)
      return
    navigate(`/search?q=${encodeURIComponent(value)}`)
  }

  return (
    <input
      className="topbar__search"
      type="search"
      placeholder="Search people, communities, posts..."
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={handleKeyDown}
    />
  )
}

export default SearchBox
