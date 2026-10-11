function Sidebar() {
  const hash = window.location.hash;

  const currentPage =
    hash === "#/profile"
      ? "profile"
      : hash === "#/communities"
        ? "communities"
        : hash === "#/discover"
          ? "discover"
          : "dashboard";

  return (
    <aside className="app-sidebar">

      <p className="sidebar-title">
        YOUR WORKSPACE
      </p>

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
            >
              Home
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
            >
              Communities
            </a>
          </li>

          <li>
            <span className="sidebar-item">
              Channels
            </span>
          </li>

          <li>
            <span className="sidebar-item">
              Friends
            </span>
          </li>

          <li>
            <a
              href="#/profile"
              className={
                currentPage === "profile"
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
            >
              My Profile
            </a>
          </li>

        </ul>
      </nav>

      <div className="sidebar-divider" />

      <p className="sidebar-title">
        DISCOVER
      </p>

      <a
        href="#/discover"
        className={
          currentPage === "discover"
            ? "sidebar-item active"
            : "sidebar-item"
        }
      >
        Explore Communities
      </a>

      <div className="sidebar-bottom">
        <a
          href="#/settings"
          className="sidebar-item"
        >
          Settings
        </a>

        <button
          type="button"
          className="sidebar-item sidebar-logout"
          onClick={() => {
            sessionStorage.removeItem("transcendence-session");
            sessionStorage.removeItem("selected-community-id");

            window.location.hash = "/login";
            window.location.reload();
          }}
        >
          Log out
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;