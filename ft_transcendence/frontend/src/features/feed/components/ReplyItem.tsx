import { useState } from 'react'
import { deleteReply, updateReply } from '../api/feedApi'
import { formatTimestamp } from '../../../utils/formatTimestamp'
import type { Reply } from '../types/Reply'

type Props = { reply: Reply; currentUserId?: string }
type State = { content: string; editing: boolean; deleted: boolean; error: string }

function ReplyItem({ reply, currentUserId }: Props) {
  const [state, setState] = useState<State>({ content: reply.content, editing: false, deleted: false, error: '' })

  async function saveEdit() {
    if (!state.content.trim()) return
    try {
      const updated = await updateReply(reply.postId, reply.id, state.content.trim())
      setState({ content: updated.content, editing: false, deleted: false, error: '' })
    } catch { setState({ ...state, error: 'Unable to edit reply.' }) }
  }

  async function removeReply() {
    if (!window.confirm('Delete this reply?')) return
    try {
      await deleteReply(reply.postId, reply.id)
      setState({ ...state, deleted: true })
    } catch { setState({ ...state, error: 'Unable to delete reply.' }) }
  }

  if (state.deleted) return null
  return <article className="reply-item">
    <div className="reply-avatar">{reply.author.username.slice(0, 2).toUpperCase()}</div>
    <div className="reply-body">
      <p className="reply-meta"><strong>{reply.author.username}</strong> · {formatTimestamp(reply.createdAt)}</p>
      {state.editing ? <textarea value={state.content} onChange={(event) => setState({ ...state, content: event.target.value })} rows={3} /> : <p>{state.content}</p>}
      {currentUserId === reply.author.id && <div className="reply-actions">
        {state.editing ? <><button type="button" onClick={saveEdit}>Save</button><button type="button" onClick={() => setState({ ...state, editing: false, content: reply.content })}>Cancel</button></> : <><button type="button" onClick={() => setState({ ...state, editing: true })}>Edit</button><button type="button" className="danger" onClick={removeReply}>Delete</button></>}
      </div>}
      {state.error && <p className="reply-error">{state.error}</p>}
    </div>
  </article>
}

export default ReplyItem
