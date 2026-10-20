import { useEffect, useState } from 'react'
import { useCurrentUser } from '../../auth/hooks/useCurrentUser'
import { canWriteSite } from '../../auth/utils/sitePermissions'
import { getMyCommunities } from '../../chat/api/chatApi'
import { FEED_PAGE_SIZE, getCommunityFeed, getFeed } from '../api/feedApi'
import type { Post } from '../types/Post'
import PostCard from './PostCard'
import './Feed.css'

export type FeedMode = 'global' | 'communities' | `community:${string}`

type Page = { posts: Post[]; hasMore: boolean }

async function loadPage(mode: FeedMode, page: number): Promise<Page> {
  if (mode === 'global' || mode.startsWith('community:')) {
    const { posts } = mode === 'global'
      ? await getFeed(page)
      : await getCommunityFeed(mode.slice('community:'.length), page)
    return { posts, hasMore: posts.length === FEED_PAGE_SIZE }
  }
  const communities = await getMyCommunities()
  const feeds = await Promise.all(communities.map((item) => getCommunityFeed(item.id, page)))
  const posts = feeds.flatMap((item) => item.posts)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  return { posts, hasMore: feeds.some((item) => item.posts.length === FEED_PAGE_SIZE) }
}

type FeedState = {
  mode: FeedMode | null
  posts: Post[]
  page: number
  hasMore: boolean
  loadingMore: boolean
  error: string
}

function Feed({ mode, emptyText }: { mode: FeedMode; emptyText?: string }) {
  const [state, setState] = useState<FeedState>({
    mode: null, posts: [], page: 1, hasMore: false, loadingMore: false, error: '',
  })
  const user = useCurrentUser()

  useEffect(() => {
    let active = true

    loadPage(mode, 1).then((result) => {
      if (active)
        setState({ mode, posts: result.posts, page: 1, hasMore: result.hasMore, loadingMore: false, error: '' })
    }).catch(() => {
      if (active)
        setState({ mode, posts: [], page: 1, hasMore: false, loadingMore: false, error: 'Unable to load posts.' })
    })
    return () => {
      active = false
    }
  }, [mode])

  async function loadMore() {
    const next = state.page + 1

    setState((current) => ({ ...current, loadingMore: true }))
    try {
      const result = await loadPage(mode, next)
      setState((current) => {
        const known = new Set(current.posts.map((post) => post.id))
        return {
          ...current,
          posts: [...current.posts, ...result.posts.filter((post) => !known.has(post.id))],
          page: next,
          hasMore: result.hasMore,
          loadingMore: false,
        }
      })
    } catch {
      setState((current) => ({ ...current, loadingMore: false, error: 'Unable to load more posts.' }))
    }
  }

  if (state.mode !== mode) return <p className="feed-status" role="status">Gathering your community…</p>
  if (state.error && !state.posts.length) return <p className="feed-status" role="alert">{state.error}</p>
  if (!state.posts.length) return <p className="feed-status">{emptyText ?? 'Your feed is waiting for a first idea. Share one.'}</p>
  return <section className="feed">
    {state.posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user?.id} canWrite={canWriteSite(user)} />)}
    {state.error && <p className="feed-status" role="alert">{state.error}</p>}
    {state.hasMore && <button type="button" className="feed-more" onClick={loadMore} disabled={state.loadingMore}>
      {state.loadingMore ? 'Loading…' : 'Load more posts'}
    </button>}
  </section>
}

export default Feed
