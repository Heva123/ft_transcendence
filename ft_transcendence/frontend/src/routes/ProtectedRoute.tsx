import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../features/auth/api/userApi'

type ProtectedRouteProps = {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setStatus('invalid')
      return
    }

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
