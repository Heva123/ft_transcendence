import type { Message } from '../types/Message'

export const mockMessages: Message[] = [
  {
    id: 1,
    channelId: 1,
    sender: 'Heba',
    text: 'Morning! Anyone working on the profile flow today?',
    createdAt: '09:41',
  },
  {
    id: 2,
    channelId: 1,
    sender: 'Afnan',
    text: 'Yep! I’ve got the edit form ready for a review.',
    createdAt: '09:42',
  },
  {
    id: 3,
    channelId: 1,
    sender: 'You',
    text: 'Happy to help. Send it over when you’re ready.',
    createdAt: '09:43',
  },
  {
    id: 4,
    channelId: 2,
    sender: 'Sara',
    text: 'Can someone explain Props?',
    createdAt: '09:45',
  },
]