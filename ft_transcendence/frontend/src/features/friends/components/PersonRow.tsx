import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AuthorAvatar from '../../feed/components/AuthorAvatar'
import { displayNameOf, type PublicUser } from '../../profile/api/profileApi'
import './Friends.css'

type Props = {
  user: PublicUser
  online?: boolean
  note?: string
  children?: ReactNode
}

function lastSeen(user: PublicUser) {
  if (!user.lastSeenAt)
    return 'Offline'
  return `Last seen ${new Date(user.lastSeenAt).toLocaleDateString()}`
}

// One person: avatar, name, @username · status, first skill, actions.
function PersonRow({ user, online, note, children }: Props) {
  return (
    <article className="person-row">
      <AuthorAvatar author={user} className="person-row__avatar" />
      <div>
        <p className="person-row__name">{displayNameOf(user)}</p>
        <p className="person-row__meta">
          @{user.username} · {note ?? (online ? 'Online' : lastSeen(user))}
        </p>
      </div>
      <div className="person-row__actions">
        {user.skills[0] && <span className="skill-tag">{user.skills[0]}</span>}
        {children}
        <Link className="people-button" to={`/profile/${user.username}`}>View profile</Link>
      </div>
    </article>
  )
}

export default PersonRow
