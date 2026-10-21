import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../../components/ConfirmDialog'
import ProtectedImage from '../../../components/ProtectedImage'
import { deletePost, deletePostImage, togglePostLike, updatePost, uploadPostImage } from '../api/feedApi'
import { formatTimestamp } from '../../../utils/formatTimestamp'
import type { Post } from '../types/Post'
import AuthorAvatar from './AuthorAvatar'
import ReportDialog from './ReportDialog'
import PostImageEditor from './PostImageEditor'
import './PostImage.css'

// canWrite is false for guests: the like button is disabled.
type Props = { post: Post; commentsCount?: number; currentUserId?: string; canWrite?: boolean }
type ViewState = { content: string; editing: boolean; deleted: boolean; error: string }
type Dialog = 'none' | 'delete' | 'report' | 'removeImage'
type HeaderProps = {
  post: Post
  owner: boolean
  canReport: boolean
  onEdit: () => void
  onDelete: () => void
  onReport: () => void
}

function PostHeader({ post, owner, canReport, onEdit, onDelete, onReport }: HeaderProps) {
  const [open, setOpen] = useState(false)

  return <header className="post-card__header">
    <div className="post-card__identity">
      <AuthorAvatar author={post.author} className="post-card__avatar" />
      <div><strong>{post.author.username}</strong><p>{post.community?.name ?? 'Global feed'} · {formatTimestamp(post.createdAt)}</p></div>
    </div>
    {(owner || canReport) && <div className="post-card__menu-wrap">
      <button className="post-card__menu" type="button" aria-label="Post actions"
        aria-expanded={open} onClick={() => setOpen(!open)}>•••</button>
      {open && <div className="post-card__menu-panel">
        {owner && <button type="button" onClick={() => { setOpen(false); onEdit() }}>Edit post</button>}
        {canReport && <button type="button" onClick={() => { setOpen(false); onReport() }}>Report post</button>}
        {owner && <button type="button" className="danger" onClick={() => { setOpen(false); onDelete() }}>Delete post</button>}
      </div>}
    </div>}
  </header>
}

function PostEditor({ content, onSave, onCancel }: { content: string; onSave: (value: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState(content)

  return <div className="post-card__editor">
    <textarea value={value} onChange={(event) => setValue(event.target.value)} rows={5} maxLength={2000} />
    <div><button type="button" onClick={() => onSave(value)}>Save</button><button type="button" onClick={onCancel}>Cancel</button></div>
  </div>
}

function PostCard({ post, commentsCount, currentUserId, canWrite = true }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState<ViewState>({ content: post.content, editing: false, deleted: false, error: '' })
  const [reaction, setReaction] = useState({ likes: post.likesCount, liked: post.likedByMe, busy: false })
  const [dialog, setDialog] = useState<Dialog>('none')
  const [deleting, setDeleting] = useState(false)
  // Changes when the image is added or removed while editing.
  const [imageUrl, setImageUrl] = useState(post.imageUrl ?? null)
  const owner = Boolean(currentUserId) && currentUserId === post.author.id
  // Reports are per community, so global posts cannot be reported.
  const canReport = !owner && Boolean(post.community)

  async function handleLike() {
    if (reaction.busy)
      return
    setReaction((current) => ({ ...current, busy: true }))
    try {
      const result = await togglePostLike(post.id)
      setReaction({ likes: result.likesCount, liked: result.liked, busy: false })
    } catch {
      setReaction((current) => ({ ...current, busy: false }))
      setView((current) => ({ ...current, error: 'Unable to update the like. Try again.' }))
    }
  }

  async function handleSave(content: string) {
    const trimmed = content.trim()
    if (!trimmed) return
    try {
      const updated = await updatePost(post.id, trimmed)
      setView({ content: updated.content, editing: false, deleted: false, error: '' })
    } catch { setView((current) => ({ ...current, error: 'Unable to edit post.' })) }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deletePost(post.id)
      setDialog('none')
      if (location.pathname === `/posts/${post.id}`) navigate('/')
      else setView((current) => ({ ...current, deleted: true }))
    } catch {
      setDialog('none')
      setView((current) => ({ ...current, error: 'Unable to delete post.' }))
    } finally { setDeleting(false) }
  }

  async function handleRemoveImage() {
    setDeleting(true)
    try {
      await deletePostImage(post.id)
      setImageUrl(null)
      setDialog('none')
    } catch {
      setDialog('none')
      setView((current) => ({ ...current, error: 'Unable to remove the attachment.' }))
    } finally { setDeleting(false) }
  }

  async function handleAddImage(file: File, onProgress: (value: number) => void) {
    await uploadPostImage(post.id, file, onProgress)
    // New query string so the image is fetched again.
    setImageUrl(`/api/uploads/post/${post.id}?v=${Date.now()}`)
  }

  if (view.deleted) return null
  const replies = commentsCount ?? post.commentsCount
  return <article className="post-card">
    <PostHeader post={post} owner={owner} canReport={canReport}
      onEdit={() => setView((current) => ({ ...current, editing: true, error: '' }))}
      onDelete={() => setDialog('delete')} onReport={() => setDialog('report')} />
    {view.editing ? <PostEditor content={view.content} onSave={handleSave} onCancel={() => setView((current) => ({ ...current, editing: false, error: '' }))} /> : <p className="post-card__content">{view.content}</p>}
    {imageUrl && <ProtectedImage src={imageUrl} alt="Post attachment" className="post-card__image" />}
    {view.editing && <PostImageEditor hasImage={Boolean(imageUrl)}
      onRemove={() => setDialog('removeImage')} onAdd={handleAddImage} />}
    {view.error && <p className="post-card__error" role="alert">{view.error}</p>}
    <footer className="post-card__actions">
      <button className="post-card__like" type="button" aria-pressed={reaction.liked} onClick={handleLike}
        disabled={!canWrite} title={canWrite ? undefined : 'Guest accounts cannot like posts'}>{reaction.liked ? '♥' : '♡'} {reaction.likes} {reaction.likes === 1 ? 'like' : 'likes'}</button>
      <Link className="post-card__replies" to={`/posts/${post.id}`}>▢ {replies} {replies === 1 ? 'reply' : 'replies'}</Link>
    </footer>
    {dialog === 'delete' && <ConfirmDialog title="Delete this post?"
      message="Your post and its comments will be removed. This action cannot be undone."
      confirmLabel="Delete post" busy={deleting}
      onCancel={() => setDialog('none')} onConfirm={handleDelete} />}
    {dialog === 'removeImage' && <ConfirmDialog title="Remove this attachment?"
      message="The attachment will be deleted from this post. Your text stays."
      confirmLabel="Remove attachment" busy={deleting}
      onCancel={() => setDialog('none')} onConfirm={handleRemoveImage} />}
    {dialog === 'report' && post.community && <ReportDialog communityId={post.community.id}
      targetType="POST" targetId={post.id} onClose={() => setDialog('none')} />}
  </article>
}

export default PostCard
