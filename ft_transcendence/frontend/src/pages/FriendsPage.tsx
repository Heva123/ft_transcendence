import { Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";

function FriendsPage() {
  return (
    <AppLayout>
      <p className="small-label">
        FRIENDS
      </p>

      <h2>
        Your circle.
      </h2>

      <p className="friends-subtitle">
        A familiar face makes every
        project better.
      </p>

      <section className="friends-empty-card">
        <h3>
          Friends are not connected yet.
        </h3>

        <p>
          The frontend is ready for
          this section, but the current
          backend does not provide
          friendship or friend-request
          endpoints yet.
        </p>

        <Link
          to="/search"
          className="community-primary-button"
        >
          Find more people
        </Link>
      </section>
    </AppLayout>
  );
}

export default FriendsPage;