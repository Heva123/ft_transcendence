import { useEffect, useState } from 'react'
import { getMyCommunities } from '../../chat/api/chatApi'
import {
  getCommunityFeed,
  getFeed,
} from '../api/feedApi'
import type { Post } from '../types/Post'
import PostCard from './PostCard'
import './Feed.css'

export type FeedMode = 'global' | 'communities'

async function loadPosts(mode: FeedMode) {
  let communities
  let feeds
  let posts: Post[]

  if (mode === 'global')
    return (await getFeed()).posts
  communities = await getMyCommunities()
  feeds = await Promise.all(
    communities.map((item) => getCommunityFeed(item.id)),
  )
  posts = feeds.flatMap((item) => item.posts)
  return posts.sort((a, b) =>
    Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

function Feed({ mode }: { mode: FeedMode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    loadPosts(mode)
      .then(setPosts)
      .catch(() => setError('Unable to load posts.'))
  }, [mode])

  if (error)
    return <p>{error}</p>
  if (!posts.length)
    return <p>No posts yet. Share the first idea.</p>

  return (
    <section className="feed">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  )
}

export default Feed
