/*
  How the UI shows each notification type.
  The backend sends `type` strings such as POST_CREATED or FRIEND_REQUEST.
  Types are grouped by their first word, so a new type from the backend
  (for example CHANNEL_DELETED) gets the right label without a code change.
  The full list agreed with the backend is in the README / handover note.
*/
export type NotificationCategory = {
  label: string
  className: string
}

const CATEGORIES: Record<string, NotificationCategory> = {
  POST: { label: 'POST', className: 'post' },
  COMMENT: { label: 'REPLY', className: 'post' },
  REPLY: { label: 'REPLY', className: 'post' },
  LIKE: { label: 'LIKE', className: 'like' },
  FRIEND: { label: 'FRIEND', className: 'friend' },
  COMMUNITY: { label: 'COMMUNITY', className: 'community' },
  INVITE: { label: 'INVITE', className: 'community' },
  MEMBER: { label: 'MEMBER', className: 'community' },
  ROLE: { label: 'ROLE', className: 'community' },
  CHANNEL: { label: 'CHANNEL', className: 'channel' },
  MESSAGE: { label: 'CHAT', className: 'channel' },
  REPORT: { label: 'REPORT', className: 'report' },
  PROFILE: { label: 'PROFILE', className: 'friend' },
}

const GENERAL: NotificationCategory = { label: '42', className: 'general' }

export function categoryOf(type: string): NotificationCategory {
  const upper = type.toUpperCase()
  if (upper.endsWith('_LIKED'))
    return CATEGORIES.LIKE
  return CATEGORIES[upper.split('_')[0]] ?? GENERAL
}
