import { useEffect, useState } from 'react'
import {
  getCurrentUser,
  type CurrentUser,
} from '../api/userApi'

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  return user
}
