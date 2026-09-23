import { useContext } from "react";
import { UserContext } from "../UserContext";

function Navbar() {
  const user = useContext(UserContext);

  const username = user?.username ?? "Account";
  const initial = user?.username.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="app-navbar">
      <h1 className="navbar-logo">
        PXL_LAB
      </h1>

      <div className="navbar-search">
        Search people, communities, posts...
      </div>

      <div className="navbar-user">
        <span className="navbar-avatar">
          {initial}
        </span>

        <span>{username}</span>
      </div>
    </header>
  );
}

export default Navbar;