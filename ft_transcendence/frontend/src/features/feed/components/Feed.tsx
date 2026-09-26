import { mockPosts } from '../data/mockPosts'
import PostCard from './PostCard'
import './Feed.css'

function Feed() {
  return (
    <section className="feed">
      {mockPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  )
}

export default Feed