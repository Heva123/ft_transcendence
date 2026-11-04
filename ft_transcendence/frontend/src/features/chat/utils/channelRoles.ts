
const CREATE_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']
const DELETE_ROLES = ['OWNER', 'ADMIN']

export function canCreateChannel(role: string) {
  return CREATE_ROLES.includes(role)
}


export function canEditChannel(role: string) {
  return CREATE_ROLES.includes(role)
}

export function canDeleteChannel(role: string) {
  return DELETE_ROLES.includes(role)
}


export function toChannelName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
