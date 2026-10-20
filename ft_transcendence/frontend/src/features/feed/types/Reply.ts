import type { Author } from './Post'

export type Reply = {
  id: string
  postId: string
  parentId: string | null
  content: string
  author: Author
  createdAt: string
}