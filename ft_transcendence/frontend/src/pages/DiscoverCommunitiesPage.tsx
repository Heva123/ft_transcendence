import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";

type DiscoverGroup = {
  id: string;
  name: string;
  description: string | null;
  _count: {
    members: number;
  };
};

type DiscoverCommunitiesPageProps = {
  token: string;
};

function DiscoverCommunitiesPage({
  token,
}: DiscoverCommunitiesPageProps) {
  const [groups, setGroups] = useState<DiscoverGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadDiscoverCommunities() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:3000/api/communities/discover",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load discover communities."
          );
        }

        const data: DiscoverGroup[] =
          await response.json();

        setGroups(data);
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

    loadDiscoverCommunities();
  }, [token]);

  async function handleJoin(groupId: string) {
    setJoiningId(groupId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/communities/${groupId}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 409) {
        setError(
          "You are already a member of this community."
        );
        return;
      }

      if (response.status === 403) {
        setError(
          "You cannot join this community."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Could not join community."
        );
      }

      setGroups((currentGroups) =>
        currentGroups.filter(
          (group) => group.id !== groupId
        )
      );

      setMessage(
        "Community joined successfully!"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setJoiningId(null);
    }
  }

  const filteredGroups = groups.filter((group) => {
    const searchValue = search.toLowerCase();

    return (
      group.name
        .toLowerCase()
        .includes(searchValue) ||
      group.description
        ?.toLowerCase()
        .includes(searchValue)
    );
  });

  return (
    <AppLayout>
      <p className="small-label">
        COMMUNITIES
      </p>

      <h2>Find your corner.</h2>

      <p className="discover-subtitle">
        A place for every curiosity. Find yours.
      </p>

      <div className="discover-toolbar">
        <input
          className="discover-search"
          type="search"
          placeholder="Search communities..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
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
        <p className="message">
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
        filteredGroups.map((group) => (
          <div
            className="discover-card"
            key={group.id}
          >
            <h3>{group.name}</h3>

            <p>
              {group.description ||
                "No description yet."}
            </p>

            <p>
              Members: {group._count.members}
            </p>

            <button
              type="button"
              className="text-link"
              onClick={() =>
                handleJoin(group.id)
              }
              disabled={
                joiningId === group.id
              }
            >
              {joiningId === group.id
                ? "Joining..."
                : "Join Community"}
            </button>
          </div>
        ))}

      {!isLoading &&
        !error &&
        filteredGroups.length === 0 && (
          <div className="dashboard-card">
            <p>
              No communities found.
            </p>
          </div>
        )}
    </AppLayout>
  );
}

export default DiscoverCommunitiesPage;