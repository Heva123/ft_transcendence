import { useNavigate } from 'react-router-dom'
import LegalPage from '../features/legal/pages/LegalPage'

type LegalRouteProps = {
  title: string
}

function LegalRoute({ title }: LegalRouteProps) {
  const navigate = useNavigate()

  return (
    <LegalPage
      title={title}
      onBack={() => navigate(-1)}
    />
  )
}

export default LegalRoute
