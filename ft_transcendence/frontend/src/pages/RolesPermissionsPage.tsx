import { useEffect, useState } from "react";

import AppLayout from "../components/AppLayout";

type RoleData = {
  role: string;
  permissions: string[];
};

type RolesPermissionsPageProps = {
  token: string;
  onBack: () => void;
};

const permissionRows = [
  {
    label: "Read community",
    permission: "COMMUNITY_READ",
  },
  {
    label: "Edit community",
    permission: "COMMUNITY_UPDATE",
  },
  {
    label: "Delete community",
    permission: "COMMUNITY_DELETE",
  },
  {
    label: "View members",
    permission: "MEMBER_READ",
  },
  {
    label: "Invite members",
    permission: "MEMBER_ADD",
  },
  {
    label: "Change member roles",
    permission: "MEMBER_CHANGE_ROLE",
  },
  {
    label: "Remove members",
    permission: "MEMBER_REMOVE",
  },
  {
    label: "Read channels",
    permission: "CHANNEL_READ",
  },
  {
    label: "Create channels",
    permission: "CHANNEL_CREATE",
  },
  {
    label: "Edit channels",
    permission: "CHANNEL_UPDATE",
  },
  {
    label: "Delete channels",
    permission: "CHANNEL_DELETE",
  },
];

const roleNames = [
  "OWNER",
  "ADMIN",
  "MODERATOR",
  "MEMBER",
];

function RolesPermissionsPage({
  token,
  onBack,
}: RolesPermissionsPageProps) {
  const [roles, setRoles] =
    useState<RoleData[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadRoles() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:3000/api/roles",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load roles and permissions."
          );
        }

        const data: RoleData[] =
          await response.json();

        setRoles(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRoles();
  }, [token]);

  function hasPermission(
    roleName: string,
    permission: string
  ) {
    const role = roles.find(
      (item) =>
        item.role === roleName
    );

    return (
      role?.permissions.includes(
        permission
      ) ?? false
    );
  }

  return (
    <AppLayout>
      <button
        type="button"
        className="text-link"
        onClick={onBack}
      >
        ← Back to Community
      </button>

      <p className="small-label">
        ROLES & PERMISSIONS
      </p>

      <h2>
        A role for everyone.
      </h2>

      <p className="roles-subtitle">
        Community permissions are controlled
        by each member's role.
      </p>

      {isLoading && (
        <p
          className="message"
          role="status"
        >
          Loading permissions...
        </p>
      )}

      {error && (
        <p
          className="form-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {!isLoading &&
        !error && (
          <div className="roles-table-wrapper">
            <table className="roles-table">
              <thead>
                <tr>
                  <th>
                    Permission
                  </th>

                  {roleNames.map(
                    (role) => (
                      <th key={role}>
                        {role}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {permissionRows.map(
                  (row) => (
                    <tr
                      key={
                        row.permission
                      }
                    >
                      <td>
                        {row.label}
                      </td>

                      {roleNames.map(
                        (role) => (
                          <td key={role}>
                            {hasPermission(
                              role,
                              row.permission
                            )
                              ? "✓"
                              : "—"}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

      <p className="roles-note">
        These permissions are loaded from
        the backend API.
      </p>
    </AppLayout>
  );
}

export default RolesPermissionsPage;