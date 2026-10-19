import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import AppLayout from "../components/AppLayout";
import MyInvitations from "../features/invitations/components/MyInvitations";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

type Group = {
  id: string;
  name: string;
  description: string | null;

  _count: {
    members: number;
  };

  members: {
    role: string;
  }[];
};

type CreatedGroup = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  currentUserRole: string;
};

type CommunitiesPageProps = {
  token: string;

  onOpenCommunity: (
    groupId: string
  ) => void;
};

function CommunitiesPage({
  onOpenCommunity,
}: CommunitiesPageProps) {
  const [groups, setGroups] =
    useState<Group[]>([]);

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [name, setName] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    createError,
    setCreateError,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadCommunities() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await apiRequest<Group[]>(
            "/communities"
          );

        setGroups(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError(
            "Could not load communities."
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCommunities();
  }, []);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    const cleanName =
      name.trim();

    const cleanDescription =
      description.trim();

    setCreateError("");
    setMessage("");

    if (
      cleanName.length < 2 ||
      cleanName.length > 100
    ) {
      setCreateError(
        "Community name must contain 2-100 characters."
      );

      return;
    }

    if (
      cleanDescription.length >
      500
    ) {
      setCreateError(
        "Description cannot exceed 500 characters."
      );

      return;
    }

    setIsCreating(true);

    try {
      const created =
        await apiRequest<CreatedGroup>(
          "/communities",
          {
            method: "POST",

            body: JSON.stringify({
              name: cleanName,

              description:
                cleanDescription ||
                undefined,
            }),
          }
        );

      const newGroup: Group = {
        id: created.id,
        name: created.name,

        description:
          created.description,

        _count: {
          members:
            created.memberCount,
        },

        members: [
          {
            role:
              created.currentUserRole,
          },
        ],
      };

      setGroups(
        (current) => [
          newGroup,
          ...current,
        ]
      );

      setName("");
      setDescription("");

      setShowCreateForm(false);

      setMessage(
        "Community created successfully!"
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(
          err.message
        );
      } else {
        setCreateError(
          "Could not create community."
        );
      }
    } finally {
      setIsCreating(false);
    }
  }

  function cancelCreate() {
    setShowCreateForm(false);
    setCreateError("");
    setName("");
    setDescription("");
  }

  if (showCreateForm) {
    return (
      <AppLayout>
        <button
          type="button"
          className="text-link"
          onClick={cancelCreate}
          disabled={isCreating}
        >
          ← Back to communities
        </button>

        <p className="small-label">
          CREATE COMMUNITY
        </p>

        <h2>
          Start a new corner.
        </h2>

        <p className="community-form-subtitle">
          Make a little change.
          Keep building.
        </p>

        <form
          className="community-form-card"
          onSubmit={handleCreate}
        >
          <label
            className="community-form-field"
            htmlFor="community-name"
          >
            <span>
              Community name
            </span>

            <input
              id="community-name"
              type="text"
              value={name}
              placeholder="Systems Circle"
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              maxLength={100}
              required
            />
          </label>

          <label
            className="community-form-field"
            htmlFor="community-description"
          >
            <span>
              Description
            </span>

            <textarea
              id="community-description"
              value={description}
              placeholder="A home for C, C++ and curious systems builders."
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              maxLength={500}
              rows={5}
            />
          </label>

          {createError && (
            <p
              className="form-error"
              role="alert"
            >
              {createError}
            </p>
          )}

          <div className="community-form-actions">
            <button
              type="submit"
              className="community-primary-button"
              disabled={isCreating}
            >
              {isCreating
                ? "Creating..."
                : "Create community"}
            </button>

            <button
              type="button"
              className="community-secondary-button"
              onClick={cancelCreate}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        </form>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <p className="small-label">
        YOUR COMMUNITIES
      </p>

      <div className="communities-heading-row">
        <div>
          <h2>
            Your corners.
          </h2>

          <p>
            The communities you
            belong to.
          </p>
        </div>

        <button
          type="button"
          className="community-primary-button"
          onClick={() => {
            setMessage("");
            setCreateError("");
            setShowCreateForm(true);
          }}
        >
          + Create community
        </button>
      </div>

      <MyInvitations />

      {message && (
        <p
          className="message"
          role="status"
        >
          {message}
        </p>
      )}

      {isLoading && (
        <p
          className="message"
          role="status"
        >
          Loading communities...
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
        !error &&
        groups.length === 0 && (
          <div className="dashboard-card">
            <h3>
              No communities yet.
            </h3>

            <p>
              Create a community or
              explore existing ones.
            </p>
          </div>
        )}

      {!isLoading &&
        !error &&
        groups.length > 0 && (
          <div className="my-communities-grid">
            {groups.map(
              (group) => (
                <article
                  className="my-community-card"
                  key={group.id}
                >
                  <div className="discover-community-mark">
                    {group.name
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <h3>
                    {group.name}
                  </h3>

                  <p>
                    {group.description ||
                      "No description yet."}
                  </p>

                  <p className="community-meta">
                    {
                      group._count
                        .members
                    }{" "}
                    {group._count
                      .members === 1
                      ? "member"
                      : "members"}

                    {" · "}

                    {
                      group.members[0]
                        ?.role
                    }
                  </p>

                  <button
                    type="button"
                    className="discover-view-button"
                    onClick={() =>
                      onOpenCommunity(
                        group.id
                      )
                    }
                  >
                    View community
                  </button>
                </article>
              )
            )}
          </div>
        )}
    </AppLayout>
  );
}

export default CommunitiesPage;