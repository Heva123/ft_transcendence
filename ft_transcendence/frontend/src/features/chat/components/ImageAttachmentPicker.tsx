import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

type Props = {
  file: File | null
  progress: number
  onFileChange: (file: File | null) => void
}

function validateImage(file: File) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    return 'Please choose a PNG, JPEG, or WEBP image.'
  if (file.size > 5 * 1024 * 1024)
    return 'Please choose an image under 5 MB.'
  return ''
}

function ImageAttachmentPicker(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let url = ''

    if (props.file)
      url = URL.createObjectURL(props.file)
    setPreview(url)
    return () => {
      if (url)
        URL.revokeObjectURL(url)
    }
  }, [props.file])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let selected: File | undefined
    let validation: string

    selected = event.target.files?.[0]
    if (!selected)
      return
    validation = validateImage(selected)
    if (validation) {
      setError(validation)
      return
    }
    setError('')
    props.onFileChange(selected)
  }

  return (
    <>
      <button className="chat-attachment__button" type="button"
        onClick={() => inputRef.current?.click()}>
        Attach image
      </button>

      <input ref={inputRef} type="file" hidden
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange} />

      {error && <p className="chat-attachment__error">{error}</p>}

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
