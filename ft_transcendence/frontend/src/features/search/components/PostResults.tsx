import { Link } from 'react-router-dom'
import type { SearchPost, SearchRequest } from '../api/searchApi'
import { usePagedSearch } from '../hooks/usePagedSearch'
import SearchEmptyState from './SearchEmptyState'
import SearchPager, { PageSummary } from './SearchPager'

type Props = {
  request: SearchRequest
  onPage: (page: number) => void
  onClear: () => void
}

function SearchPostCard({ post }: { post: SearchPost }) {
  return <article className="search-post-card">
    <div><strong>{post.author.username}</strong><span>{post.community?.name ?? 'Global feed'} · {new Date(post.createdAt).toLocaleDateString()}</span></div>
    <p>{post.content}</p>
    <Link to={`/posts/${post.id}`}>Open post</Link>
  </article>
}

function PostResults({ request, onPage, onClear }: Props) {
  const state = usePagedSearch(request, (data) => data.results.posts)

  if (state.error) return <p role="alert">{state.error}</p>
  if (state.loading) return <p role="status">Searching...</p>
  if (!state.total) return <SearchEmptyState query={request.query} onClear={onClear} />
  return <>
    <PageSummary {...state} />
    <div className="post-search-results">{state.items.map((post) => <SearchPostCard key={post.id} post={post} />)}</div>
    <SearchPager {...state} onChange={onPage} />
  </>
}

export default PostResults
