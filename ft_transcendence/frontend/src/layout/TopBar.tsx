import { Link } from 'react-router-dom'
import './layout.css'
import SearchBox from '../features/search/components/SearchBox'

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__logo">PXL_LAB</div>

      <SearchBox />

      <Link className="topbar__notification" to="/notifications">
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      </Link>

      <div className="topbar__profile">
        <span className="topbar__avatar">AF</span>
        <span>Afnan</span>
        <span>▾</span>
      </div>
    </header>
  )
}

export default TopBar
