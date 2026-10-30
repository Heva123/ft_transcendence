import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AppLayout from "../../../components/AppLayout";
import AccountSettingsForm from "../components/AccountSettingsForm";

import {
  getBlockedUsers,
  getCurrentUser,
  unblockUser,
  type BlockedUser,
  type CurrentUser,
} from "../api/userApi";

type SettingsTab =
  | "account"
  | "notifications"
  | "privacy";

function SettingsPage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<SettingsTab>(
    "account"
  );

  const [
    user,
    setUser,
  ] =
    useState<CurrentUser | null>(
      null
    );

  const [
    blockedUsers,
    setBlockedUsers,
  ] =
    useState<BlockedUser[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    unblockingId,
    setUnblockingId,
  ] =
    useState<string | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setError("");

      try {
        const [
          currentUser,
          blocked,
        ] =
          await Promise.all([
            getCurrentUser(),
            getBlockedUsers(),
          ]);

        setUser(currentUser);
        setBlockedUsers(blocked);
      } catch {
        setError(
          "Could not load settings."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleUnblock(
    userId: string
  ) {
    if (unblockingId) {
      return;
    }

    setError("");
    setMessage("");
    setUnblockingId(userId);

    try {
      await unblockUser(userId);

      setBlockedUsers(
        (current) =>
          current.filter(
            (item) =>
              item.blocked.id !==
              userId
          )
      );

      setMessage(
        "User unblocked successfully."
      );
    } catch {
      setError(
        "Could not unblock this user."
      );
    } finally {
      setUnblockingId(null);
    }
  }

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
          className={
            activeTab === "account"
              ? "settings-tab active"
              : "settings-tab"
          }
          onClick={() => {
            setActiveTab("account");
            setError("");
            setMessage("");
          }}
        >
          Account
        </button>

        <button
          type="button"
          className={
            activeTab ===
            "notifications"
              ? "settings-tab active"
              : "settings-tab"
          }
          onClick={() => {
            setActiveTab(
              "notifications"
            );
            setError("");
            setMessage("");
          }}
        >
          Notifications
        </button>

        <button
          type="button"
          className={
            activeTab === "privacy"
              ? "settings-tab active"
              : "settings-tab"
          }
          onClick={() => {
            setActiveTab("privacy");
            setError("");
            setMessage("");
          }}
        >
          Privacy & blocking
        </button>
      </div>

      {isLoading ? (
        <section className="settings-card">
          <p>
            Loading settings...
          </p>
        </section>
      ) : (
        <>
          {activeTab ===
            "account" && (
            <section className="settings-card">
              <h3>Account</h3>

              {user ? (
                <>
                  <AccountSettingsForm
                    user={user}
                    onSaved={setUser}
                  />

                  <div className="settings-divider" />

                  <Link
                    className="settings-action-link"
                    to="/profile"
                  >
                    Edit profile
                  </Link>
                </>
              ) : (
                <p>
                  Account information
                  is unavailable.
                </p>
              )}
            </section>
          )}

          {activeTab ===
            "notifications" && (
            <section className="settings-card">
              <h3>
                Notifications
              </h3>

              <p className="settings-muted">
                Updates arrive live in
                the app while you are
                signed in. The bell in
                the top bar shows how
                many are unread.
              </p>

              <p className="settings-muted">
                Choosing which updates
                reach you will be added
                when the backend
                supports notification
                preferences.
              </p>

              <Link
                className="settings-action-link"
                to="/notifications"
              >
                Open notifications
              </Link>
            </section>
          )}

          {activeTab ===
            "privacy" && (
            <section className="settings-card">
              <h3>
                Privacy & blocking
              </h3>

              <div className="settings-row">
                <div>
                  <strong>
                    Blocked users
                  </strong>

                  <p>
                    People you block
                    have restricted
                    interaction with
                    you.
                  </p>
                </div>
              </div>

              <div className="settings-blocked-list">
                {blockedUsers.length ===
                0 ? (
                  <p className="settings-muted">
                    No blocked users
                    yet.
                  </p>
                ) : (
                  blockedUsers.map(
                    (item) => (
                      <div
                        className="settings-blocked-user"
                        key={
                          item.blocked.id
                        }
                      >
                        <div>
                          <strong>
                            @
                            {
                              item
                                .blocked
                                .username
                            }
                          </strong>

                          <p>
                            Hidden
                            messages
                            and
                            restricted
                            interaction
                          </p>
                        </div>

                        <button
                          type="button"
                          className="settings-unblock-button"
                          disabled={
                            unblockingId ===
                            item
                              .blocked
                              .id
                          }
                          onClick={() =>
                            handleUnblock(
                              item
                                .blocked
                                .id
                            )
                          }
                        >
                          {unblockingId ===
                          item
                            .blocked
                            .id
                            ? "Unblocking..."
                            : "Unblock"}
                        </button>
                      </div>
                    )
                  )
                )}
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
          )}
        </>
      )}

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          className="message"
          role="status"
        >
          {message}
        </p>
      )}
    </AppLayout>
  );
}

export default SettingsPage;