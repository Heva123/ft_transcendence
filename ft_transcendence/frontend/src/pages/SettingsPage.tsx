import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";

function SettingsPage() {
  return (
    <AppLayout>
      <p className="small-label">
        SETTINGS
      </p>

      <h2>
        Your space, your choices.
      </h2>

      <p className="settings-subtitle">
        Your account and preferences,
        all in one place.
      </p>

      <div className="settings-tabs">
        <button
          type="button"
          className="settings-tab"
        >
          Account
        </button>

        <button
          type="button"
          className="settings-tab"
        >
          Notifications
        </button>

        <button
          type="button"
          className="settings-tab active"
        >
          Privacy & blocking
        </button>
      </div>

      <section className="settings-card">
        <h3>Privacy & blocking</h3>

        <div className="settings-row">
          <div>
            <strong>
              Blocked users
            </strong>

            <p>
              No blocked users yet.
            </p>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-links">
          <Link to="/privacy">
            Read privacy policy
          </Link>

          <Link to="/terms">
            Read terms of service
          </Link>
        </div>
      </section>
    </AppLayout>
  );
}

export default SettingsPage;