import { useEffect, useState } from "react";

import AppLayout from "../components/AppLayout";
import RolesPermissionsPage from "./RolesPermissionsPage";

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

  const [showRoles, setShowRoles] =
    useState(false);

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

  if (showRoles) {
    return (
      <RolesPermissionsPage
        token={token}
        onBack={() =>
          setShowRoles(false)
        }
      />
    );
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

      {!isLoading &&
        !error &&
        group && (
          <>
            <section className="community-hero">
              <div>
                <p className="small-label">
                  COMMUNITY
                </p>

                <h2>{group.name}</h2>

                <p>
                  {group.description ||
                    "No description yet."}
                </p>

                <p className="community-meta">
                  {group._count.members} members
                  {" · "}
                  Your role:{" "}
                  {group.members[0]?.role ||
                    "Unknown"}
                </p>
              </div>
            </section>

            <div className="community-tabs">
              <button
                type="button"
                className="community-tab"
              >
                Community
              </button>

              <button
                type="button"
                className="community-tab"
              >
                Channels
              </button>

              <button
                type="button"
                className="community-tab"
                onClick={() =>
                  onOpenMembers(group.id)
                }
              >
                Members
              </button>

              <button
                type="button"
                className="community-tab"
                onClick={() =>
                  setShowRoles(true)
                }
              >
                Roles & permissions
              </button>
            </div>

            <div className="community-content-grid">
              <div className="community-main-card">
                <h3>
                  Community space
                </h3>

                <p>
                  Welcome to {group.name}.
                </p>

                <p>
                  Share ideas, ask questions and
                  build together.
                </p>
              </div>

              <aside className="community-channels-card">
                <h3>Channels</h3>

                {channels.length === 0 && (
                  <p>No channels yet.</p>
                )}

                {channels.map(
                  (channel) => (
                    <div
                      className="channel-row"
                      key={channel.id}
                    >
                      <strong>
                        # {channel.name}
                      </strong>

                      {channel.description && (
                        <p>
                          {channel.description}
                        </p>
                      )}
                    </div>
                  )
                )}

                {group.members[0]?.role !==
                  "OWNER" && (
                  <button
                    type="button"
                    className="community-leave"
                    onClick={handleLeave}
                    disabled={isLeaving}
                  >
                    {isLeaving
                      ? "Leaving..."
                      : "Leave community"}
                  </button>
                )}
              </aside>
            </div>
          </>
        )}
    </AppLayout>
  );
}

export default CommunityDetailsPage;