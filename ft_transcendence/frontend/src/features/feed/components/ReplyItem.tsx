import { useState, type FormEvent } from 'react'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { createReply, deleteReply, updateReply } from '../api/feedApi'
import { formatTimestamp } from '../../../utils/formatTimestamp'
import type { Reply } from '../types/Reply'
import AuthorAvatar from './AuthorAvatar'
import ReportDialog from './ReportDialog'

type Props = {
  reply: Reply
  childrenOf: Map<string, Reply[]>
  currentUserId?: string
  communityId: string | null
  // False for guests: no reply button.
  canWrite?: boolean
  depth?: number
  onCreated: (reply: Reply) => void
  onDeleted: (reply: Reply) => void
}

type State = {
  saved: string
  draft: string
  editing: boolean
  error: string
}

type Dialog = 'none' | 'delete' | 'report' | 'reply'

// Nested replies are indented up to this depth, then shown flat.
const MAX_INDENT = 3

export function ReplyForm({ postId, parentId, onCreated, onCancel, label = 'Your reply' }: {
  postId: string
  parentId: string | null
  onCreated: (reply: Reply) => void
  onCancel?: () => void
  label?: string
}) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState({ sending: false, error: '' })
  const id = parentId ? `reply-to-${parentId}` : 'reply'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = content.trim()

    if (!text) return
    setStatus({ sending: true, error: '' })
    try {
      const reply = await createReply(postId, text, parentId)
      onCreated(reply)
      setContent('')
      setStatus({ sending: false, error: '' })
      onCancel?.()
    } catch {
      setStatus({ sending: false, error: 'Unable to post your reply. Try again.' })
    }
  }

  return <form className={parentId ? 'reply-form nested' : 'reply-form'} onSubmit={handleSubmit}>
    <label htmlFor={id}>{label}</label>
    <textarea id={id} name="reply" rows={parentId ? 2 : 4} maxLength={1000}
      value={content} onChange={(event) => setContent(event.target.value)} />
    {status.error && <p className="reply-error" role="alert">{status.error}</p>}
    <div className="reply-form__actions">
      <button type="submit" disabled={status.sending}>{status.sending ? 'Posting…' : 'Post reply'}</button>
      {onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
    </div>
  </form>
}

function ReplyItem(props: Props) {
  const { reply, currentUserId, communityId } = props
  const depth = props.depth ?? 0
  const [state, setState] = useState<State>({ saved: reply.content, draft: reply.content, editing: false, error: '' })
  const [dialog, setDialog] = useState<Dialog>('none')
  const [deleting, setDeleting] = useState(false)
  const owner = currentUserId === reply.author.id
  const children = props.childrenOf.get(reply.id) ?? []

  async function saveEdit() {
    const text = state.draft.trim()
    if (!text) return
    try {
      const updated = await updateReply(reply.postId, reply.id, text)
      setState({ saved: updated.content, draft: updated.content, editing: false, error: '' })
    } catch { setState((current) => ({ ...current, error: 'Unable to edit reply.' })) }
  }

  async function removeReply() {
    setDeleting(true)
    try {
      await deleteReply(reply.postId, reply.id)
      setDialog('none')
      props.onDeleted(reply)
    } catch {
      setDialog('none')
      setState((current) => ({ ...current, error: 'Unable to delete reply.' }))
    } finally { setDeleting(false) }
  }

  return <div className={depth > 0 && depth <= MAX_INDENT ? 'reply-thread nested' : 'reply-thread'}>
    <article className="reply-item">
      <AuthorAvatar author={reply.author} className="reply-avatar" />
      <div className="reply-body">
        <p className="reply-meta"><strong>{reply.author.username}</strong> · {formatTimestamp(reply.createdAt)}</p>
        {state.editing
          ? <textarea value={state.draft} maxLength={1000} onChange={(event) => setState({ ...state, draft: event.target.value })} rows={3} />
          : <p>{state.saved}</p>}
        <div className="reply-actions">
          {state.editing
            ? <><button type="button" onClick={saveEdit}>Save</button><button type="button" onClick={() => setState({ ...state, editing: false, draft: state.saved })}>Cancel</button></>
            : <>
              {props.canWrite !== false && <button type="button" className="link" onClick={() => setDialog(dialog === 'reply' ? 'none' : 'reply')}>Reply</button>}
              {owner && <button type="button" onClick={() => setState({ ...state, editing: true, draft: state.saved })}>Edit</button>}
              {owner && <button type="button" className="danger" onClick={() => setDialog('delete')}>Delete</button>}
              {!owner && communityId && <button type="button" className="link" onClick={() => setDialog('report')}>Report</button>}
            </>}
        </div>
        {state.error && <p className="reply-error" role="alert">{state.error}</p>}
        {dialog === 'reply' && <ReplyForm postId={reply.postId} parentId={reply.id}
          label={`Reply to ${reply.author.username}`}
          onCreated={props.onCreated} onCancel={() => setDialog('none')} />}
      </div>
    </article>
    {children.map((child) => <ReplyItem key={child.id} {...props} reply={child} depth={depth + 1} />)}
    {dialog === 'delete' && <ConfirmDialog title="Delete this reply?"
      message={children.length ? 'This reply and the replies under it will be removed.' : 'This reply will be removed.'}
      confirmLabel="Delete reply" busy={deleting}
      onCancel={() => setDialog('none')} onConfirm={removeReply} />}
    {dialog === 'report' && communityId && <ReportDialog communityId={communityId}
      targetType="COMMENT" targetId={reply.id} onClose={() => setDialog('none')} />}
  </div>
}

export default ReplyItem
