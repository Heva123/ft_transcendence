import {
  useEffect,
  useState,
} from "react";

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

import { getCommunityFeed } from "../features/feed/api/feedApi";

import PostCard from "../features/feed/components/PostCard";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";

import type { Post } from "../features/feed/types/Post";

import "./CommunityPage.css";

type Data = {
  community: Community;
  channels: Channel[];
  posts: Post[];
  role: string;
};

async function loadData(
  id: string
): Promise<Data> {
  const [
    community,
    channels,
    feed,
  ] = await Promise.all([
    getCommunity(id),
    getChannels(id),
    getCommunityFeed(id),
  ]);

  return {
    community:
      toCommunity(community),

    channels,

    posts: feed.posts,

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
  const user = useCurrentUser();
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

          {data.posts.length ? (
            data.posts.map(
              (post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                />
              )
            )
          ) : (
            <p>
              Your community is
              ready. Share the first
              idea.
            </p>
          )}
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

  const [data, setData] =
    useState<Data | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [
    isLeaving,
    setIsLeaving,
  ] = useState(false);

  useEffect(() => {
    setError("");
    setData(null);

    loadData(communityId)
      .then(setData)
      .catch((err) => {
        if (
          err instanceof ApiError
        ) {
          setError(err.message);
        } else {
          setError(
            "Unable to load community."
          );
        }
      });
  }, [communityId]);

  async function handleLeave() {
    if (
      !data ||
      isLeaving
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Leave ${data.community.name}?\n\nYou will lose access to member conversations.`
      );

    if (!confirmed) {
      return;
    }

    setIsLeaving(true);
    setError("");

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
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Could not leave community."
        );
      }
    } finally {
      setIsLeaving(false);
    }
  }

  if (error) {
    return (
      <div>
        <p
          className="form-error"
          role="alert"
        >
          {error}
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
    <CommunityView
      data={data}
      isLeaving={isLeaving}
      onLeave={handleLeave}
    />
  );
}

export default CommunityPage;