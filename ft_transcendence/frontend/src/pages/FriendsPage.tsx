import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
  removeFriendRequest,
  type Friend,
  type FriendRequests,
} from "../features/friends/api/friendsApi";
import PersonRow from "../features/friends/components/PersonRow";
import { displayNameOf } from "../features/profile/api/profileApi";
import { usePresence } from "../features/presence/hooks/usePresence";
import { onNewNotification } from "../features/notifications/api/notificationSocket";

type State = {
  loaded: boolean;
  friends: Friend[];
  requests: FriendRequests;
  error: string;
};

// Friends list, incoming and sent requests (design p61, p67, p68).
function FriendsPage() {
  const [state, setState] = useState<State>({
    loaded: false,
    friends: [],
    requests: { incoming: [], outgoing: [] },
    error: "",
  });
  const [busyId, setBusyId] = useState("");
  const [toRemove, setToRemove] = useState<Friend | null>(null);
  const online = new Set(usePresence().map((user) => user.userId));

  const load = useCallback(() => {
    Promise.all([getFriends(), getFriendRequests()])
      .then(([friends, requests]) =>
        setState({ loaded: true, friends, requests, error: "" }))
      .catch(() =>
        setState((current) => ({ ...current, loaded: true, error: "Could not load your friends." })));
  }, []);

  useEffect(() => {
    load();
    // A new request or an accepted one arrives as a notification.
    return onNewNotification((item) => {
      if (item.type.startsWith("FRIEND_"))
        load();
    });
  }, [load]);

  async function run(id: string, action: () => Promise<unknown>, failure: string) {
    setBusyId(id);
    try {
      await action();
      load();
    } catch {
      setState((current) => ({ ...current, error: failure }));
    } finally {
      setBusyId("");
    }
  }

  const { friends, requests } = state;

  return (
    <AppLayout>
      <p className="small-label">FRIENDS</p>
      <h2>Your circle.</h2>
      <p className="friends-subtitle">A familiar face makes every project better.</p>

      {state.error && <p className="form-error" role="alert">{state.error}</p>}

      {requests.incoming.length > 0 && (
        <>
          <h3 className="people-section-title">Requests for you</h3>
          <div className="people-list">
            {requests.incoming.map((request) => (
              <PersonRow key={request.id} user={request.user} note="Wants to join your circle">
                <button type="button" className="people-button primary" disabled={busyId === request.id}
                  onClick={() => run(request.id, () => acceptFriendRequest(request.id), "Could not accept the request.")}>
                  Accept
                </button>
                <button type="button" className="people-button" disabled={busyId === request.id}
                  onClick={() => run(request.id, () => removeFriendRequest(request.id), "Could not decline the request.")}>
                  Decline
                </button>
              </PersonRow>
            ))}
          </div>
        </>
      )}

      <h3 className="people-section-title">Friends · {friends.length}</h3>
      <div className="people-list">
        {!state.loaded && <p className="people-empty">Loading your circle…</p>}
        {state.loaded && friends.length === 0 && (
          <p className="people-empty">No friends yet. Find people by name or skill and add them.</p>
        )}
        {friends.map((friend) => (
          <PersonRow key={friend.id} user={friend.user} online={online.has(friend.user.id)}>
            <button type="button" className="people-button danger"
              onClick={() => setToRemove(friend)}>Remove</button>
          </PersonRow>
        ))}
      </div>

      {requests.outgoing.length > 0 && (
        <>
          <h3 className="people-section-title">Sent requests</h3>
          <div className="people-list">
            {requests.outgoing.map((request) => (
              <PersonRow key={request.id} user={request.user} note="Request sent">
                <button type="button" className="people-button" disabled={busyId === request.id}
                  onClick={() => run(request.id, () => removeFriendRequest(request.id), "Could not cancel the request.")}>
                  Cancel request
                </button>
              </PersonRow>
            ))}
          </div>
        </>
      )}

      <Link to="/search?tab=people" className="community-primary-button">Find more people</Link>

      {toRemove && (
        <ConfirmDialog
          title={`Remove ${displayNameOf(toRemove.user)} from friends?`}
          message={`${displayNameOf(toRemove.user)} will be removed from your friends list. You can add them again later.`}
          confirmLabel="Remove friend"
          busy={busyId === toRemove.id}
          onCancel={() => setToRemove(null)}
          onConfirm={() => {
            const friend = toRemove;
            setToRemove(null);
            run(friend.id, () => removeFriend(friend.user.id), "Could not remove this friend.");
          }}
        />
      )}
    </AppLayout>
  );
}

export default FriendsPage;
