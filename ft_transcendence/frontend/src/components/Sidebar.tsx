function Sidebar() {
  const hash = window.location.hash;

  const currentPage =
    hash === "#/profile"
      ? "profile"
      : hash === "#/communities"
        ? "communities"
        : "dashboard";

  return (
    <aside className="app-sidebar">
      <p className="sidebar-title">YOUR SPACE</p>

      <nav aria-label="Main navigation">
        <ul className="sidebar-menu">
          <li>
            <a
              href="#/dashboard"
              className={
                currentPage === "dashboard"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              aria-current={
                currentPage === "dashboard" ? "page" : undefined
              }
            >
              Dashboard
            </a>
          </li>

          <li>
            <a
              href="#/profile"
              className={
                currentPage === "profile"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              aria-current={
                currentPage === "profile" ? "page" : undefined
              }
            >
              My Profile
            </a>
          </li>

          <li>
            <a
              href="#/communities"
              className={
                currentPage === "communities"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
              aria-current={
                currentPage === "communities" ? "page" : undefined
              }
            >
              Communities
            </a>
          </li>

          <li>
            <span className="sidebar-item">
              Friends
            </span>
          </li>

          <li>
            <span className="sidebar-item">
              Settings
            </span>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;