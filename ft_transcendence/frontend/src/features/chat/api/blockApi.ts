import { apiRequest } from '../../../api/apiClient'

export type BlockTarget = {
  id: string
  username: string
}

type ApiChannel = {
  communityId: string
}

type CommunityMember = {
  user: BlockTarget
}

export async function getBlockTargets(
  channelId: string,
  currentUserId: string,
) {
  let channel: ApiChannel
  let members: CommunityMember[]

  channel = await apiRequest<ApiChannel>(`/channels/${channelId}`)
  members = await apiRequest<CommunityMember[]>(
    `/communities/${channel.communityId}/members`,
  )

  return members
    .map((member) => member.user)
    .filter((user) => user.id !== currentUserId)
}
