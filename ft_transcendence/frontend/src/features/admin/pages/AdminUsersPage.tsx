import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../../../components/AppLayout";
import ConfirmDialog from "../../../components/ConfirmDialog";

import {
  deleteAdminUser,
  getAdminUsers,
  getCurrentUser,
  updateAdminUser,
  type AdminUser,
  type SiteRole,
} from "../../auth/api/userApi";

import {
  isSiteAdmin,
} from "../../auth/utils/sitePermissions";

import {
  ApiError,
} from "../../../api/apiClient";

import "./AdminUsersPage.css";

const SITE_ROLES: SiteRole[] = [
  "ADMIN",
  "USER",
  "GUEST",
];

function AdminUsersPage() {
  const [
    users,
    setUsers,
  ] = useState<AdminUser[]>([]);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");

  const [
    authorized,
    setAuthorized,
  ] = useState<boolean | null>(
    null
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  );

  const [
    editUsername,
    setEditUsername,
  ] = useState("");

  const [
    editEmail,
    setEditEmail,
  ] = useState("");

  const [
    editRole,
    setEditRole,
  ] = useState<SiteRole>(
    "USER"
  );

  const [
    savingId,
    setSavingId,
  ] = useState<string | null>(
    null
  );

  const [
    deletingUser,
    setDeletingUser,
  ] =
    useState<AdminUser | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const me =
          await getCurrentUser();

        if (!active) {
          return;
        }

        setCurrentUserId(me.id);

        if (!isSiteAdmin(me)) {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

        const data =
          await getAdminUsers();

        if (active) {
          setUsers(data);
        }
      } catch (err) {
        if (!active) {
          return;
        }

        setError(
          err instanceof ApiError
            ? err.message
            : "Could not load users."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  function startEdit(
    user: AdminUser
  ) {
    setEditingId(user.id);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditRole(user.siteRole);
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setError("");
  }

  async function saveUser(
    userId: string
  ) {
    if (savingId) {
      return;
    }

    const cleanUsername =
      editUsername.trim();

    const cleanEmail =
      editEmail
        .trim()
        .toLowerCase();

    if (
      cleanUsername.length < 3 ||
      cleanUsername.length > 30
    ) {
      setError(
        "Username must be 3-30 characters."
      );

      return;
    }

    if (
      !/^[a-zA-Z0-9_]+$/.test(
        cleanUsername
      )
    ) {
      setError(
        "Username can contain only letters, numbers and underscores."
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email."
      );

      return;
    }

    setSavingId(userId);
    setError("");
    setMessage("");

    try {
      const updated =
        await updateAdminUser(
          userId,
          {
            username:
              cleanUsername,

            email:
              cleanEmail,

            siteRole:
              editRole,
          }
        );

      setUsers(
        (current) =>
          current.map(
            (user) =>
              user.id ===
              updated.id
                ? updated
                : user
          )
      );

      setEditingId(null);

      setMessage(
        "User updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not update user."
      );
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deletingUser) {
      return;
    }

    const target =
      deletingUser;

    setError("");
    setMessage("");

    try {
      await deleteAdminUser(
        target.id
      );

      setUsers(
        (current) =>
          current.filter(
            (user) =>
              user.id !==
              target.id
          )
      );

      setDeletingUser(null);

      setMessage(
        "User deleted successfully."
      );
    } catch (err) {
      setDeletingUser(null);

      setError(
        err instanceof ApiError
          ? err.message
          : "Could not delete user."
      );
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <p
          className="message"
          role="status"
        >
          Checking admin
          permissions...
        </p>
      </AppLayout>
    );
  }

  if (
    authorized === false
  ) {
    return (
      <AppLayout>
        <p className="small-label">
          ADMIN
        </p>

        <h2>
          Access denied.
        </h2>

        <div className="dashboard-card">
          <p>
            This page is available
            only to site
            administrators.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <p className="small-label">
        ADMIN
      </p>

      <h2>
        User management.
      </h2>

      <p className="admin-users-subtitle">
        Manage accounts and
        site-wide permissions.
      </p>

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

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Site role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(
              (user) => {
                const editing =
                  editingId ===
                  user.id;

                const isSelf =
                  currentUserId ===
                  user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      {editing ? (
                        <input
                          value={
                            editUsername
                          }
                          onChange={(
                            event
                          ) =>
                            setEditUsername(
                              event
                                .target
                                .value
                            )
                          }
                          maxLength={
                            30
                          }
                        />
                      ) : (
                        <>
                          <strong>
                            @
                            {
                              user.username
                            }
                          </strong>

                          {isSelf && (
                            <span className="admin-you-badge">
                              You
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <input
                          type="email"
                          value={
                            editEmail
                          }
                          onChange={(
                            event
                          ) =>
                            setEditEmail(
                              event
                                .target
                                .value
                            )
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>

                    <td>
                      {editing ? (
                        <select
                          value={
                            editRole
                          }
                          onChange={(
                            event
                          ) =>
                            setEditRole(
                              event
                                .target
                                .value as SiteRole
                            )
                          }
                        >
                          {SITE_ROLES.map(
                            (
                              role
                            ) => (
                              <option
                                key={
                                  role
                                }
                                value={
                                  role
                                }
                              >
                                {
                                  role
                                }
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <span
                          className={`admin-role-badge ${user.siteRole.toLowerCase()}`}
                        >
                          {
                            user.siteRole
                          }
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="admin-user-actions">
                        {editing ? (
                          <>
                            <button
                              type="button"
                              className="people-button primary"
                              disabled={
                                savingId ===
                                user.id
                              }
                              onClick={() =>
                                saveUser(
                                  user.id
                                )
                              }
                            >
                              {savingId ===
                              user.id
                                ? "Saving..."
                                : "Save"}
                            </button>

                            <button
                              type="button"
                              className="people-button"
                              disabled={
                                savingId ===
                                user.id
                              }
                              onClick={
                                cancelEdit
                              }
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="people-button"
                              onClick={() =>
                                startEdit(
                                  user
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="people-button danger"
                              disabled={
                                isSelf
                              }
                              title={
                                isSelf
                                  ? "You cannot delete your own account here."
                                  : undefined
                              }
                              onClick={() =>
                                setDeletingUser(
                                  user
                                )
                              }
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {users.length === 0 &&
        !error && (
          <div className="dashboard-card">
            No users found.
          </div>
        )}

      {deletingUser && (
        <ConfirmDialog
          title={`Delete @${deletingUser.username}?`}
          message="This deletes the account and everything they created. This cannot be undone."
          confirmLabel="Delete user"
          onCancel={() =>
            setDeletingUser(null)
          }
          onConfirm={
            confirmDelete
          }
        />
      )}
    </AppLayout>
  );
}

export default AdminUsersPage;