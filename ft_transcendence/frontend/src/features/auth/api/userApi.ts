import { apiRequest } from '../../../api/apiClient'

export type CurrentUser = {
  id: string
  email: string
  username: string
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>('/users/me')
}

export function blockUser(userId: string) {
  return apiRequest(`/users/${userId}/block`, {
    method: 'POST',
  })
}

export function unblockUser(userId: string) {
  return apiRequest(`/users/${userId}/block`, {
    method: 'DELETE',
  })
}
