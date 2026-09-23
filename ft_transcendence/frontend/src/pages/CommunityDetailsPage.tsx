import { useEffect, useState } from "react";

import AppLayout from "../components/AppLayout";

type GroupDetails = {
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

type CommunityDetailsPageProps = {
  groupId: string;
  token: string;
  onBack: () => void;
};

function CommunityDetailsPage({
  groupId,
  token,
  onBack,
}: CommunityDetailsPageProps) {
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setIsLoading(true);
      setError("");
      setGroup(null);

      try {
        const response = await fetch(
          `http://localhost:3000/api/groups/${groupId}`,
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

        if (response.status === 403) {
          throw new Error(
            "You do not have access to this community."
          );
        }

        if (response.status === 404) {
          throw new Error("Community not found.");
        }

        if (!response.ok) {
          throw new Error("Could not load community details.");
        }

        const data: GroupDetails = await response.json();

        if (!controller.signal.aborted) {
          setGroup(data);
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

    loadDetails();

    return () => {
      controller.abort();
    };
  }, [groupId, token]);

  return (
    <AppLayout>
      <button
        type="button"
        className="text-link"
        onClick={onBack}
      >
        ← Back to Communities
      </button>

      <p className="small-label">COMMUNITY DETAILS</p>

      <h2>Community Details</h2>

      {isLoading && (
        <p className="message" role="status">
          Loading community...
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && group && (
        <div className="dashboard-card">
          <h3>{group.name}</h3>

          <p>
            {group.description || "No description yet."}
          </p>

          <h3>Members</h3>
          <p>{group._count.members}</p>

          <h3>Your role</h3>
          <p>{group.members[0]?.role || "Unknown"}</p>
        </div>
      )}
    </AppLayout>
  );
}

export default CommunityDetailsPage;