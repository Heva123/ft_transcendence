import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import UserAvatar from "../components/UserAvatar";
import { ApiError } from "../api/apiClient";
import {
  acceptFriendRequest,
  removeFriend,
  removeFriendRequest,
  sendFriendRequest,
} from "../features/friends/api/friendsApi";
import "../features/friends/components/Friends.css";
import {
  displayNameOf,
  getPublicProfile,
  type PublicProfile,
} from "../features/profile/api/profileApi";
import { usePresence } from "../features/presence/hooks/usePresence";

type State = {
  username: string;
  profile: PublicProfile | null;
  error: string;
};

// Another member's profile with friend actions (design p63, p64).
function PublicProfilePage() {
  const { username = "" } = useParams();
  const [state, setState] = useState<State>({ username: "", profile: null, error: "" });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const online = usePresence();

  useEffect(() => {
    let active = true;

    getPublicProfile(username)
      .then((profile) => {
        if (active) setState({ username, profile, error: "" });
      })
      .catch((err) => {
        if (active)
          setState({
            username,
            profile: null,
            error: err instanceof ApiError && err.status === 404
              ? "This member does not exist."
              : "Could not load this profile.",
          });
      });
    return () => {
      active = false;
    };
  }, [username]);

  async function act(action: () => Promise<unknown>) {
    setBusy(true);
    setActionError("");
    try {
      await action();
      setState({ username, profile: await getPublicProfile(username), error: "" });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (state.username !== username)
    return <AppLayout><p className="message" role="status">Loading profile...</p></AppLayout>;

  const person = state.profile;
  if (!person)
    return (
      <AppLayout>
        <h2>Profile not found.</h2>
        <p className="form-error">{state.error}</p>
        <Link className="text-link" to="/search">Find people</Link>
      </AppLayout>
    );

  const name = displayNameOf(person);
  const isOnline = online.some((user) => user.userId === person.id);
  const { status, requestId } = person.friendship;
  const canAct = !person.blockedByMe && !person.blocksMe;

  function friendButton() {
    if (!canAct || status === "self") return null;
    if (status === "friends")
      return (
        <button type="button" className="profile-edit-button" disabled={busy}
          onClick={() => setConfirmRemove(true)}>Friends ✓</button>
      );
    if (status === "outgoing" && requestId)
      return (
        <button type="button" className="profile-edit-button" disabled={busy}
          onClick={() => act(() => removeFriendRequest(requestId))}>Request sent · Cancel</button>
      );
    if (status === "incoming" && requestId)
      return (
        <button type="button" className="profile-edit-button" disabled={busy}
          onClick={() => act(() => acceptFriendRequest(requestId))}>Accept friend request</button>
      );
    return (
      <button type="button" className="profile-edit-button" disabled={busy}
        onClick={() => act(() => sendFriendRequest(person!.id))}>Add friend</button>
    );
  }

  return (
    <AppLayout>
      <section className="profile-hero">
        <div className="profile-avatar">
          <UserAvatar
            username={person.username}
            avatarUrl={person.avatarUrl}
            alt={`${person.username}'s avatar`}
          />
        </div>

        <div className="profile-identity">
          <p className="small-label">42 ABU DHABI</p>
          <h3>
            {name}
            {status === "friends" && " · now in your circle"}
          </h3>
          <p>@{person.username} · {isOnline ? "Online" : "Offline"}</p>
          {person.bio && <p className="profile-bio">{person.bio}</p>}
        </div>

        {status === "self"
          ? <Link className="profile-edit-button" to="/profile">Edit profile</Link>
          : friendButton()}
      </section>

      {actionError && <p className="form-error" role="alert">{actionError}</p>}
      {person.blockedByMe && (
        <p className="message" role="status">
          You blocked this member. Unblock them in <Link to="/settings">Settings</Link> to add them as a friend.
        </p>
      )}

      <div className="profile-grid">
        <section className="profile-card">
          <h3>Things I work with</h3>
          {person.skills.length
            ? <div className="skill-list">{person.skills.map((skill) => <span key={skill} className="skill-tag">{skill}</span>)}</div>
            : <p className="settings-muted">No skills listed yet.</p>}
        </section>

        <section className="profile-card">
          <h3>{status === "self" ? "My corners" : "Their corners"}</h3>
          {person.communities.length
            ? <div className="corner-list">{person.communities.map((community) => (
              <Link key={community.id} className="people-button" to={`/communities/${community.id}`}>{community.name}</Link>
            ))}</div>
            : <p className="settings-muted">Not in any community you can see.</p>}
        </section>
      </div>

      {confirmRemove && (
        <ConfirmDialog
          title={`Remove ${name} from friends?`}
          message={`${name} will be removed from your friends list. You can add them again later.`}
          confirmLabel="Remove friend"
          busy={busy}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={() => {
            setConfirmRemove(false);
            act(() => removeFriend(person.id));
          }}
        />
      )}
    </AppLayout>
  );
}

export default PublicProfilePage;
