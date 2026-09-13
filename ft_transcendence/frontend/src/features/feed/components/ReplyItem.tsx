import type { Reply } from '../types/Reply'

type ReplyItemProps = {
  reply: Reply
}

function ReplyItem({ reply }: ReplyItemProps) {
  return (
    <article className="reply-item">
      <div className="reply-avatar">
        {reply.author.slice(0, 2).toUpperCase()}
      </div>

      <div>
        <p className="reply-meta">
          <strong>{reply.author}</strong> · {reply.createdAt}
        </p>
        <p>{reply.text}</p>
      </div>
    </article>
  )
}

export default ReplyItem