import { useParams } from 'react-router-dom'
import { mockPeople } from '../features/search/data/mockPeople'

function ProfilePage() {
  const { username } = useParams()
  const target = username ?? 'afnan'
  const person = mockPeople.find((item) =>
    item.name.toLowerCase() === target.toLowerCase())

  if (!person)
    return <h1>Profile not found.</h1>

  return (
    <section>
      <p>{person.campus.toUpperCase()}</p>
      <h1>{person.name}</h1>
      <p>@{person.name.toLowerCase()}</p>
      <p>Open to collaboration.</p>

      <h2>Things I work with</h2>
      <p>{person.skills.join(' · ')}</p>

      <button type="button">Add friend</button>
    </section>
  )
}

export default ProfilePage
