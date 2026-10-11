import { useEffect, useState } from 'react'
import { apiBlob } from '../api/apiClient'

type Props = {
  src: string
  alt: string
  className?: string
}

function ProtectedImage({ src, alt, className }: Props) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''

    apiBlob(src).then((blob) => {
      if (!active)
        return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    }).catch(() => setUrl(''))

    return () => {
      active = false
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (!url)
    return null
  return <img src={url} alt={alt} className={className} />
}

export default ProtectedImage
