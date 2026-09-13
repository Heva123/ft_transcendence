export type Post = {
  id: number
  author: string
  content: string
  createdAt: string
  likes: number
  comments: number
  community: string | null
}