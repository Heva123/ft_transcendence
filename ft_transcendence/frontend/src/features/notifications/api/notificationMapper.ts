import type { ApiNotification } from './notificationApi'
import type { Notification } from '../types/Notification'

const ROUTES: Record<string, (id: string) => string> = {
  POST: (id) => `/posts/${id}`,
  COMMENT: (id) => `/posts/${id}`,
  COMMUNITY: (id) => `/communities/${id}`,
  CHANNEL: (id) => `/channels/${id}`,
  USER: (id) => `/profile/${id}`,
}

function toTarget(item: ApiNotification) {
  const direct = item.link ?? item.url
  if (direct)
    return direct.startsWith('/') ? direct : null
  const route = item.entityType ? ROUTES[item.entityType.toUpperCase()] : undefined
  return route && item.entityId ? route(item.entityId) : null
}

export function toNotification(item: ApiNotification): Notification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    read: item.isRead,
    createdAt: new Date(item.createdAt).toLocaleString(),
    targetUrl: toTarget(item),
  }
}
