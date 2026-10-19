import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import AppLayout from "../components/AppLayout";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

type DiscoverGroup = {
  id: string;
  name: string;
  description: string | null;

  _count: {
    members: number;
  };
};

// Requests read the token through apiClient, so no props are needed.
function DiscoverCommunitiesPage() {
  const navigate = useNavigate();

  const [groups, setGroups] =
    useState<DiscoverGroup[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    selectedGroup,
    setSelectedGroup,
  ] =
    useState<DiscoverGroup | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [joiningId, setJoiningId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadCommunities() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await apiRequest<
            DiscoverGroup[]
          >(
            "/communities/discover"
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

  const filteredGroups =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return groups;
      }

      return groups.filter(
        (group) => {
          const name =
            group.name.toLowerCase();

          const description =
            group.description
              ?.toLowerCase() ||
            "";

          return (
            name.includes(query) ||
            description.includes(
              query
            )
          );
        }
      );
    }, [groups, search]);

  async function handleJoin(
    groupId: string
  ) {
    if (joiningId) {
      return;
    }

    setJoiningId(groupId);
    setError("");

    try {
      await apiRequest(
        `/communities/${groupId}/join`,
        {
          method: "POST",
        }
      );

      navigate(
        `/communities/${groupId}`
      );
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(
            "You are already a member of this community."
          );
        } else if (
          err.status === 403
        ) {
          setError(
            "This community cannot be joined directly."
          );
        } else {
          setError(err.message);
        }
      } else {
        setError(
          "Could not join community."
        );
      }
    } finally {
      setJoiningId(null);
    }
  }

  /*
    PREVIEW MODE

    We use the data already returned
    by /communities/discover because
    the current backend does not allow
    non-members to GET /communities/:id.
  */
  if (selectedGroup) {
    return (
      <AppLayout>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            setSelectedGroup(null);
            setError("");
          }}
        >
          ← Back to communities
        </button>

        <section className="community-preview-header">
          <div className="community-preview-title">
            <div className="community-preview-mark">
              {selectedGroup.name
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <h2>
                {selectedGroup.name}
              </h2>

              <p>
                {selectedGroup.description ||
                  "No description yet."}
              </p>

              <span>
                {
                  selectedGroup._count
                    .members
                }{" "}
                {selectedGroup._count
                  .members === 1
                  ? "member"
                  : "members"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="community-preview-join"
            disabled={
              joiningId ===
              selectedGroup.id
            }
            onClick={() =>
              handleJoin(
                selectedGroup.id
              )
            }
          >
            {joiningId ===
            selectedGroup.id
              ? "Joining..."
              : "Join community"}
          </button>
        </section>

        <div className="community-preview-tabs">
          <span>
            Community feed
          </span>

          <span>
            Channels
          </span>

          <span>
            Members
          </span>

          <span>
            Roles & permissions
          </span>
        </div>

        {error && (
          <p
            className="form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <section className="community-preview-locked">
          <h3>
            Join the conversation.
          </h3>

          <p>
            Become a member to read
            the community feed, post
            ideas and chat in
            channels.
          </p>

          <button
            type="button"
            className="community-preview-join secondary"
            disabled={
              joiningId ===
              selectedGroup.id
            }
            onClick={() =>
              handleJoin(
                selectedGroup.id
              )
            }
          >
            {joiningId ===
            selectedGroup.id
              ? "Joining..."
              : `Join ${selectedGroup.name}`}
          </button>
        </section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <p className="small-label">
        COMMUNITIES
      </p>

      <h2>
        Find your corner.
      </h2>

      <p className="discover-subtitle">
        A place for every curiosity.
        Find yours.
      </p>

      <div className="discover-toolbar">
        <input
          className="discover-search"
          type="search"
          placeholder="Search communities..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <Link
          to="/communities"
          className="discover-create"
        >
          + Create community
        </Link>
      </div>

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
        filteredGroups.length >
          0 && (
          <div className="discover-grid">
            {filteredGroups.map(
              (group) => (
                <article
                  className="discover-card"
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

                  <p className="discover-member-count">
                    {
                      group._count
                        .members
                    }{" "}
                    {group._count
                      .members === 1
                      ? "member"
                      : "members"}
                  </p>

                  <p className="discover-description">
                    {group.description ||
                      "No description yet."}
                  </p>

                  <button
                    type="button"
                    className="discover-view-button"
                    onClick={() => {
                      setSelectedGroup(
                        group
                      );

                      setError("");
                    }}
                  >
                    View community
                  </button>
                </article>
              )
            )}
          </div>
        )}

      {!isLoading &&
        !error &&
        filteredGroups.length ===
          0 && (
          <div className="dashboard-card">
            <h3>
              No communities found.
            </h3>

            <p>
              {search
                ? "Try another search."
                : "There are no public communities available to join right now."}
            </p>
          </div>
        )}
    </AppLayout>
  );
}

export default DiscoverCommunitiesPage;