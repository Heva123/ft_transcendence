import type { Notification } from '../types/Notification'

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Heba replied to your post',
    message: '"Count me in!"',
    read: false,
    createdAt: '8 min ago',
    targetUrl: '/posts/1',
  },
  {
    id: '2',
    type: 'community',
    title: 'You were invited to Web Builders',
    message: 'A community for curious web builders',
    read: false,
    createdAt: '22 min ago',
    targetUrl: '/communities/1',
  },
  {
    id: '3',
    type: 'community',
    title: 'Afnan joined your circle',
    message: 'Say hello in your community channel',
    read: false,
    createdAt: '1h ago',
    targetUrl: '/channels/1',
  },
]
