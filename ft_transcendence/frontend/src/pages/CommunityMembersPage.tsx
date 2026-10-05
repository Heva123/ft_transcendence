import { useEffect, useState, type FormEvent } from "react";

import AppLayout from "../components/AppLayout";

type Role =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "MEMBER";

type Member = {
  id: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
};

type CommunityDetails = {
  members: {
    role: Role;
  }[];
};

type CommunityMembersPageProps = {
  groupId: string;
  token: string;
  onBack: () => void;
};

function CommunityMembersPage({
  groupId,
  token,
  onBack,
}: CommunityMembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentRole, setCurrentRole] =
    useState<Role>("MEMBER");

  const [email, setEmail] = useState("");
  const [newMemberRole, setNewMemberRole] =
    useState<Role>("MEMBER");

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      setError("");

      try {
        const membersResponse = await fetch(
          `http://localhost:3000/api/communities/${groupId}/members`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const detailsResponse = await fetch(
          `http://localhost:3000/api/communities/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!membersResponse.ok || !detailsResponse.ok) {
          throw new Error(
            "Could not load community members."
          );
        }

        const membersData: Member[] =
          await membersResponse.json();

        const detailsData: CommunityDetails =
          await detailsResponse.json();

        setMembers(membersData);

        setCurrentRole(
          detailsData.members[0]?.role || "MEMBER"
        );
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

    loadMembers();
  }, [groupId, token]);

  async function handleAddMember(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsAdding(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/communities/${groupId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            role: newMemberRole,
          }),
        }
      );

      if (response.status === 404) {
        setError(
          "No registered user has this email."
        );
        return;
      }

      if (response.status === 409) {
        setError(
          "This user is already a member."
        );
        return;
      }

      if (response.status === 403) {
        setError(
          "You do not have permission to add this member."
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Could not add member.");
      }

      const newMember: Member =
        await response.json();

      setMembers((currentMembers) => [
        ...currentMembers,
        newMember,
      ]);

      setEmail("");
      setNewMemberRole("MEMBER");

      setMessage(
        "Member added successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleChangeRole(
    memberId: string,
    role: Role
  ) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/communities/${groupId}/members/${memberId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role,
          }),
        }
      );

      if (response.status === 403) {
        setError(
          "You do not have permission to change this role."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Could not change member role."
        );
      }

      const updatedMember: Member =
        await response.json();

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === updatedMember.id
            ? updatedMember
            : member
        )
      );

      setMessage(
        "Member role updated successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  }

  async function handleRemoveMember(
    memberId: string
  ) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/communities/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        setError(
          "You do not have permission to remove this member."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Could not remove member."
        );
      }

      setMembers((currentMembers) =>
        currentMembers.filter(
          (member) => member.id !== memberId
        )
      );

      setMessage(
        "Member removed successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    }
  }

  function canRemoveMember(member: Member) {
    if (member.role === "OWNER") {
      return false;
    }

    if (currentRole === "OWNER") {
      return true;
    }

    if (
      currentRole === "ADMIN" &&
      member.role !== "ADMIN"
    ) {
      return true;
    }

    if (
      currentRole === "MODERATOR" &&
      member.role === "MEMBER"
    ) {
      return true;
    }

    return false;
  }

  const canAddMember =
    currentRole === "OWNER" ||
    currentRole === "ADMIN";

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
        MEMBERS
      </p>

      <h2>Community Members</h2>

      <p>
        Your role: {currentRole}
      </p>

      {canAddMember && (
        <div className="dashboard-card">
          <h3>Add Member</h3>

          <form onSubmit={handleAddMember}>
            <label htmlFor="member-email">
              Email
            </label>

            <input
              id="member-email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

            <label htmlFor="member-role">
              Role
            </label>

            <select
              id="member-role"
              value={newMemberRole}
              onChange={(event) =>
                setNewMemberRole(
                  event.target.value as Role
                )
              }
            >
              <option value="MEMBER">
                MEMBER
              </option>

              <option value="MODERATOR">
                MODERATOR
              </option>

              {currentRole === "OWNER" && (
                <option value="ADMIN">
                  ADMIN
                </option>
              )}
            </select>

            <button
              type="submit"
              disabled={isAdding}
            >
              {isAdding
                ? "Adding..."
                : "Add Member"}
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <p className="message">
          Loading members...
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

      {message && (
        <p
          className="message"
          role="status"
        >
          {message}
        </p>
      )}

      {!isLoading &&
        !error &&
        members.map((member) => (
          <div
            className="dashboard-card"
            key={member.id}
          >
            <h3>
              {member.user.username}
            </h3>

            <p>
              {member.user.email}
            </p>

            <p>
              Role: {member.role}
            </p>

            {currentRole === "OWNER" &&
              member.role !== "OWNER" && (
                <select
                  value={member.role}
                  onChange={(event) =>
                    handleChangeRole(
                      member.id,
                      event.target.value as Role
                    )
                  }
                >
                  <option value="MEMBER">
                    MEMBER
                  </option>

                  <option value="MODERATOR">
                    MODERATOR
                  </option>

                  <option value="ADMIN">
                    ADMIN
                  </option>
                </select>
              )}

            {canRemoveMember(member) && (
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  handleRemoveMember(member.id)
                }
              >
                Remove Member
              </button>
            )}
          </div>
        ))}

      {!isLoading &&
        !error &&
        members.length === 0 && (
          <div className="dashboard-card">
            <p>No members found.</p>
          </div>
        )}
    </AppLayout>
  );
}

export default CommunityMembersPage;