import { useEffect } from 'react'
import './Feedback.css'

type Props = {
  title: string
  message: string
  confirmLabel: string
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

// In-app confirmation overlay used instead of window.confirm (design p37, p50, p59).
function ConfirmDialog(props: Props) {
  const { onCancel } = props

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape')
        onCancel()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="confirm-backdrop" onClick={props.onCancel}>
      <div className="confirm-dialog" role="dialog" aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}>
        <h2 id="confirm-title">{props.title}</h2>
        <p>{props.message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" onClick={props.onCancel}>Cancel</button>
          <button type="button" className="danger" autoFocus
            disabled={props.busy} onClick={props.onConfirm}>
            {props.busy ? 'Working…' : props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
