import { Link } from 'react-router-dom'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import type { SearchPost } from '../api/searchApi'
import { usePagedSearch } from '../hooks/usePagedSearch'
import SearchEmptyState from './SearchEmptyState'
import SearchPager from './SearchPager'

type Props = { query: string; topic: SearchTopic; sort: SearchSort }

function SearchPostCard({ post }: { post: SearchPost }) {
  return <article className="search-post-card">
    <div><strong>{post.author.username}</strong><span>{post.community?.name ?? 'Global feed'}</span></div>
    <p>{post.content}</p>
    <Link to={`/posts/${post.id}`}>Open post</Link>
  </article>
}

function PostResults({ query, sort }: Props) {
  const state = usePagedSearch(
    query,
    'posts',
    (data) => data.results.posts,
    sort === 'az' ? (a, b) => a.content.localeCompare(b.content) : undefined,
  )

  if (state.error) return <p>{state.error}</p>
  if (state.loading) return <p>Searching...</p>
  if (!state.total) return <SearchEmptyState query={query} onClear={() => window.location.assign('/search')} />
  return <>
    <p className="search-page-count">Page {state.page} of {state.pages}</p>
    <div className="post-search-results">{state.items.map((post) => <SearchPostCard key={post.id} post={post} />)}</div>
    <SearchPager page={state.page} pages={state.pages} onChange={state.setPage} />
  </>
}

export default PostResults
