import { apiRequest } from '../../../api/apiClient'

export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED'

type Person = { id: string, username: string }

export type CommunityReport = {
  id: string
  targetType: 'POST' | 'COMMENT'
  reason: string
  status: ReportStatus
  createdAt: string
  reviewedAt: string | null
  reporter: Person
  reviewedBy: Person | null
  post: { id: string, content: string, author: Person } | null
  comment: { id: string, postId: string, content: string, author: Person } | null
}

// Owners, admins and moderators only. The server checks the member role.
export function getReports(communityId: string) {
  return apiRequest<CommunityReport[]>(`/communities/${communityId}/reports`)
}

export function reviewReport(
  communityId: string,
  reportId: string,
  status: Exclude<ReportStatus, 'OPEN'>,
  removeContent = false,
) {
  return apiRequest<CommunityReport>(`/communities/${communityId}/reports/${reportId}`, {
    method: 'PATCH',
    body: JSON.stringify(removeContent ? { status, removeContent } : { status }),
  })
}

export const canModerate = (role: string) =>
  role === 'OWNER' || role === 'ADMIN' || role === 'MODERATOR'
