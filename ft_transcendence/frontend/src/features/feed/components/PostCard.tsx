import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ProtectedImage from '../../../components/ProtectedImage'
import { deletePost, togglePostLike, updatePost } from '../api/feedApi'
import { formatTimestamp } from '../../../utils/formatTimestamp'
import type { Post } from '../types/Post'
import './PostImage.css'

type Props = { post: Post; commentsCount?: number; currentUserId?: string }
type ViewState = { content: string; editing: boolean; deleted: boolean; error: string }
type HeaderProps = { post: Post; owner: boolean; onEdit: () => void; onDelete: () => void }

function PostHeader({ post, owner, onEdit, onDelete }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return <header className="post-card__header">
    <div className="post-card__identity">
      <div className="post-card__avatar">{post.author.username.slice(0, 2).toUpperCase()}</div>
      <div><strong>{post.author.username}</strong><p>{post.community?.name ?? 'Global feed'} · {formatTimestamp(post.createdAt)}</p></div>
    </div>
    {owner && <div className="post-card__menu-wrap">
      <button className="post-card__menu" type="button" onClick={() => setOpen(!open)}>•••</button>
      {open && <div className="post-card__menu-panel">
        <button type="button" onClick={() => { setOpen(false); onEdit() }}>Edit post</button>
        <button type="button" className="danger" onClick={() => { setOpen(false); onDelete() }}>Delete post</button>
      </div>}
    </div>}
  </header>
}

function PostEditor({ content, onSave, onCancel }: { content: string; onSave: (value: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(content)

  return <div className="post-card__editor">
    <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={5} />
    <div><button type="button" onClick={() => onSave(value)}>Save</button><button type="button" onClick={onCancel}>Cancel</button></div>
  </div>
}

function PostCard({ post, commentsCount, currentUserId }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState<ViewState>({ content: post.content, editing: false, deleted: false, error: '' })
  const [reaction, setReaction] = useState({ likes: post.likesCount, liked: post.likedByMe })

  async function handleLike() {
    const result = await togglePostLike(post.id)
    setReaction({ likes: result.likesCount, liked: result.liked })
  }

  async function handleSave(content: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    try {
      const updated = await updatePost(post.id, trimmed)
      setView({ content: updated.content, editing: false, deleted: false, error: '' })
    } catch { setView({ ...view, error: 'Unable to edit post.' }) }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await deletePost(post.id)
      if (location.pathname === `/posts/${post.id}`) navigate('/')
      else setView({ ...view, deleted: true })
    } catch { setView({ ...view, error: 'Unable to delete post.' }) }
  }

  if (view.deleted) return null
  return <article className="post-card">
    <PostHeader post={post} owner={currentUserId === post.author.id} onEdit={() => setView({ ...view, editing: true, error: '' })} onDelete={handleDelete} />
    {view.editing ? <PostEditor content={view.content} onSave={handleSave} onCancel={() => setView({ ...view, editing: false, error: '' })} /> : <p className="post-card__content">{view.content}</p>}
    {post.imageUrl && <ProtectedImage src={post.imageUrl} alt="Post attachment" className="post-card__image" />}
    {view.error && <p className="post-card__error">{view.error}</p>}
    <footer className="post-card__actions">
      <button className="post-card__like" type="button" onClick={handleLike}>{reaction.liked ? '♥' : '♡'} {reaction.likes}</button>
      <Link className="post-card__replies" to={`/posts/${post.id}`}>▢ {commentsCount ?? post.commentsCount} {(commentsCount ?? post.commentsCount) === 1 ? 'reply' : 'replies'}</Link>
    </footer>
  </article>
}

export default PostCard
