import { useRef, useState, type ChangeEvent } from 'react'
import { IMAGE_TYPES, validateImage } from '../../../utils/validateImage'

type Props = {
  file: File | null
  progress: number
  uploading: boolean
  onFileChange: (file: File | null) => void
}

// "+ Add image · optional" picker with preview, validation and progress (design p35, p89–91).
function PostImageField(props: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null)
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
    <div className="post-image-field">
      <label htmlFor="post-image">Attachment</label>
      <input ref={inputRef} id="post-image" name="image" type="file" hidden
        accept={IMAGE_TYPES.join(',')} onChange={handleChange} />
      {!props.file && (
        <button type="button" className="post-image-field__add"
          onClick={() => inputRef.current?.click()}>
          + Add image · optional
        </button>
      )}
      <p className="attachment-note">PNG, JPEG or WEBP · up to 5 MB.</p>

      {error && <p className="post-image-field__error" role="alert">{error}</p>}

      {props.file && preview && (
        <div className="post-image-field__preview">
          <img src={preview} alt="Post attachment preview" />
          <div>
            <strong>{props.file.name}</strong>
            <span>{(props.file.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          {!props.uploading && (
            <button type="button" onClick={() => props.onFileChange(null)}>Remove</button>
          )}
        </div>
      )}

      {props.file && props.uploading && (
        <div className="upload-progress">
          <progress max="100" value={props.progress} />
          <span>Uploading… {props.progress}%</span>
        </div>
      )}
    </div>
  )
}

export default PostImageField
