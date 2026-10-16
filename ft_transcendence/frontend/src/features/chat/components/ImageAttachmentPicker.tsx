import {
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { IMAGE_TYPES, validateImage } from '../../../utils/validateImage'

type Props = {
  file: File | null
  progress: number
  onFileChange: (file: File | null) => void
}

function ImageAttachmentPicker(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null)
  // The parent clears `file` after sending, which hides the preview.
  const preview = picked && picked.file === props.file ? picked.url : ''

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]

    event.target.value = ''
    if (!selected)
      return
    const validation = validateImage(selected)
    if (validation) {
      setError(validation)
      return
    }
    setError('')
    if (picked)
      URL.revokeObjectURL(picked.url)
    setPicked({ file: selected, url: URL.createObjectURL(selected) })
    props.onFileChange(selected)
  }

  return (
    <>
      <button className="chat-attachment__button" type="button"
        onClick={() => inputRef.current?.click()}>
        Attach image
      </button>

      <input ref={inputRef} type="file" hidden
        accept={IMAGE_TYPES.join(',')}
        onChange={handleChange} />

      {error && <p className="chat-attachment__error" role="alert">{error}</p>}

      {props.file && preview && (
        <div className="chat-attachment__preview">
          <img src={preview} alt="Selected attachment preview" />
          <div>
            <strong>{props.file.name}</strong>
            <span>{Math.ceil(props.file.size / 1024)} KB</span>
            {props.progress > 0 && (
              <span>Uploading {props.progress}%</span>
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

export default ImageAttachmentPicker
