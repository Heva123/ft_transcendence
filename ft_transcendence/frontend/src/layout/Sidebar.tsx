import { NavLink } from 'react-router-dom'
import './layout.css'

function navClass({ isActive }: { isActive: boolean }) {
  let className: string

  className = 'sidebar__item'
  if (isActive)
    className += ' active'
  return className
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar__label">YOUR WORKSPACE</p>
      <nav className="sidebar__nav">
        <NavLink className={navClass} end to="/">Home</NavLink>
        <NavLink className={navClass} end to="/communities">Communities</NavLink>
        <NavLink className={navClass} to="/channels">Channels</NavLink>
        <NavLink className={navClass} to="/friends">Friends</NavLink>
        <NavLink className={navClass} to="/profile">My profile</NavLink>
      </nav>

      <p className="sidebar__label">YOUR COMMUNITIES</p>
      <nav className="sidebar__nav">
        <NavLink className={navClass} to="/communities/1">Web Builders</NavLink>
        <NavLink className={navClass} to="/communities/2">Systems Circle</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar