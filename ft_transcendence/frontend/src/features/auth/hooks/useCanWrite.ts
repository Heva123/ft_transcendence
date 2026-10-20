import { canWriteSite } from '../utils/sitePermissions'
import { useCurrentUser } from './useCurrentUser'

// Guests can read what they are allowed to see, but cannot create or change
// anything. While the user is still loading this returns true, so normal
// users never see their buttons flicker.
export function useCanWrite() {
  return canWriteSite(useCurrentUser())
}
