import type { ApiCommunity } from './chatApi'
import type { Community } from '../types/Community'

export function toCommunity(item: ApiCommunity): Community {
  const members = item._count?.members ?? item.memberCount ?? 0
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    members,
  }
}
