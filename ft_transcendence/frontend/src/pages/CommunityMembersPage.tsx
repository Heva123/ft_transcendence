import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import AppLayout from "../components/AppLayout";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

import {
  usePresence,
} from "../features/presence/hooks/usePresence";

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
  token: _token,
  onBack,
}: CommunityMembersPageProps) {
  const [
    members,
    setMembers,
  ] = useState<Member[]>([]);

  const [
    currentRole,
    setCurrentRole,
  ] = useState<Role>(
    "MEMBER"
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    newMemberRole,
    setNewMemberRole,
  ] = useState<Role>(
    "MEMBER"
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isAdding,
    setIsAdding,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const presence =
    usePresence();

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);

      setError("");

      try {
        const [
          membersData,
          detailsData,
        ] =
          await Promise.all([
            apiRequest<Member[]>(
              `/communities/${groupId}/members`
            ),

            apiRequest<CommunityDetails>(
              `/communities/${groupId}`
            ),
          ]);

        setMembers(
          membersData
        );

        setCurrentRole(
          detailsData.members[0]
            ?.role || "MEMBER"
        );
      } catch (err) {
        if (
          err instanceof ApiError
        ) {
          setError(
            err.message
          );
        } else {
          setError(
            "Could not load community members."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMembers();
  }, [groupId]);

  const filteredMembers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return members;
      }

      return members.filter(
        (member) =>
          member.user.username
            .toLowerCase()
            .includes(query) ||

          member.user.email
            .toLowerCase()
            .includes(query) ||

          member.role
            .toLowerCase()
            .includes(query)
      );
    }, [
      members,
      search,
    ]);

  function isOnline(
    userId: string
  ) {
    return presence.some(
      (item) =>
        item.userId ===
          userId &&
        item.online
    );
  }

  async function handleAddMember(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isAdding) {
      return;
    }

    const cleanEmail =
      email.trim();

    if (!cleanEmail) {
      setError(
        "Please enter an email address."
      );

      return;
    }

    setIsAdding(true);

    setError("");

    setMessage("");

    try {
      const newMember =
        await apiRequest<Member>(
          `/communities/${groupId}/members`,
          {
            method: "POST",

            body: JSON.stringify({
              email:
                cleanEmail,

              role:
                newMemberRole,
            }),
          }
        );

      setMembers(
        (current) => [
          ...current,
          newMember,
        ]
      );

      setEmail("");

      setNewMemberRole(
        "MEMBER"
      );

      setMessage(
        "Member added successfully."
      );
    } catch (err) {
      if (
        err instanceof ApiError
      ) {
        if (
          err.status === 404
        ) {
          setError(
            "No registered user has this email."
          );
        } else if (
          err.status === 409
        ) {
          setError(
            "This user is already a member."
          );
        } else if (
          err.status === 403
        ) {
          setError(
            "You do not have permission to add this member."
          );
        } else {
          setError(
            err.message
          );
        }
      } else {
        setError(
          "Could not add member."
        );
      }
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
      const updated =
        await apiRequest<Member>(
          `/communities/${groupId}/members/${memberId}/role`,
          {
            method: "PATCH",

            body: JSON.stringify({
              role,
            }),
          }
        );

      setMembers(
        (current) =>
          current.map(
            (member) =>
              member.id ===
              updated.id
                ? updated
                : member
          )
      );

      setMessage(
        "Member role updated successfully."
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status === 403
      ) {
        setError(
          "You do not have permission to change this role."
        );
      } else if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Could not change member role."
        );
      }
    }
  }

  async function handleRemoveMember(
    memberId: string
  ) {
    setError("");

    setMessage("");

    try {
      await apiRequest(
        `/communities/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      setMembers(
        (current) =>
          current.filter(
            (member) =>
              member.id !==
              memberId
          )
      );

      setMessage(
        "Member removed successfully."
      );
    } catch (err) {
      if (
        err instanceof
          ApiError &&
        err.status === 403
      ) {
        setError(
          "You do not have permission to remove this member."
        );
      } else if (
        err instanceof
        ApiError
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Could not remove member."
        );
      }
    }
  }

  function canRemoveMember(
    member: Member
  ) {
    if (
      member.role ===
      "OWNER"
    ) {
      return false;
    }

    if (
      currentRole ===
      "OWNER"
    ) {
      return true;
    }

    if (
      currentRole ===
        "ADMIN" &&
      member.role !==
        "ADMIN"
    ) {
      return true;
    }

    if (
      currentRole ===
        "MODERATOR" &&
      member.role ===
        "MEMBER"
    ) {
      return true;
    }

    return false;
  }

  const canAddMember =
    currentRole ===
      "OWNER" ||
    currentRole ===
      "ADMIN";

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
        COMMUNITY MEMBERS
      </p>

      <h2>
        The people behind the pixels.
      </h2>

      <p className="members-subtitle">
        Your role:{" "}
        {currentRole}
      </p>

      <div className="members-search-row">
        <input
          className="members-search"
          type="search"
          placeholder="Search members..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      {canAddMember && (
        <div className="members-add-card">
          <h3>
            Add a member
          </h3>

          <form
            className="members-add-form"
            onSubmit={
              handleAddMember
            }
          >
            <div className="members-form-field">
              <label htmlFor="member-email">
                Email
              </label>

              <input
                id="member-email"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />
            </div>

            <div className="members-form-field">
              <label htmlFor="member-role">
                Role
              </label>

              <select
                id="member-role"
                value={
                  newMemberRole
                }
                onChange={(event) =>
                  setNewMemberRole(
                    event.target
                      .value as Role
                  )
                }
              >
                <option value="MEMBER">
                  MEMBER
                </option>

                <option value="MODERATOR">
                  MODERATOR
                </option>

                {currentRole ===
                  "OWNER" && (
                  <option value="ADMIN">
                    ADMIN
                  </option>
                )}
              </select>
            </div>

            <button
              type="submit"
              className="members-add-button"
              disabled={
                isAdding
              }
            >
              {isAdding
                ? "Adding..."
                : "Add member"}
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <p
          className="message"
          role="status"
        >
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
        filteredMembers.length >
          0 && (
          <div className="members-list">
            {filteredMembers.map(
              (member) => {
                const online =
                  isOnline(
                    member.user.id
                  );

                return (
                  <div
                    className="member-row"
                    key={
                      member.id
                    }
                  >
                    <div className="member-person">
                      <div className="member-avatar">
                        {member.user.username
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="member-info">
                        <strong>
                          {
                            member
                              .user
                              .username
                          }
                        </strong>

                        <span>
                          @
                          {
                            member
                              .user
                              .username
                          }{" "}
                          ·{" "}
                          {online
                            ? "Online"
                            : "Offline"}
                        </span>

                        <span>
                          {
                            member
                              .user
                              .email
                          }
                        </span>
                      </div>
                    </div>

                    <span
                      className={`member-role-badge ${member.role.toLowerCase()}`}
                    >
                      {
                        member.role
                      }
                    </span>

                    <div className="member-actions">
                      {currentRole ===
                        "OWNER" &&
                        member.role !==
                          "OWNER" && (
                          <select
                            className="member-role-select"
                            value={
                              member.role
                            }
                            onChange={(event) =>
                              handleChangeRole(
                                member.id,
                                event
                                  .target
                                  .value as Role
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

                      {canRemoveMember(
                        member
                      ) && (
                        <button
                          type="button"
                          className="member-remove"
                          onClick={() =>
                            handleRemoveMember(
                              member.id
                            )
                          }
                        >
                          Remove member
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}

      {!isLoading &&
        filteredMembers.length ===
          0 && (
          <div className="dashboard-card">
            <p>
              {search
                ? "No members match your search."
                : "No members found."}
            </p>
          </div>
        )}

      <p className="members-note">
        Roles belong to each
        community membership, not
        to the student globally.
      </p>
    </AppLayout>
  );
}

export default CommunityMembersPage;