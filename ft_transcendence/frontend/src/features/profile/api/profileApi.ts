import { apiRequest } from '../../../api/apiClient'

export type FriendshipStatus = 'self' | 'none' | 'friends' | 'outgoing' | 'incoming'

/** Public fields of a member, as returned by GET /users/:username. */
export type PublicUser = {
  id: string
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  lastSeenAt: string | null
  createdAt: string
  skills: string[]
}

export type PublicProfile = PublicUser & {
  friendship: { status: FriendshipStatus; requestId: string | null }
  blockedByMe: boolean
  blocksMe: boolean
  communities: { id: string; name: string }[]
}

export function getPublicProfile(username: string) {
  return apiRequest<PublicProfile>(`/users/${encodeURIComponent(username)}`)
}

export const MAX_SKILLS = 10
export const MAX_BIO = 300

export function displayNameOf(user: { displayName?: string | null; username: string }) {
  return user.displayName?.trim() || user.username
}
