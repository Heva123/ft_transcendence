import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMyCommunities,
  type ApiCommunity,
} from '../features/chat/api/chatApi'
import {
  createPost,
  uploadPostImage,
} from '../features/feed/api/feedApi'
import PostImageField from '../features/feed/components/PostImageField'
import './CreatePostPage.css'

type Values = {
  content: string
  target: string
  file: File | null
}

function readValues(form: HTMLFormElement) {
  let data: FormData
  let file: FormDataEntryValue | null

  data = new FormData(form)
  file = data.get('image')
  return {
    content: String(data.get('idea')).trim(),
    target: String(data.get('target')),
    file: file instanceof File && file.size ? file : null,
  }
}

async function publish(
  values: Values,
  onProgress: (value: number) => void,
) {
  let post

  post = await createPost({
    content: values.content,
    communityId: values.target === 'global' ? null : values.target,
  })
  if (values.file)
    await uploadPostImage(post.id, values.file, onProgress)
}

function CreatePostPage() {
  const navigate = useNavigate()
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    getMyCommunities().then(setCommunities)
      .catch(() => setError('Unable to load communities.'))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    let values: Values

    event.preventDefault()
    values = readValues(event.currentTarget)
    if (!values.content)
      return
    try {
      setProgress(0)
      await publish(values, setProgress)
      if (values.file)
        await new Promise((resolve) => setTimeout(resolve, 400))
      navigate(values.target === 'global' ? '/' : `/communities/${values.target}`)
    } catch {
      setError('Unable to publish post.')
    }
  }

  return (
    <section className="create-post-page">
      <header>
        <p>42 COMMUNITY</p>
        <h1>Share something.</h1>
        <p>Make a little change. Keep building.</p>
      </header>

      <form className="create-post-form" onSubmit={handleSubmit}>
        <label htmlFor="post-target">Post to</label>
        <select id="post-target" name="target" defaultValue="global">
          <option value="global">Global feed</option>
          {communities.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        <label htmlFor="post-idea">Your idea</label>
        <textarea id="post-idea" name="idea" rows={7}
          placeholder="What would you like to share?" />

        <PostImageField
          file={file}
          progress={progress}
          onFileChange={setFile}
        />

        {error && <p>{error}</p>}

        <div className="create-post-actions">
          <button type="submit">Publish post</button>
          <button type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </section>
  )
}

export default CreatePostPage
