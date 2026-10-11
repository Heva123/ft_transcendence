export type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  targetUrl: string | null
}
