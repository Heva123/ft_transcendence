export type NotificationType =
  | 'message'
  | 'mention'
  | 'community'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  targetUrl: string | null
}
