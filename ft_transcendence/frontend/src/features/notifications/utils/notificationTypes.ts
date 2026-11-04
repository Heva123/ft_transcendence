






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
