import { Link } from 'react-router-dom'
import AuthorAvatar from '../../feed/components/AuthorAvatar'
import type { SearchUser } from '../api/searchApi'

type Props = {
  person: SearchUser
  /** Skill to highlight, e.g. the one that matched a skills search. */
  highlight?: string
}

function PersonResultCard({ person, highlight }: Props) {
  const skills = person.skills ?? []
  const tag = skills.find((skill) => highlight && skill.toLowerCase().includes(highlight.toLowerCase()))
    ?? skills[0]

  return (
    <article className="person-result">
      <AuthorAvatar author={person} className="person-result__avatar" />
      <h3>{person.displayName || person.username}</h3>
      <p>@{person.username}</p>
      <span className="person-result__skill">{tag ?? '42 COMMUNITY'}</span>
      <Link to={`/profile/${person.username}`}>View profile</Link>
    </article>
  )
}

export default PersonResultCard
