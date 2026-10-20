import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import {
  ATTACHMENT_TYPES,
  formatBytes,
  isImageType,
  validateAttachment,
} from '../../../utils/validateImage'

type Props = {
  file: File | null
  progress: number
  onFileChange: (file: File | null) => void
}

// Attach an image or a PDF to a chat message, with preview and progress.
function AttachmentPicker(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null)
  // The parent clears `file` after sending, which hides the preview.
  const current = picked && picked.file === props.file ? picked : null

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]

    event.target.value = ''
    if (!selected)
      return
    const validation = validateAttachment(selected)
    if (validation) {
      setError(validation)
      return
    }
    setError('')
    if (picked?.url)
      URL.revokeObjectURL(picked.url)
    setPicked({
      file: selected,
      url: isImageType(selected.type) ? URL.createObjectURL(selected) : '',
    })
    props.onFileChange(selected)
  }

  return (
    <>
      <button className="chat-attachment__button" type="button"
        onClick={() => inputRef.current?.click()}>
        Attach file
      </button>

      <input ref={inputRef} type="file" hidden aria-label="Attach an image or PDF"
        accept={ATTACHMENT_TYPES.join(',')}
        onChange={handleChange} />

      {error && <p className="chat-attachment__error" role="alert">{error}</p>}

      {props.file && current && (
        <div className="chat-attachment__preview">
          {current.url
            ? <img src={current.url} alt="Selected attachment preview" />
            : <span className="file-attachment__icon" aria-hidden="true">PDF</span>}
          <div>
            <strong>{props.file.name}</strong>
            <span>{formatBytes(props.file.size)}</span>
            {props.progress > 0 && (
              <>
                <progress max="100" value={props.progress} />
                <span>Uploading {props.progress}%</span>
              </>
            )}
          </div>
          <button type="button"
            onClick={() => props.onFileChange(null)}>
            Remove
          </button>
        </div>
      )}
    </>
  )
}

export default AttachmentPicker
