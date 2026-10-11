import { NavLink } from 'react-router-dom'
import { useMyCommunities } from '../features/chat/hooks/useMyCommunities'
import './layout.css'

function navClass({ isActive }: { isActive: boolean }) {
  let value: string

  value = 'sidebar__item'
  if (isActive)
    value += ' active'
  return value
}

function WorkspaceNav() {
  return (
    <nav className="sidebar__nav">
      <NavLink className={navClass} end to="/">Home</NavLink>
      <NavLink className={navClass} to="/communities">Communities</NavLink>
      <NavLink className={navClass} to="/channels">Channels</NavLink>
      <NavLink className={navClass} to="/friends">Friends</NavLink>
      <NavLink className={navClass} to="/profile">My profile</NavLink>
    </nav>
  )
}

function Sidebar() {
  const { communities } = useMyCommunities()

  return (
    <aside className="sidebar">
      <p className="sidebar__label">YOUR WORKSPACE</p>
      <WorkspaceNav />
      <p className="sidebar__label">YOUR COMMUNITIES</p>
      <nav className="sidebar__nav">
        {communities.map((item) => (
          <NavLink key={item.id} className={navClass}
            to={`/communities/${item.id}`}>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__spacer" />
      <aside className="sidebar-promo">
        <strong>⚡ Better, together.</strong>
        <p>Your next great idea could start with a hello.</p>
        <span>Explore →</span>
      </aside>
      <nav className="sidebar__footer">
        <NavLink to="/settings">Settings</NavLink>
        <button type="button">Log out</button>
      </nav>
    </aside>
  )
}

export default Sidebar
