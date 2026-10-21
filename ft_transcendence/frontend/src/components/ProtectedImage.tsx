import { useEffect, useState, type ReactNode } from 'react'
import { apiBlob } from '../api/apiClient'
import { formatBytes } from '../utils/validateImage'
import './Feedback.css'

type Props = {
  src: string
  alt: string
  className?: string
  fallback?: ReactNode
}

type LoadedFile = {
  src: string
  url: string
  type: string
  size: number
}

function ProtectedImage({ src, alt, className, fallback = null }: Props) {
  const [file, setFile] = useState<LoadedFile>({
    src: '',
    url: '',
    type: '',
    size: 0,
  })

  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl = ''


    apiBlob(src).then((blob) => {
      if (!active)
        return

      objectUrl = URL.createObjectURL(blob)

      setFile({
        src,
        url: objectUrl,
        type: blob.type,
        size: blob.size,
      })
    }).catch(() => {
      if (active) {
        setFile({
          src,
          url: '',
          type: '',
          size: 0,
        })
      }
    })

    return () => {
      active = false

      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  function downloadPdf() {
    const link = document.createElement('a')

    link.href = file.url
    link.download = 'attachment.pdf'
    link.click()
  }

  if (file.src !== src || !file.url)
    return <>{fallback}</>

  if (file.type === 'application/pdf') {
    return (
      <>
        <div className='file-attachment'>
          <span className='file-attachment__icon' aria-hidden='true'>
            PDF
          </span>

          <div className='file-attachment__info'>
            <strong>PDF document</strong>
            <span>{formatBytes(file.size)}</span>
          </div>

          <div className='file-attachment__actions'>
            <button type='button' onClick={() => setPreviewOpen(true)}>
              Preview
            </button>

            <button type='button' onClick={downloadPdf}>
              Download
            </button>
          </div>
        </div>

        {previewOpen && (
          <div
            className='confirm-backdrop'
            onClick={() => setPreviewOpen(false)}
          >
            <div
              className='file-preview'
              role='dialog'
              aria-modal='true'
              aria-label='PDF attachment preview'
              onClick={(event) => event.stopPropagation()}
            >
              <header>
                <strong>PDF document</strong>

                <button
                  type='button'
                  autoFocus
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </button>
              </header>

              <iframe
                src={file.url}
                title='PDF attachment preview'
              />
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <img
      src={file.url}
      alt={alt}
      className={className}
    />
  )
}

export default ProtectedImage
