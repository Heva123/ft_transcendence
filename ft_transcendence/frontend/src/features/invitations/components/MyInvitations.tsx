import { useEffect, useState } from 'react'
import { onNewNotification } from '../../notifications/api/notificationSocket'
import {
  acceptInvitation,
  declineInvitation,
  getMyInvitations,
  type Invitation,
} from '../api/invitationsApi'
import '../../friends/components/Friends.css'

// "You're invited to …" cards with Accept and Decline.
function MyInvitations() {
  const [items, setItems] = useState<Invitation[]>([])
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true

    getMyInvitations()
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => undefined)
    const stop = onNewNotification((item) => {
      if (item.type === 'COMMUNITY_INVITE')
        setVersion((value) => value + 1)
    })
    return () => {
      active = false
      stop()
    }
  }, [version])

  async function accept(item: Invitation) {
    setBusyId(item.id)
    try {
      await acceptInvitation(item.id)
      // Full reload so the sidebar lists the new community too.
      window.location.assign(`/communities/${item.community.id}`)
    } catch {
      setError(`Could not join ${item.community.name}.`)
      setBusyId('')
    }
  }

  async function decline(item: Invitation) {
    setBusyId(item.id)
    try {
      await declineInvitation(item.id)
      setItems((current) => current.filter((invite) => invite.id !== item.id))
    } catch {
      setError('Could not decline the invitation.')
    } finally {
      setBusyId('')
    }
  }

  if (!items.length)
    return null
  return (
    <section className="my-invitations" aria-label="Invitations">
      <h3 className="people-section-title">Invitations for you</h3>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="people-list">
        {items.map((item) => (
          <article key={item.id} className="person-row">
            <div className="person-row__avatar">{item.community.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="person-row__name">You’re invited to {item.community.name}</p>
              <p className="person-row__meta">
                From @{item.inviter.username} · join as {item.role.toLowerCase()}
              </p>
            </div>
            <div className="person-row__actions">
              <button type="button" className="people-button primary" disabled={busyId === item.id}
                onClick={() => accept(item)}>Accept</button>
              <button type="button" className="people-button" disabled={busyId === item.id}
                onClick={() => decline(item)}>Decline</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MyInvitations
