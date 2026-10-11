import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import { useParams } from 'react-router-dom'
import {
  createReply,
  getPostDetails,
} from '../features/feed/api/feedApi'
import PostCard from '../features/feed/components/PostCard'
import ReplyItem from '../features/feed/components/ReplyItem'
import type { Post } from '../features/feed/types/Post'
import type { Reply } from '../features/feed/types/Reply'
import './PostPage.css'

type ReplyFormProps = {
  postId: string
  onCreated: (reply: Reply) => void
}

function ReplyForm({ postId, onCreated }: ReplyFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    let formElement: HTMLFormElement
    let form: FormData
    let content: string
    let reply: Reply

    event.preventDefault()
    formElement = event.currentTarget
    form = new FormData(formElement)
    content = String(form.get('reply')).trim()
    if (!content)
      return
    reply = await createReply(postId, content)
    onCreated(reply)
    formElement.reset()
  }

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <label htmlFor="reply">Your reply</label>
      <textarea id="reply" name="reply" rows={4} />
      <button type="submit">Post reply</button>
    </form>
  )
}

function PostPage() {
  const postId = useParams().postId ?? ''
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getPostDetails(postId)
      .then((data) => {
        setPost(data.post)
        setReplies(data.comments)
      })
      .catch(() => setError('Post not found.'))
  }, [postId])

  if (error)
    return <h1>{error}</h1>
  if (!post)
    return <p>Loading post...</p>

  return (
    <section className="post-page">
      <header>
        <p>42 COMMUNITY</p>
        <h1>A small idea. A big conversation.</h1>
      </header>

      <PostCard post={post} commentsCount={replies.length} />

      <h2>
        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
      </h2>

      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}

      <ReplyForm
        postId={postId}
        onCreated={(reply) =>
          setReplies((current) => [...current, reply])}
      />
    </section>
  )
}

export default PostPage
