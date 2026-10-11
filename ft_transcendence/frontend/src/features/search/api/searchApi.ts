import { apiRequest } from '../../../api/apiClient'

export type SearchUser = {
  id: string
  username: string
}

export type SearchCommunity = {
  id: string
  name: string
  description: string | null
}

export type SearchPost = {
  id: string
  content: string
  createdAt: string
  author: SearchUser
  community: {
    id: string
    name: string
  } | null
}

export type SearchType = 'users' | 'communities' | 'posts'

export type SearchResponse = {
  results: {
    users: SearchUser[]
    communities: SearchCommunity[]
    posts: SearchPost[]
  }
}

export function searchBackend(query: string, type: SearchType) {
  let path: string

  path = `/search?q=${encodeURIComponent(query)}&type=${type}&limit=50`
  return apiRequest<SearchResponse>(path)
}
