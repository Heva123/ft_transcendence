import { apiRequest } from '../../../api/apiClient'

export type ApiNotification = {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
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
