import { Link } from 'react-router-dom'
import '../components/Feedback.css'

// Unknown URLs inside the app (design p86).
function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="small-label">404 / PAGE NOT FOUND</p>
      <h1>This pixel wandered off.</h1>
      <p>The page you are looking for does not exist or was moved.</p>
      <Link to="/">Back to home</Link>
    </section>
  )
}

export default NotFoundPage
