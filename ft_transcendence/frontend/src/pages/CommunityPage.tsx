import {
  useEffect,
  useState,
} from "react";

import ConfirmDialog from "../components/ConfirmDialog";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  apiRequest,
  ApiError,
} from "../api/apiClient";

import {
  getChannels,
  getCommunity,
} from "../features/chat/api/chatApi";

import { toCommunity } from "../features/chat/api/communityMapper";

import CommunityHeader from "../features/chat/components/CommunityHeader";


import type { Channel } from "../features/chat/types/Channel";
import type { Community } from "../features/chat/types/Community";

import Feed from "../features/feed/components/Feed";

import "./CommunityPage.css";

type Data = {
  community: Community;
  channels: Channel[];
  role: string;
};

async function loadData(
  id: string
): Promise<Data> {
  const [
    community,
    channels,
  ] = await Promise.all([
    getCommunity(id),
    getChannels(id),
  ]);

  return {
    community:
      toCommunity(community),

    channels,

    role:
      community.members?.[0]
        ?.role || "MEMBER",
  };
}

type CommunityViewProps = {
  data: Data;
  isLeaving: boolean;
  onLeave: () => void;
};

function CommunityView({
  data,
  isLeaving,
  onLeave,
}: CommunityViewProps) {
  const canManage =
    data.role === "OWNER" ||
    data.role === "ADMIN";

  const canLeave =
    data.role !== "OWNER";

  const firstChannel =
    data.channels[0];

  return (
    <section className="community-page">
      <div className="community-header-actions">
        <CommunityHeader
          community={
            data.community
          }
        />

        {canManage && (
          <Link
            className="community-manage-button"
            to={`/communities/${data.community.id}/details`}
          >
            Manage community
          </Link>
        )}
      </div>

      <nav className="community-tabs">
        <span className="community-tab-link active">
          Community feed
        </span>

        {firstChannel ? (
          <Link
            className="community-tab-link"
            to={`/channels/${firstChannel.id}`}
          >
            Channels
          </Link>
        ) : (
          <span className="community-tab-link">
            Channels
          </span>
        )}

        <Link
          className="community-tab-link"
          to={`/communities/${data.community.id}/members`}
        >
          Members
        </Link>

        <Link
          className="community-tab-link"
          to={`/communities/${data.community.id}/roles`}
        >
          Roles & permissions
        </Link>
      </nav>

      <div className="community-layout">
        <main className="community-feed">
          <Link
            className="community-post-button"
            to={`/posts/new?community=${data.community.id}`}
          >
            + Post to{" "}
            {data.community.name}
          </Link>

          {/* Paged feed, so posts after the first 10 also show. */}
          <Feed
            mode={`community:${data.community.id}`}
            emptyText="Your community is ready. Share the first idea."
          />
        </main>

        <aside className="conversations-panel">
          <h2>
            Conversations
          </h2>

          {data.channels.length ===
            0 && (
            <p>
              No channels yet.
            </p>
          )}

          {data.channels.map(
            (channel) => (
              <Link
                key={channel.id}
                to={`/channels/${channel.id}`}
              >
                # {channel.name}
              </Link>
            )
          )}

          {canLeave && (
            <button
              type="button"
              className="leave-community"
              onClick={onLeave}
              disabled={isLeaving}
            >
              {isLeaving
                ? "Leaving..."
                : "Leave community"}
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

function CommunityPage() {
  const {
    communityId = "",
  } = useParams();

  const navigate =
    useNavigate();

  // Results are stored with the id they belong to, so a new id shows "Loading".
  const [loaded, setLoaded] =
    useState<{
      id: string;
      data: Data | null;
    }>({ id: "", data: null });

  const [error, setError] =
    useState({ id: "", message: "" });

  const [
    isLeaving,
    setIsLeaving,
  ] = useState(false);

  const [
    confirmLeave,
    setConfirmLeave,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    loadData(communityId)
      .then((result) => {
        if (active)
          setLoaded({ id: communityId, data: result });
      })
      .catch((err) => {
        if (!active)
          return;
        setLoaded({ id: communityId, data: null });
        setError({
          id: communityId,
          message:
            err instanceof ApiError
              ? err.message
              : "Unable to load community.",
        });
      });

    return () => {
      active = false;
    };
  }, [communityId]);

  const data =
    loaded.id === communityId
      ? loaded.data
      : null;

  function setLeaveError(message: string) {
    setError({ id: communityId, message });
  }

  async function handleLeave() {
    if (
      !data ||
      isLeaving
    ) {
      return;
    }

    setIsLeaving(true);
    setLeaveError("");

    try {
      await apiRequest(
        `/communities/${communityId}/leave`,
        {
          method: "DELETE",
        }
      );

      navigate(
        "/communities"
      );
    } catch (err) {
      setConfirmLeave(false);

      if (err instanceof ApiError) {
        setLeaveError(err.message);
      } else {
        setLeaveError(
          "Could not leave community."
        );
      }
    } finally {
      setIsLeaving(false);
    }
  }

  if (error.id === communityId && error.message) {
    return (
      <div>
        <p
          className="form-error"
          role="alert"
        >
          {error.message}
        </p>

        <Link to="/communities">
          Back to communities
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <p>
        Loading community...
      </p>
    );
  }

  return (
    <>
      <CommunityView
        data={data}
        isLeaving={isLeaving}
        onLeave={() => setConfirmLeave(true)}
      />

      {confirmLeave && (
        <ConfirmDialog
          title={`Leave ${data.community.name}?`}
          message="You will lose access to member conversations. Owners must transfer ownership or delete the community first."
          confirmLabel="Leave community"
          busy={isLeaving}
          onCancel={() => setConfirmLeave(false)}
          onConfirm={handleLeave}
        />
      )}
    </>
  );
}

export default CommunityPage;