import { apiRequest } from '../../../api/apiClient'
import type { Channel } from '../types/Channel'
import type { MessageAttachment } from '../types/Message'

export type ApiMessage = {
  id: string
  channelId: string
  content: string
  createdAt: string
  attachment?: MessageAttachment | null
  author: {
    id: string
    username: string
  }
}

export type ApiCommunity = {
  id: string
  name: string
  description: string | null
  members?: {
    role: string
  }[]
  memberCount?: number
  _count?: {
    members: number
    channels: number
    projects: number
  }
}

export function getMyCommunities() {
  return apiRequest<ApiCommunity[]>('/communities')
}

export function getChannel(channelId: string) {
  return apiRequest<Channel>(`/channels/${channelId}`)
}

export function getChannels(communityId: string) {
  return apiRequest<Channel[]>(
    `/communities/${communityId}/channels`,
  )
}

export function getCommunity(communityId: string) {
  return apiRequest<ApiCommunity>(
    `/communities/${communityId}`,
  )
}

export function getMessages(channelId: string) {
  return apiRequest<ApiMessage[]>(
    `/channels/${channelId}/messages`,
  )
}

export type CreateChannelInput = {
  name: string
  description?: string
}

export function createChannel(
  communityId: string,
  input: CreateChannelInput,
) {
  return apiRequest<Channel>(
    `/communities/${communityId}/channels`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}
