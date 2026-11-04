import { apiRequest } from '../../../api/apiClient'

export type ApiNotification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string




  link?: string | null
  url?: string | null
  entityType?: string | null
  entityId?: string | null
}

type Response = {
  items: ApiNotification[]
  unreadCount: number
}

export function getNotifications() {
  return apiRequest<Response>('/notifications')
}

export function readNotification(id: string) {
  return apiRequest<ApiNotification>(
    `/notifications/${id}/read`,
    { method: 'PATCH' },
  )
}

// Lets the top bar badge refresh after notifications are read.
export const NOTIFICATIONS_CHANGED = 'pxl:notifications-changed'

export function announceNotificationsChanged() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED))
}
