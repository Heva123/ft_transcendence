import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'

type Props = {
  file: File | null
  onFileChange: (file: File | null) => void
}

function validateImage(file: File) {
  if (!['image/png', 'image/jpeg'].includes(file.type))
    return 'Please choose a PNG or JPEG image.'
  if (file.size > 5 * 1024 * 1024)
    return 'Please choose an image under 5 MB.'
  return ''
}

function ImageAttachmentPicker({ file, onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let url: string

    if (!file) {
      setPreview('')
      if (inputRef.current)
        inputRef.current.value = ''
      return
    }
    url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

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
    onFileChange(selected)
  }

  return (
    <>
      <button className="chat-attachment__button" type="button"
        onClick={() => inputRef.current?.click()}>
        Attach image
      </button>

      <input ref={inputRef} type="file" hidden
        accept="image/png,image/jpeg" onChange={handleChange} />

      {error && <p className="chat-attachment__error">{error}</p>}

      {file && preview && (
        <div className="chat-attachment__preview">
          <img src={preview} alt="Selected attachment preview" />
          <div>
            <strong>{file.name}</strong>
            <span>{Math.ceil(file.size / 1024)} KB</span>
          </div>
          <button type="button" onClick={() => onFileChange(null)}>
            Remove
          </button>
        </div>
      )}
    </>
  )
}

export default ImageAttachmentPicker
