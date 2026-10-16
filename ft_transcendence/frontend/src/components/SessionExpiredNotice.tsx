import { useSearchParams } from 'react-router-dom'
import './Feedback.css'

// Shown on /login after expireSession() redirects here (design p88).
function SessionExpiredNotice() {
  const [params] = useSearchParams()

  if (params.get('expired') !== '1')
    return null
  return (
    <p className="session-expired" role="status">
      Your session has expired. Sign in again to continue.
    </p>
  )
}

export default SessionExpiredNotice
