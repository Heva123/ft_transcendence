import { apiRequest } from '../../../api/apiClient'
import type { PublicUser } from '../../profile/api/profileApi'

export type Friend = { id: string; since: string; user: PublicUser }
export type FriendRequest = { id: string; createdAt: string; user: PublicUser }
export type FriendRequests = { incoming: FriendRequest[]; outgoing: FriendRequest[] }

export function getFriends() {
  return apiRequest<Friend[]>('/friends')
}

export function getFriendRequests() {
  return apiRequest<FriendRequests>('/friends/requests')
}

/** If they already asked you, this accepts their request. */
export function sendFriendRequest(userId: string) {
  return apiRequest<{ id: string; status: 'PENDING' | 'ACCEPTED' }>('/friends/requests', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  })
}

export function acceptFriendRequest(requestId: string) {
  return apiRequest(`/friends/requests/${requestId}/accept`, { method: 'POST' })
}

/** Decline an incoming request or cancel your own. */
export function removeFriendRequest(requestId: string) {
  return apiRequest(`/friends/requests/${requestId}`, { method: 'DELETE' })
}

export function removeFriend(userId: string) {
  return apiRequest(`/friends/${userId}`, { method: 'DELETE' })
}
