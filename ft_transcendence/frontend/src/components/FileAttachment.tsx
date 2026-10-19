import { useEffect, useState } from 'react'
import { apiBlob } from '../api/apiClient'
import { formatBytes } from '../utils/validateImage'
import './Feedback.css'

type Props = {
  url: string
  name: string
  type: string
  size: number
}

type PreviewState = { status: 'closed' | 'loading' | 'open' | 'error'; url: string }

// A document in chat: name, size, Preview (PDF in a window) and Download.
function FileAttachment({ url, name, type, size }: Props) {
  const [preview, setPreview] = useState<PreviewState>({ status: 'closed', url: '' })
  const [error, setError] = useState('')
  const isPdf = type === 'application/pdf'

  // Free the blob URL when the preview closes or the message unmounts.
  useEffect(() => () => {
    if (preview.url)
      URL.revokeObjectURL(preview.url)
  }, [preview.url])

  async function openPreview() {
    setPreview({ status: 'loading', url: '' })
    try {
      const blob = await apiBlob(url)
      setPreview({ status: 'open', url: URL.createObjectURL(new Blob([blob], { type })) })
    } catch {
      setPreview({ status: 'error', url: '' })
    }
  }

  async function download() {
    setError('')
    try {
      const blob = await apiBlob(url)
      const link = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)

      link.href = objectUrl
      link.download = name
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch {
      setError('Could not download this file.')
    }
  }

  return (
    <div className="file-attachment">
      <span className="file-attachment__icon" aria-hidden="true">{isPdf ? 'PDF' : 'FILE'}</span>
      <div className="file-attachment__info">
        <strong>{name}</strong>
        <span>{formatBytes(size)}</span>
        {error && <span className="form-error-inline" role="alert">{error}</span>}
        {preview.status === 'error' && <span className="form-error-inline" role="alert">Could not open the preview.</span>}
      </div>
      <div className="file-attachment__actions">
        {isPdf && (
          <button type="button" onClick={openPreview} disabled={preview.status === 'loading'}>
            {preview.status === 'loading' ? 'Opening…' : 'Preview'}
          </button>
        )}
        <button type="button" onClick={download}>Download</button>
      </div>

      {preview.status === 'open' && (
        <div className="confirm-backdrop" onClick={() => setPreview({ status: 'closed', url: '' })}>
          <div className="file-preview" role="dialog" aria-modal="true" aria-label={`Preview of ${name}`}
            onClick={(event) => event.stopPropagation()}>
            <header>
              <strong>{name}</strong>
              <button type="button" autoFocus onClick={() => setPreview({ status: 'closed', url: '' })}>Close</button>
            </header>
            <iframe src={preview.url} title={`Preview of ${name}`} />
          </div>
        </div>
      )}
    </div>
  )
}

export default FileAttachment
