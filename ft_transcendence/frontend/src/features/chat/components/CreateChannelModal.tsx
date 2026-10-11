import { useState, type FormEvent } from 'react'

type Props = {
  onCancel: () => void
  onCreate: (name: string, description: string) => Promise<void>
}

function CreateChannelModal({ onCancel, onCreate }: Props) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [status, setStatus] = useState({ saving: false, error: '' })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus({ saving: true, error: '' })
    try {
      await onCreate(form.name.trim(), form.description.trim())
    } catch {
      setStatus({ saving: false, error: 'Unable to create channel.' })
    }
  }

  return (
    <div className="block-modal-backdrop">
      <div className="block-modal">
        <h2>Create channel</h2>
        <p>Add a new channel to this community.</p>

        <form className="channel-create-form" onSubmit={handleSubmit}>
          <label htmlFor="channel-name">Channel name</label>
          <input
            id="channel-name"
            required
            minLength={2}
            maxLength={50}
            pattern="[a-z0-9][a-z0-9-]*"
            placeholder="project-help"
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })}
          />

          <label htmlFor="channel-description">Description</label>
          <textarea
            id="channel-description"
            maxLength={300}
            placeholder="What is this channel for?"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })}
          />

          {status.error && <p>{status.error}</p>}

          <div className="block-modal__actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit" disabled={status.saving}>
              {status.saving ? 'Creating...' : 'Create channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateChannelModal
