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

type Channel = {
  id: string;
  name: string;
  description: string | null;
  type: string;
};

type CommunityDetailsPageProps = {
  groupId: string;
  token: string;
  onBack: () => void;
  onOpenMembers: (groupId: string) => void;
  onLeave: (groupId: string) => void;
};

function CommunityDetailsPage({
  groupId,
  token,
  onBack,
  onOpenMembers,
  onLeave,
}: CommunityDetailsPageProps) {
  const [group, setGroup] =
    useState<GroupDetails | null>(null);

  const [channels, setChannels] =
    useState<Channel[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLeaving, setIsLeaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setIsLoading(true);
      setError("");
      setGroup(null);

      try {
        const detailsResponse = await fetch(
          `http://localhost:3000/api/communities/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (detailsResponse.status === 401) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        if (detailsResponse.status === 403) {
          throw new Error(
            "You do not have access to this community."
          );
        }

        if (detailsResponse.status === 404) {
          throw new Error(
            "Community not found."
          );
        }

        if (!detailsResponse.ok) {
          throw new Error(
            "Could not load community details."
          );
        }

        const detailsData: GroupDetails =
          await detailsResponse.json();

        const channelsResponse = await fetch(
          `http://localhost:3000/api/communities/${groupId}/channels`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!channelsResponse.ok) {
          throw new Error(
            "Could not load community channels."
          );
        }

        const channelsData: Channel[] =
          await channelsResponse.json();

        if (!controller.signal.aborted) {
          setGroup(detailsData);
          setChannels(channelsData);
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

  async function handleLeave() {
    setIsLeaving(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/communities/${groupId}/leave`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403) {
        setError(
          "The community owner cannot leave the community."
        );
        return;
      }

      if (response.status === 404) {
        setError(
          "Community membership not found."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Could not leave community."
        );
      }

      onLeave(groupId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <AppLayout>
      <button
        type="button"
        className="text-link"
        onClick={onBack}
      >
        ← Back to Communities
      </button>

      <p className="small-label">
        COMMUNITY DETAILS
      </p>

      {isLoading && (
        <p
          className="message"
          role="status"
        >
          Loading community...
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

      {!isLoading && !error && group && (
        <>
          <div className="dashboard-card">
            <h2>{group.name}</h2>

            <p>
              {group.description ||
                "No description yet."}
            </p>

            <h3>Members</h3>

            <p>
              👥 {group._count.members}
            </p>

            <h3>Your role</h3>

            <p>
              {group.members[0]?.role ||
                "Unknown"}
            </p>

            <div className="community-actions">
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  onOpenMembers(group.id)
                }
              >
                Members
              </button>

              <button
                type="button"
                className="text-link"
              >
                Settings
              </button>

              {group.members[0]?.role !==
                "OWNER" && (
                <button
                  type="button"
                  className="text-link"
                  onClick={handleLeave}
                  disabled={isLeaving}
                >
                  {isLeaving
                    ? "Leaving..."
                    : "Leave Community"}
                </button>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h3>Channels</h3>

            {channels.length === 0 && (
              <p>
                No channels yet.
              </p>
            )}

            {channels.map((channel) => (
              <div key={channel.id}>
                <p>
                  # {channel.name}
                </p>

                {channel.description && (
                  <p>
                    {channel.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default CommunityDetailsPage;