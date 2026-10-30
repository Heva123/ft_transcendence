import { useCanWrite } from '../features/auth/hooks/useCanWrite'

// Shown on every page to site guests (role GUEST).
function GuestBanner() {
  if (useCanWrite())
    return null
  return (
    <p className="guest-banner mb-4 mt-0 border border-ink bg-yellow px-4 py-3 text-[13px]" role="status">
      You are browsing as a guest. You can read, but you cannot post, chat,
      join communities or add friends.
    </p>
  )
}

export default GuestBanner
