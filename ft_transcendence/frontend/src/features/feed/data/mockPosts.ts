import type { CommunitySummary, Post } from '../types/Post'

export const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      id: 5,
      username: 'Afnan',
      avatarUrl: null,
    },
    content: 'Anyone studying React today?',
    createdAt: '10 min ago',
    likesCount: 12,
    commentsCount: 4,
    likedByMe: false,
    community: null,
  },
  {
    id: 2,
    author: {
      id: 7,
      username: 'Noor',
      avatarUrl: null,
    },
    content: 'Looking for people to join our web study group!',
    createdAt: '25 min ago',
    likesCount: 8,
    commentsCount: 2,
    likedByMe: false,
    community: {
      id: 1,
      name: 'Web Builders',
    },
  },
]

export function addMockPost(
  content: string,
  community: CommunitySummary | null,
) {
  let newPost: Post

  newPost = {
    id: Date.now(),
    author: {
      id: 5,
      username: 'Afnan',
      avatarUrl: null,
    },
    content: content,
    createdAt: 'now',
    likesCount: 0,
    commentsCount: 0,
    likedByMe: false,
    community: community,
  }

  mockPosts.unshift(newPost)
}