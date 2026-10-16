import { useEffect, useState } from 'react'
import { getCommunityInvitations, revokeInvitation, type Invitation } from '../api/invitationsApi'
import '../../friends/components/Friends.css'

type Props = {
  communityId: string
  /** Change this to reload, e.g. after sending an invitation. */
  refreshKey: number
}

// Invitations waiting for an answer, with Revoke (managers only).
function PendingInvitesList({ communityId, refreshKey }: Props) {
  const [items, setItems] = useState<Invitation[]>([])
  const [error, setError] = useState('')
  const [revoked, setRevoked] = useState(0)

  useEffect(() => {
    let active = true

    getCommunityInvitations(communityId)
      .then((data) => {
        if (active) setItems(data)
      })
      .catch(() => {
        if (active) setError('Could not load pending invitations.')
      })
    return () => {
      active = false
    }
  }, [communityId, refreshKey, revoked])

  async function revoke(id: string) {
    try {
      await revokeInvitation(communityId, id)
      setRevoked((value) => value + 1)
    } catch {
      setError('Could not revoke the invitation.')
    }
  }

  if (!items.length && !error)
    return null
  return (
    <div className="pending-invites">
      <h3 className="people-section-title">Pending invitations</h3>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="people-list">
        {items.map((item) => (
          <article key={item.id} className="person-row">
            <div className="person-row__avatar">{item.invitee.username.slice(0, 2).toUpperCase()}</div>
            <div>
              <p className="person-row__name">@{item.invitee.username}</p>
              <p className="person-row__meta">Invited as {item.role.toLowerCase()} by @{item.inviter.username}</p>
            </div>
            <div className="person-row__actions">
              <button type="button" className="people-button" onClick={() => revoke(item.id)}>Revoke</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PendingInvitesList
