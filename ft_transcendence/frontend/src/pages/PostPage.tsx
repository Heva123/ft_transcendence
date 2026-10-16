import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { getPostDetails } from '../features/feed/api/feedApi'
import PostCard from '../features/feed/components/PostCard'
import ReplyItem, { ReplyForm } from '../features/feed/components/ReplyItem'
import type { Post } from '../features/feed/types/Post'
import type { Reply } from '../features/feed/types/Reply'
import './PostPage.css'

type PageState = {
  postId: string
  post: Post | null
  replies: Reply[]
  error: string
}

function groupReplies(replies: Reply[]) {
  const ids = new Set(replies.map((reply) => reply.id))
  const roots: Reply[] = []
  const childrenOf = new Map<string, Reply[]>()

  replies.forEach((reply) => {
    if (!reply.parentId || !ids.has(reply.parentId)) {
      roots.push(reply)
      return
    }
    childrenOf.set(reply.parentId, [...(childrenOf.get(reply.parentId) ?? []), reply])
  })
  return { roots, childrenOf }
}

// A reply and everything under it, for removing a deleted thread.
function withDescendants(replies: Reply[], id: string) {
  const removed = new Set([id])
  let grew = true

  while (grew) {
    grew = false
    replies.forEach((reply) => {
      if (reply.parentId && removed.has(reply.parentId) && !removed.has(reply.id)) {
        removed.add(reply.id)
        grew = true
      }
    })
  }
  return removed
}

function PostPage() {
  const postId = useParams().postId ?? ''
  const [state, setState] = useState<PageState>({ postId: '', post: null, replies: [], error: '' })
  const user = useCurrentUser()

  useEffect(() => {
    let active = true

    getPostDetails(postId).then((data) => {
      if (active)
        setState({ postId, post: data.post, replies: data.comments, error: '' })
    }).catch(() => {
      if (active)
        setState({ postId, post: null, replies: [], error: 'Post not found.' })
    })
    return () => {
      active = false
    }
  }, [postId])

  function addReply(reply: Reply) {
    setState((current) => ({ ...current, replies: [...current.replies, reply] }))
  }

  function removeReply(reply: Reply) {
    setState((current) => {
      const removed = withDescendants(current.replies, reply.id)
      return { ...current, replies: current.replies.filter((item) => !removed.has(item.id)) }
    })
  }

  if (state.postId !== postId) return <p>Loading post...</p>
  if (state.error || !state.post) return <h1>{state.error || 'Post not found.'}</h1>
  const { roots, childrenOf } = groupReplies(state.replies)
  const count = state.replies.length

  return <section className="post-page">
    <header><p>42 COMMUNITY</p><h1>A small idea. A big conversation.</h1>
      <p className="post-page__crumb">{state.post.community?.name ?? 'Global feed'} / Post</p></header>
    <PostCard post={state.post} commentsCount={count} currentUserId={user?.id} />
    <h2>{count} {count === 1 ? 'reply' : 'replies'}</h2>
    {roots.map((reply) => <ReplyItem key={reply.id} reply={reply} childrenOf={childrenOf}
      currentUserId={user?.id} communityId={state.post?.community?.id ?? null}
      onCreated={addReply} onDeleted={removeReply} />)}
    <ReplyForm postId={postId} parentId={null} onCreated={addReply} />
  </section>
}

export default PostPage
