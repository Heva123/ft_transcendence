import { useEffect, useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/apiClient'
import { toChannelName } from '../channelRoles'
import './Chat.css'
import './ChannelFormModal.css'

type Values = { name: string; description: string }

type Props = {
  title: string
  intro: string
  submitLabel: string
  initial?: Values
  onCancel: () => void
  onSubmit: (values: Values) => Promise<void>
  // Shown only when the user is allowed to delete the channel.
  onDelete?: () => void
}

// Used to create a channel and to edit one (design p48, p49).
function ChannelFormModal(props: Props) {
  const { onCancel } = props
  const [form, setForm] = useState<Values>(
    props.initial ?? { name: '', description: '' },
  )
  const [status, setStatus] = useState({ saving: false, error: '' })

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape')
        onCancel()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const name = form.name.replace(/^-+|-+$/g, '')

    if (name.length < 2) {
      setStatus({ saving: false, error: 'Use at least 2 characters for the name.' })
      return
    }
    setStatus({ saving: true, error: '' })
    try {
      await props.onSubmit({ name, description: form.description.trim() })
    } catch (error) {
      setStatus({
        saving: false,
        error: error instanceof ApiError
          ? error.message
          : 'Unable to save the channel. Try again.',
      })
    }
  }

  return (
    <div className="block-modal-backdrop" onClick={onCancel}>
      <div className="block-modal" role="dialog" aria-modal="true"
        aria-labelledby="channel-form-title"
        onClick={(event) => event.stopPropagation()}>
        <h2 id="channel-form-title">{props.title}</h2>
        <p>{props.intro}</p>

        <form className="channel-create-form" onSubmit={handleSubmit}>
          <label htmlFor="channel-name">Channel name</label>
          <input
            id="channel-name"
            required
            autoFocus
            minLength={2}
            maxLength={50}
            placeholder="project-help"
            aria-describedby="channel-name-hint"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: toChannelName(event.target.value) })}
          />
          <small id="channel-name-hint">
            Lowercase letters, numbers and hyphens. Spaces become hyphens.
          </small>

          <label htmlFor="channel-description">Description</label>
          <textarea
            id="channel-description"
            maxLength={300}
            placeholder="What is this channel for?"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })}
          />

          {status.error && (
            <p className="channel-form-error" role="alert">{status.error}</p>
          )}

          <div className="block-modal__actions">
            {props.onDelete && (
              <button type="button" className="channel-form-delete"
                onClick={props.onDelete}>
                Delete channel
              </button>
            )}
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" disabled={status.saving}>
              {status.saving ? 'Saving...' : props.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChannelFormModal
