import {
  NavLink,
} from "react-router-dom";

import {
  useMyCommunities,
} from "../features/chat/hooks/useMyCommunities";

import "./layout.css";

function navClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive
    ? "sidebar__item active"
    : "sidebar__item";
}

function mobileNavClass({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive
    ? "mobile-nav__item active"
    : "mobile-nav__item";
}

function WorkspaceNav() {
  return (
    <nav className="sidebar__nav">
      <NavLink
        className={navClass}
        end
        to="/"
      >
        Home
      </NavLink>

      <NavLink
        className={navClass}
        to="/communities"
      >
        Communities
      </NavLink>

      <NavLink
        className={navClass}
        to="/channels"
      >
        Channels
      </NavLink>

      <NavLink
        className={navClass}
        to="/friends"
      >
        Friends
      </NavLink>

      <NavLink
        className={navClass}
        to="/profile"
      >
        My profile
      </NavLink>
    </nav>
  );
}

function Sidebar() {
  const {
    communities,
  } = useMyCommunities();

  return (
    <>
      <aside className="sidebar">
        <p className="sidebar__label">
          YOUR WORKSPACE
        </p>

        <WorkspaceNav />

        <p className="sidebar__label">
          YOUR COMMUNITIES
        </p>

        <nav className="sidebar__nav">
          {communities.map(
            (item) => (
              <NavLink
                key={item.id}
                className={
                  navClass
                }
                to={`/communities/${item.id}`}
              >
                {item.name}
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar__spacer" />

        <aside className="sidebar-promo">
          <strong>
            ⚡ Better, together.
          </strong>

          <p>
            Your next great idea
            could start with a hello.
          </p>

          <NavLink to="/communities/discover">
            Explore →
          </NavLink>
        </aside>

        <nav className="sidebar__footer">
          <NavLink to="/settings">
            Settings
          </NavLink>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(
                "accessToken"
              );

              window.location.href =
                "/login";
            }}
          >
            Log out
          </button>
        </nav>
      </aside>

      {/* Mobile navigation from Figma */}
      <nav className="mobile-nav">
        <NavLink
          end
          to="/"
          className={
            mobileNavClass
          }
        >
          <span>⌂</span>
          Home
        </NavLink>

        <NavLink
          to="/communities/discover"
          className={
            mobileNavClass
          }
        >
          <span>⌕</span>
          Explore
        </NavLink>

        <NavLink
          to="/channels"
          className={
            mobileNavClass
          }
        >
          <span>#</span>
          Chat
        </NavLink>

        <NavLink
          to="/profile"
          className={
            mobileNavClass
          }
        >
          <span>◉</span>
          Me
        </NavLink>
      </nav>
    </>
  );
}

export default Sidebar;