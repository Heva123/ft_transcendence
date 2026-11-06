import { canWriteSite } from '../utils/sitePermissions'
import { useCurrentUser } from './useCurrentUser'
export function useCanWrite() {
  return canWriteSite(useCurrentUser())
}
