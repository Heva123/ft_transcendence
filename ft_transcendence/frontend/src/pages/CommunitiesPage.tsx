import { useEffect, useState, type FormEvent } from "react";

import CommunityDetailsPage from "./CommunityDetailsPage";
import AppLayout from "../components/AppLayout";
import Button from "../components/Button";
import Input from "../components/Input";

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
};

function CommunitiesPage({ token }: CommunitiesPageProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] =
  useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");
  const [message, setMessage] = useState("");

  // Load the user's communities when the page opens.
  useEffect(() => {
    const controller = new AbortController();

    async function loadCommunities() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:3000/api/groups",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        if (!response.ok) {
          throw new Error("Could not load communities.");
        }

        const data: Group[] = await response.json();

        if (!controller.signal.aborted) {
          setGroups(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadCommunities();

    return () => {
      controller.abort();
    };
  }, [token]);

  // Create a community using Heba's API.
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) return;

    setCreateError("");
    setMessage("");

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      setCreateError(
        "Community name must contain 2-100 characters."
      );
      return;
    }

    if (cleanDescription.length > 500) {
      setCreateError(
        "Description cannot exceed 500 characters."
      );
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/groups",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cleanName,
            description: cleanDescription,
          }),
        }
      );

      if (response.status === 401) {
        setCreateError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      if (response.status === 400) {
        setCreateError(
          "Please check the community name and description."
        );
        return;
      }

      if (!response.ok) {
        setCreateError(
          "Could not create the community. Please try again."
        );
        return;
      }

      const created: CreatedGroup = await response.json();

      // Convert the create response into the same format
      // used by our communities list.
      const newGroup: Group = {
        id: created.id,
        name: created.name,
        description: created.description,
        _count: {
          members: created.memberCount,
        },
        members: [
          {
            role: created.currentUserRole,
          },
        ],
      };

      // Add the new community immediately to the page.
      setGroups((currentGroups) => [
        newGroup,
        ...currentGroups,
      ]);

      setName("");
      setDescription("");
      setShowCreateForm(false);

      setMessage("Community created successfully!");
    } catch {
      setCreateError(
        "Cannot connect to the server. Please check that the backend is running."
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleCancel() {
    setShowCreateForm(false);
    setCreateError("");
    setName("");
    setDescription("");
  }
if (selectedGroupId) {
  return (
    <CommunityDetailsPage
      groupId={selectedGroupId}
      token={token}
      onBack={() => setSelectedGroupId(null)}
    />
  );
}
  return (
    <AppLayout>
      <p className="small-label">YOUR COMMUNITIES</p>

      <h2>Communities</h2>

      <button
        type="button"
        className="text-link"
        onClick={() => {
          setMessage("");
          setCreateError("");
          setShowCreateForm(true);
        }}
        disabled={showCreateForm}
      >
        + Create Community
      </button>

      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      {showCreateForm && (
        <div className="dashboard-card">
          <h3>Create a community</h3>

          <form onSubmit={handleCreate} noValidate>
            <Input
              id="community-name"
              label="Community name"
              type="text"
              placeholder="Web Builders"
              value={name}
              onChange={setName}
              required
            />

            <Input
              id="community-description"
              label="Description (optional)"
              type="text"
              placeholder="A space for web developers"
              value={description}
              onChange={setDescription}
            />

            {createError && (
              <p className="form-error" role="alert">
                {createError}
              </p>
            )}

            <Button
              text={
                isCreating
                  ? "Creating..."
                  : "Create Community"
              }
            />

            <button
              type="button"
              className="text-link"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {isLoading && (
        <p className="message" role="status">
          Loading communities...
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && groups.length === 0 && (
        <div className="dashboard-card">
          <h3>No communities yet.</h3>

          <p>
            You haven't joined or created any communities.
          </p>

          <p>
            Create your first community to get started!
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        groups.map((group) => (
          <div className="dashboard-card" key={group.id}>
            <h3>{group.name}</h3>

            <p>
              {group.description || "No description yet."}
            </p>

            <p>
              Members: {group._count.members}
            </p>

            <p>
              Your role: {group.members[0]?.role || "Unknown"}
            </p>
            <button
            type="button"
            className="text-link"
            onClick={() => setSelectedGroupId(group.id)}
            >
            View Community
            </button>
          </div>
        ))}
    </AppLayout>
  );
}

export default CommunitiesPage;