import { Link } from 'react-router-dom'
import type { SearchPerson } from '../types/SearchPerson'

type Props = {
  person: SearchPerson
  badge: string
}

function PersonResultCard({ person, badge }: Props) {
  const username = person.name.toLowerCase()

  return (
    <article className="person-result">
      <span className="person-result__avatar">{person.initials}</span>
      <h3>{person.name}</h3>
      <p>{person.campus} · Open to collaboration</p>
      <span className="person-result__skill">{badge}</span>
      <Link to={`/profile/${username}`}>View profile</Link>
    </article>
  )
}

export default PersonResultCard
