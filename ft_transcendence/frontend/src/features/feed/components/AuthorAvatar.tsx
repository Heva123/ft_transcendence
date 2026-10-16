import ProtectedImage from '../../../components/ProtectedImage'
import type { Author } from '../types/Post'

// Uploaded avatar when there is one, otherwise the initials.
function AuthorAvatar({ author, className }: { author: Author; className: string }) {
  const initials = author.username.slice(0, 2).toUpperCase()

  return (
    <div className={className}>
      {author.avatarUrl
        ? <ProtectedImage src={author.avatarUrl} alt="" className="author-avatar__img"
          fallback={initials} />
        : initials}
    </div>
  )
}

export default AuthorAvatar
