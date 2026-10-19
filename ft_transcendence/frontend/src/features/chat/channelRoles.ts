// Who may manage channels. Mirrors the backend role permissions.
const CREATE_ROLES = ['OWNER', 'ADMIN', 'MODERATOR']
const DELETE_ROLES = ['OWNER', 'ADMIN']

export function canCreateChannel(role: string) {
  return CREATE_ROLES.includes(role)
}

// Moderators can rename a channel, the same roles that can create one.
export function canEditChannel(role: string) {
  return CREATE_ROLES.includes(role)
}

export function canDeleteChannel(role: string) {
  return DELETE_ROLES.includes(role)
}

// Channel names are lowercase words joined by hyphens, like project-help.
export function toChannelName(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}
