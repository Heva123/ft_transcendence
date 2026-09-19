import type { Reply } from '../types/Reply'

export const mockReplies: Reply[] = [
  {
    id: 1,
    postId: 1,
    parentId: null,
    author: {
      id: 8,
      username: 'Heba',
      avatarUrl: null,
    },
    content: 'Count me in! I can bring examples of component props and state.',
    createdAt: '8 min ago',
  },
]