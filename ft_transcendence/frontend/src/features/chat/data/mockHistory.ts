import type { Message } from '../types/Message'

export const mockHistory: Message[] = [
  {
    id: 'history-1',
    channelId: '1',
    sender: 'Heba',
    text: 'Morning! Anyone working on the profile flow today?',
    createdAt: '09:41',
  },
  {
    id: 'history-2',
    channelId: '1',
    sender: 'Afnan',
    text: 'Yep! It’s ready for a review.',
    createdAt: '09:42',
  },
]
