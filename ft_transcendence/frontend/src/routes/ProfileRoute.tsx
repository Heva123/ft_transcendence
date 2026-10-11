import { useEffect, useState } from 'react'
import {
  type CurrentUser,
} from '../features/auth/api/userApi'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import ProfilePage from '../pages/ProfilePage'

function ProfileRoute() {
  const currentUser = useCurrentUser()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const token = localStorage.getItem('accessToken')

  useEffect(() => {
    if (currentUser)
      setUser(currentUser)
  }, [currentUser])

  if (!user || !token)
    return <p>Loading profile...</p>

  return (
    <ProfilePage
      user={user}
      token={token}
      onUserUpdated={setUser}
    />
  )
}

export default ProfileRoute
