import ProtectedImage from '../../../components/ProtectedImage'

type AvatarUser = { username: string; avatarUrl?: string | null }

// Uploaded avatar when there is one, otherwise the initials.
function AuthorAvatar({ author, className }: { author: AvatarUser; className: string }) {
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
