import { useState } from 'react'
import { disconnectSocket } from '../api/socket'
import ConfirmDialog from './ConfirmDialog'

function logout() {
  localStorage.removeItem('accessToken')
  disconnectSocket()
  window.location.assign('/login')
}

// "See you soon?" confirmation before logging out (design p76).
export function LogoutDialog({ onCancel }: { onCancel: () => void }) {
  return (
    <ConfirmDialog
      title="See you soon?"
      message="You can sign back in any time. Unsaved edits will be lost."
      confirmLabel="Log out"
      onCancel={onCancel}
      onConfirm={logout}
    />
  )
}

function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Log out
      </button>
      {open && <LogoutDialog onCancel={() => setOpen(false)} />}
    </>
  )
}

export default LogoutButton
