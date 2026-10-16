import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import SearchBox from "../features/search/components/SearchBox";
import { LogoutDialog } from "../components/LogoutButton";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { useUnreadNotifications } from "../features/notifications/hooks/useUnreadNotifications";

import "./layout.css";

function TopBar() {
  const user = useCurrentUser();

  const unreadCount =
    useUnreadNotifications();

  const [confirmLogout, setConfirmLogout] =
    useState(false);

  const [isProfileOpen, setIsProfileOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement | null>(null);

  const username =
    user?.username ?? "User";

  const initials =
    username
      .slice(0, 2)
      .toUpperCase();

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__logo">
        PXL_LAB
      </div>

      <SearchBox />

      <Link
        className="topbar__notification"
        to="/notifications"
        aria-label={
          unreadCount
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="topbar__badge">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </Link>

      <div
        className="topbar__profile-wrapper"
        ref={profileRef}
      >
        <button
          type="button"
          className="topbar__profile"
          onClick={() =>
            setIsProfileOpen(
              (current) => !current
            )
          }
          aria-haspopup="menu"
          aria-expanded={
            isProfileOpen
          }
        >
          <span className="topbar__avatar">
            {initials}
          </span>

          <span className="topbar__username">
            {username}
          </span>

          <span
            className={`topbar__arrow ${
              isProfileOpen
                ? "open"
                : ""
            }`}
          >
            ▾
          </span>
        </button>

        {isProfileOpen && (
          <div
            className="topbar__profile-menu"
            role="menu"
          >
            <Link
              to="/profile"
              className="topbar__profile-menu-item"
              onClick={() =>
                setIsProfileOpen(
                  false
                )
              }
            >
              My profile
            </Link>

            <Link
              to="/settings"
              className="topbar__profile-menu-item"
              onClick={() =>
                setIsProfileOpen(
                  false
                )
              }
            >
              Settings
            </Link>

            <div className="topbar__profile-menu-divider" />

            <button
              type="button"
              className="topbar__profile-menu-item topbar__logout"
              role="menuitem"
              onClick={() => {
                setIsProfileOpen(false);
                setConfirmLogout(true);
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {confirmLogout && (
        <LogoutDialog
          onCancel={() =>
            setConfirmLogout(false)
          }
        />
      )}
    </header>
  );
}

export default TopBar;