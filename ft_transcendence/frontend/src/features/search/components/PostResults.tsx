import type { Post } from '../../feed/types/Post'
import PostCard from '../../feed/components/PostCard'
import type { SearchSort, SearchTopic } from '../../../pages/SearchPage'
import { usePagedSearch } from '../hooks/usePagedSearch'
import SearchEmptyState from './SearchEmptyState'
import SearchPager from './SearchPager'

type Props = {
  query: string
  topic: SearchTopic
  sort: SearchSort
}

function toPost(item: {
  id: string
  content: string
  createdAt: string
  author: { id: string; username: string }
  community: { id: string; name: string } | null
}): Post {
  return {
    ...item,
    author: { ...item.author, avatarUrl: null },
    likesCount: 0,
    commentsCount: 0,
    likedByMe: false,
  }
}

function PostResults({ query, sort }: Props) {
  let state

  state = usePagedSearch(
    query,
    'posts',
    (data) => data.results.posts.map(toPost),
    sort === 'az'
      ? (a, b) => a.content.localeCompare(b.content)
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
      <div className="post-search-results">
        {state.items.map((post) =>
          <PostCard key={post.id} post={post} />)}
      </div>
      <SearchPager page={state.page} pages={state.pages}
        onChange={state.setPage} />
    </>
  )
}

export default PostResults
