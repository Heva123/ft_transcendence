import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import CommunityResults from '../features/search/components/CommunityResults'
import PeopleResults from '../features/search/components/PeopleResults'
import PostResults from '../features/search/components/PostResults'
import SkillResults from '../features/search/components/SkillResults'
import './SearchPage.css'

export type SearchTab = 'people' | 'communities' | 'posts' | 'skills'
export type SearchTopic = 'all' | 'programming'
export type SearchSort = 'relevant' | 'az'

function getSearchHeading(tab: SearchTab) {
  if (tab === 'communities')
    return 'Find a place to belong.'
  if (tab === 'posts')
    return 'Ideas worth finding.'
  if (tab === 'skills')
    return 'Find the skills you need.'
  return 'Find your next collaborator.'
}

function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [input, setInput] = useState(query)
  const [tab, setTab] = useState<SearchTab>('people')
  const [topic, setTopic] = useState<SearchTopic>('programming')
  const [sort, setSort] = useState<SearchSort>('relevant')

  function submit(event: FormEvent<HTMLFormElement>) {
    let value: string

    event.preventDefault()
    value = input.trim()
    if (value)
      setParams({ q: value })
  }

  function clear() {
    setInput('')
    setParams({})
  }

  return (
    <main className="search-page">
      <header className="search-page__header">
        <div>
          <h1>{getSearchHeading(tab)}</h1>
          <p>Search across your campus community.</p>
        </div>
        <span className="community-badge">42 COMMUNITY</span>
      </header>

      <form className="search-controls" onSubmit={submit}>
        <input value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Search people, communities, posts..." />
        <button type="submit">Search</button>
        <button type="button" onClick={clear}>Clear</button>
      </form>

      <nav className="search-tabs">
        {(['people', 'communities', 'posts', 'skills'] as SearchTab[])
          .map((item) => (
            <button key={item}
              className={tab === item ? 'active' : ''}
              onClick={() => setTab(item)}>
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
      </nav>

      {query && (
        <div className="search-filters">
          <label>
            Topic:
            <select value={topic}
              onChange={(event) =>
                setTopic(event.target.value as SearchTopic)}>
              <option value="programming">Programming</option>
              <option value="all">All topics</option>
            </select>
          </label>

          <label>
            Sort:
            <select value={sort}
              onChange={(event) =>
                setSort(event.target.value as SearchSort)}>
              <option value="relevant">Relevant</option>
              <option value="az">A–Z</option>
            </select>
          </label>
        </div>
      )}

      <section className="search-results">
        {query && tab === 'people' &&
          <PeopleResults query={query} topic={topic} sort={sort} />}
        {query && tab === 'communities' &&
          <CommunityResults query={query} topic={topic} sort={sort} />}
        {query && tab === 'posts' &&
          <PostResults query={query} topic={topic} sort={sort} />}
        {query && tab === 'skills' &&
          <SkillResults query={query} />}
        {!query && <p>Enter something to search.</p>}
      </section>
    </main>
  )
}

export default SearchPage
