import type { Author } from './Post'

export type Reply = {
  id: number
  postId: number
  parentId: number | null
  content: string
  author: Author
  createdAt: string
}