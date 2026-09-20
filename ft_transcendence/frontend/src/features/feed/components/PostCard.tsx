import {
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { Link } from 'react-router-dom'
import type { Post } from '../types/Post'

type PostCardProps = {
  post: Post
  commentsCount?: number
}

type NumberState = [number, Dispatch<SetStateAction<number>>]
type BoolState = [boolean, Dispatch<SetStateAction<boolean>>]

type PostActionsProps = {
  postId: string
  comments: number
  likes: number
  liked: boolean
  onLike: () => void
}

function PostHeader({ post }: { post: Post }) {
  return (
    <header className="post-card__header">
      <div className="post-card__identity">
        <div className="post-card__avatar">
          {post.author.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong>{post.author.username}</strong>
          <p>
            {post.community ? post.community.name : 'Global feed'} · {post.createdAt}
          </p>
        </div>
      </div>
      <button className="post-card__menu" type="button">•••</button>
    </header>
  )
}

function PostActions(props: PostActionsProps) {
  return (
    <footer className="post-card__actions">
      <button className="post-card__like" type="button" onClick={props.onLike}>
        {props.liked ? '♥' : '♡'} {props.likes}
      </button>
      <Link className="post-card__replies" to={`/posts/${props.postId}`}>
        ▢ {props.comments}{' '}
        {props.comments === 1 ? 'reply' : 'replies'}
      </Link>
    </footer>
  )
}

function PostCard({ post, commentsCount }: PostCardProps) {
  let likesState: NumberState
  let likedState: BoolState
  let displayedComments: number

  likesState = useState(post.likesCount)
  likedState = useState(post.likedByMe)
  displayedComments = commentsCount ?? post.commentsCount

  function handleLike() {
    likesState[1](likedState[0] ? likesState[0] - 1 : likesState[0] + 1)
    likedState[1](!likedState[0])
  }

  return (
    <article className="post-card">
      <PostHeader post={post} />
      <p className="post-card__content">{post.content}</p>
      <PostActions
        postId={post.id}
        comments={displayedComments}
        likes={likesState[0]}
        liked={likedState[0]}
        onLike={handleLike}
      />
    </article>
  )
}

export default PostCard