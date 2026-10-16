import { Link } from 'react-router-dom'
import type { SearchUser } from '../api/searchApi'

type Props = {
  person: SearchUser
}

function PersonResultCard({ person }: Props) {
  const initials = person.username.slice(0, 2).toUpperCase()
  return (
    <article className="person-result">
      <span className="person-result__avatar">{initials}</span>
      <h3>{person.username}</h3>
      <p>@{person.username}</p>
      <span className="person-result__skill">42 COMMUNITY</span>
      <Link to={`/profile/${person.username}`}>View profile</Link>
    </article>
  )
}

export default PersonResultCard
