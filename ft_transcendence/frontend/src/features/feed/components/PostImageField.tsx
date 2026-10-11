import { useEffect, useState, type ChangeEvent } from 'react'

type Props = {
  file: File | null
  progress: number
  onFileChange: (file: File | null) => void
}

function usePreview(file: File | null) {
  const [preview, setPreview] = useState('')

  useEffect(() => {
    let url = ''

    if (file)
      url = URL.createObjectURL(file)
    setPreview(url)
    return () => {
      if (url)
        URL.revokeObjectURL(url)
    }
  }, [file])

  return preview
}

function PostImageField(props: Props) {
  const preview = usePreview(props.file)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    props.onFileChange(event.target.files?.[0] ?? null)
  }

  return (
    <div className="post-image-field">
      <label htmlFor="post-image">Attachment</label>
      <input id="post-image" name="image" type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange} />

      {preview && (
        <img src={preview} alt="Post attachment preview" />
      )}

      {props.file && (
        <div className="upload-progress">
          <progress max="100" value={props.progress} />
          <span>{props.progress}%</span>
        </div>
      )}
    </div>
  )
}

export default PostImageField
