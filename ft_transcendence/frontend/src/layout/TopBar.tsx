import './layout.css'

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__logo">PXL_LAB</div>

      <input
        className="topbar__search"
        type="search"
        placeholder="Search people, communities, posts..."
      />

      <div className="topbar__user">AF Afnan ▾</div>
    </header>
  )
}

export default TopBar