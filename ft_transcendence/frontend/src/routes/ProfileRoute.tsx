import { useState } from 'react'
import {
  type CurrentUser,
} from '../features/auth/api/userApi'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import ProfilePage from '../features/profile/pages/ProfilePage'

function ProfileRoute() {
  const currentUser = useCurrentUser()
  // After an edit, the saved user wins over the one loaded at start.
  const [edited, setEdited] = useState<CurrentUser | null>(null)
  const user = edited ?? currentUser
  const token = localStorage.getItem('accessToken')

  if (!user || !token)
    return <p>Loading profile...</p>

  return (
    <ProfilePage
      user={user}
      token={token}
      onUserUpdated={setEdited}
    />
  )
}

export default ProfileRoute
