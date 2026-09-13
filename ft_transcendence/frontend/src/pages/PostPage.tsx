import {
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../features/feed/components/PostCard'
import ReplyItem from '../features/feed/components/ReplyItem'
import { mockPosts } from '../features/feed/data/mockPosts'
import { mockReplies } from '../features/feed/data/mockReplies'
import type { Post } from '../features/feed/types/Post'
import type { Reply } from '../features/feed/types/Reply'
import './PostPage.css'

type ReplyState = [
  Reply[],
  Dispatch<SetStateAction<Reply[]>>
]

type ReplyFormProps = {
  postId: number
  replyState: ReplyState
}

function buildReply(postId: number, text: string) {
  let reply: Reply

  reply = {
    id: Date.now(),
    postId: postId,
    author: 'Afnan',
    text: text,
    createdAt: 'now',
  }
  return reply
}

function ReplyForm({ postId, replyState }: ReplyFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let form: FormData
    let text: string

    event.preventDefault()
    form = new FormData(event.currentTarget)
    text = String(form.get('reply')).trim()

    if (!text)
      return

    replyState[1]([...replyState[0], buildReply(postId, text)])
    event.currentTarget.reset()
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
  let postId: number
  let post: Post | undefined
  let replyState: ReplyState
  let replyCount: number

  postId = Number(useParams().postId)
  post = mockPosts.find((item) => item.id === postId)
  replyState = useState<Reply[]>(
    mockReplies.filter((item) => item.postId === postId),
  )
  replyCount = replyState[0].length

  if (!post)
    return <h1>Post not found.</h1>

  return (
    <section className="post-page">
      <header>
        <p>42 COMMUNITY</p>
        <h1>A small idea. A big conversation.</h1>
      </header>

      <PostCard post={post} commentsCount={replyCount} />

      <h2>
        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
      </h2>

      {replyState[0].map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}

      <ReplyForm postId={postId} replyState={replyState} />
    </section>
  )
}

export default PostPage