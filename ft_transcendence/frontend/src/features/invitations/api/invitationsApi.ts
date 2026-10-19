import { apiRequest } from '../../../api/apiClient'

export type InviteRole = 'ADMIN' | 'MODERATOR' | 'MEMBER'

export type Invitation = {
  id: string
  role: InviteRole
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
  community: { id: string; name: string; description: string | null; isPublic: boolean }
  inviter: { id: string; username: string }
  invitee: { id: string; username: string }
}

export function inviteMember(communityId: string, username: string, role: InviteRole) {
  return apiRequest<Invitation>(`/communities/${communityId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ username, role }),
  })
}

export function getCommunityInvitations(communityId: string) {
  return apiRequest<Invitation[]>(`/communities/${communityId}/invitations`)
}

export function revokeInvitation(communityId: string, invitationId: string) {
  return apiRequest(`/communities/${communityId}/invitations/${invitationId}`, { method: 'DELETE' })
}

export function getMyInvitations() {
  return apiRequest<Invitation[]>('/invitations')
}

export function acceptInvitation(invitationId: string) {
  return apiRequest<{ community: { id: string } }>(`/invitations/${invitationId}/accept`, { method: 'POST' })
}

export function declineInvitation(invitationId: string) {
  return apiRequest(`/invitations/${invitationId}/decline`, { method: 'POST' })
}
