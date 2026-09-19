import type { Post } from '../features/feed/types/Post'
import type { Reply } from '../features/feed/types/Reply'

const API_URL = import.meta.env.VITE_API_URL

export type PostsResponse = {
  posts: Post[]
}

export type PostDetailsResponse = {
  post: Post
  comments: Reply[]
}

export type LikeResponse = {
  liked: boolean
  likesCount: number
}

async function apiRequest<T>(
  path: string,
  token: string,
  options?: RequestInit,
) {
  let response: Response

  response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!response.ok)
    throw new Error(await response.text())

  return response.json() as Promise<T>
}

export async function getPosts(
  token: string,
  communityId: number | null = null,
) {
  let path: string

  path = communityId === null
    ? '/posts'
    : `/posts?communityId=${communityId}`

  return apiRequest<PostsResponse>(path, token)
}

export async function createPost(
  token: string,
  content: string,
  communityId: number | null,
) {
  return apiRequest<Post>('/posts', token, {
    method: 'POST',
    body: JSON.stringify({ content, communityId }),
  })
}

export async function getPost(
  token: string,
  postId: number,
) {
  return apiRequest<PostDetailsResponse>(
    `/posts/${postId}`,
    token,
  )
}

export async function addComment(
  token: string,
  postId: number,
  content: string,
  parentId: number | null = null,
) {
  return apiRequest<Reply>(
    `/posts/${postId}/comments`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    },
  )
}

export async function toggleLike(
  token: string,
  postId: number,
) {
  return apiRequest<LikeResponse>(
    `/posts/${postId}/likes`,
    token,
    { method: 'POST' },
  )
}