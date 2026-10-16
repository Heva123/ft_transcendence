import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/apiClient'
import Input from '../../../components/Input'
import { updateCurrentUser, type CurrentUser } from '../api/userApi'

type Props = {
  user: CurrentUser
  onSaved: (user: CurrentUser) => void
}

// Same rules as the backend UpdateUserDto.
function validate(username: string, email: string) {
  if (username.length < 3 || username.length > 30)
    return 'Username must be 3 to 30 characters.'
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return 'Username can contain only letters, numbers and underscores.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please enter a valid email address.'
  return ''
}

// Editable account details with Save (design p70–71).
function AccountSettingsForm({ user, onSaved }: Props) {
  const [username, setUsername] = useState(user.username)
  const [email, setEmail] = useState(user.email)
  const [status, setStatus] = useState({ saving: false, error: '', saved: false })
  const changed = username.trim() !== user.username || email.trim().toLowerCase() !== user.email

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanName = username.trim()
    const cleanEmail = email.trim().toLowerCase()
    const error = validate(cleanName, cleanEmail)

    if (error) {
      setStatus({ saving: false, error, saved: false })
      return
    }
    setStatus({ saving: true, error: '', saved: false })
    try {
      const updated = await updateCurrentUser({ username: cleanName, email: cleanEmail })
      onSaved(updated)
      setStatus({ saving: false, error: '', saved: true })
    } catch (err) {
      setStatus({
        saving: false,
        saved: false,
        error: err instanceof ApiError && err.status === 409
          ? 'That username or email is already taken.'
          : err instanceof ApiError ? err.message : 'Could not save your changes.',
      })
    }
  }

  return (
    <form className="settings-account-form" onSubmit={handleSubmit} noValidate>
      {status.saved && (
        <p className="settings-saved" role="status">✓ Your preferences have been saved.</p>
      )}
      <Input id="settings-username" label="Username" type="text" placeholder="maram_42"
        value={username} onChange={(value) => { setUsername(value); setStatus((s) => ({ ...s, saved: false })) }}
        required minLength={3} />
      <Input id="settings-email" label="Email address" type="email" placeholder="you@example.com"
        value={email} onChange={(value) => { setEmail(value); setStatus((s) => ({ ...s, saved: false })) }}
        required />
      <p className="settings-muted">Appearance · Light. The PXL_LAB palette is tuned for a warm, readable workspace.</p>
      {status.error && <p className="form-error" role="alert">{status.error}</p>}
      <div className="settings-account-actions">
        <button type="submit" className="settings-save" disabled={status.saving || !changed}>
          {status.saving ? 'Saving…' : 'Save changes'}
        </button>
        <button type="button" className="settings-reset" disabled={status.saving || !changed}
          onClick={() => { setUsername(user.username); setEmail(user.email); setStatus({ saving: false, error: '', saved: false }) }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default AccountSettingsForm
