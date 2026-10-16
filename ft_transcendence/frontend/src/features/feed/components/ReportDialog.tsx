import { useState, type FormEvent } from 'react'
import { ApiError } from '../../../api/apiClient'
import '../../../components/Feedback.css'
import { reportContent, type ReportTarget } from '../api/feedApi'

const REASONS = [
  'Harassment or disrespect',
  'Spam or self-promotion',
  'Off-topic',
  'Unsafe or inappropriate content',
  'Something else',
]

type Props = {
  communityId: string
  targetType: ReportTarget
  targetId: string
  onClose: () => void
}

// Report form and thank-you state (design p38–39).
function ReportDialog({ communityId, targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState(REASONS[0])
  const [context, setContext] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState('')
  const label = targetType === 'POST' ? 'post' : 'reply'

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const extra = context.trim()
    const text = extra ? `${reason}: ${extra}` : reason

    setStatus('sending')
    setError('')
    try {
      await reportContent(communityId, targetType, targetId, text.slice(0, 500))
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof ApiError ? err.message : 'Unable to send the report.')
    }
  }

  return (
    <div className="confirm-backdrop" onClick={onClose}>
      <div className="confirm-dialog" role="dialog" aria-modal="true"
        aria-labelledby="report-title" onClick={(event) => event.stopPropagation()}>
        {status === 'sent'
          ? <>
            <h2 id="report-title">Thanks for speaking up.</h2>
            <p>Your report was sent to the community moderation team.</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="primary" autoFocus onClick={onClose}>Done</button>
            </div>
          </>
          : <form onSubmit={handleSubmit}>
            <h2 id="report-title">Report this {label}</h2>
            <p>Help us keep it safe. Moderators of this community will review it.</p>
            <label htmlFor="report-reason">Reason</label>
            <select id="report-reason" value={reason}
              onChange={(event) => setReason(event.target.value)}>
              {REASONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <label htmlFor="report-context">More context (optional)</label>
            <textarea id="report-context" rows={3} maxLength={400} value={context}
              onChange={(event) => setContext(event.target.value)} />
            {error && <p className="form-error-inline" role="alert">{error}</p>}
            <div className="confirm-dialog__actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className="primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </form>}
      </div>
    </div>
  )
}

export default ReportDialog
