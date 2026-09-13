import type { Post } from '../types/Post'

export const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Afnan',
    content: 'Anyone studying React today?',
    createdAt: '10 min ago',
    likes: 12,
    comments: 4,
    community: null,
  },
  {
    id: 2,
    author: 'Noor',
    content: 'Looking for people to join our web study group!',
    createdAt: '25 min ago',
    likes: 8,
    comments: 2,
    community: 'Web Builders',
  },
]
export function addMockPost(
  content: string,
  community: string | null,
) {
  let newPost: Post

  newPost = {
    id: Date.now(),
    author: 'Afnan',
    content: content,
    createdAt: 'now',
    likes: 0,
    comments: 0,
    community: community,
  }

  mockPosts.unshift(newPost)
}