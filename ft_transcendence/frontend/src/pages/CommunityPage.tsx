import {
  useEffect,
  useState,
} from "react";

import ConfirmDialog from "../components/ConfirmDialog";
import { useCanWrite } from "../features/auth/hooks/useCanWrite";

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
  createChannel,
  getChannels,
  getCommunity,
} from "../features/chat/api/chatApi";

import { canCreateChannel } from "../features/chat/utils/channelRoles";
import { canModerate } from "../features/reports/api/reportsApi";

import ChannelFormModal from "../features/chat/components/ChannelFormModal";

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
  const canWrite = useCanWrite();

  const canManage =
    data.role === "OWNER" ||
    data.role === "ADMIN";

  const canLeave =
    data.role !== "OWNER";

  const firstChannel =
    data.channels[0];

  const canCreate =
    canCreateChannel(data.role);

  const navigate =
    useNavigate();

  const [
    showCreate,
    setShowCreate,
  ] = useState(false);

  async function handleCreate(values: {
    name: string;
    description: string;
  }) {
    const channel =
      await createChannel(
        data.community.id,
        {
          name: values.name,
          description:
            values.description ||
            undefined,
        }
      );

    setShowCreate(false);
    navigate(`/channels/${channel.id}`);
  }

  // With no channels yet, the tab opens the form or points to the panel.
  function handleEmptyChannelsTab() {
    if (canCreate) {
      setShowCreate(true);
      return;
    }

    const panel =
      document.getElementById(
        "community-channels"
      );

    panel?.scrollIntoView({
      behavior: "smooth",
    });
    panel?.focus();
  }

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
          <button
            type="button"
            className="community-tab-link"
            onClick={
              handleEmptyChannelsTab
            }
          >
            Channels
          </button>
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

        {/* Owners, admins and moderators review reports here. */}
        {canModerate(data.role) && (
          <Link
            className="community-tab-link"
            to={`/communities/${data.community.id}/reports`}
          >
            Reports
          </Link>
        )}
      </nav>

      <div className="community-layout">
        <main className="community-feed">
          {canWrite && (
            <Link
              className="community-post-button"
              to={`/posts/new?community=${data.community.id}`}
            >
              + Post to{" "}
              {data.community.name}
            </Link>
          )}

          {/* Paged feed, so posts after the first 10 also show. */}
          <Feed
            mode={`community:${data.community.id}`}
            emptyText="Your community is ready. Share the first idea."
          />
        </main>

        <aside
          className="conversations-panel"
          id="community-channels"
          tabIndex={-1}
          aria-labelledby="community-channels-title"
        >
          <h2 id="community-channels-title">
            Conversations
          </h2>

          {data.channels.length ===
            0 && (
            <p className="conversations-empty">
              {canCreate
                ? "No channels yet. Create the first one so members can start talking."
                : "No channels yet. An owner, admin or moderator of this community can add one."}
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

          {canCreate && (
            <button
              type="button"
              className="new-channel"
              onClick={() =>
                setShowCreate(true)
              }
            >
              + New channel
            </button>
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

      {showCreate && (
        <ChannelFormModal
          title="Create channel"
          intro={`Add a new channel to ${data.community.name}. Every member can read and post in it.`}
          submitLabel="Create channel"
          onCancel={() =>
            setShowCreate(false)
          }
          onSubmit={handleCreate}
        />
      )}
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