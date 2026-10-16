import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../features/auth/api/userApi'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  // No token means we already know the answer, so start as invalid.
  const [status, setStatus] = useState(() =>
    localStorage.getItem('accessToken') ? 'checking' : 'invalid')

  useEffect(() => {
    if (!localStorage.getItem('accessToken'))
      return

    getCurrentUser()
      .then(() => setStatus('valid'))
      .catch(() => {
        localStorage.removeItem('accessToken')
        setStatus('invalid')
      })
  }, [])

  if (status === 'checking')
    return <p>Loading...</p>

  if (status === 'invalid')
    return <Navigate to="/login" replace />

  return <>{children}</>
}

export default ProtectedRoute
