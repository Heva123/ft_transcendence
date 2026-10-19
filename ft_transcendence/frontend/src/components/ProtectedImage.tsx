import { useEffect, useState, type ReactNode } from 'react'
import { apiBlob } from '../api/apiClient'

type Props = {
  src: string
  alt: string
  className?: string
  /** Shown while loading or if the image cannot be loaded. */
  fallback?: ReactNode
}

function ProtectedImage({ src, alt, className, fallback = null }: Props) {
  const [image, setImage] = useState({ src: '', url: '' })

  useEffect(() => {
    let active = true
    let objectUrl = ''

    apiBlob(src).then((blob) => {
      if (!active)
        return
      objectUrl = URL.createObjectURL(blob)
      setImage({ src, url: objectUrl })
    }).catch(() => {
      if (active)
        setImage({ src, url: '' })
    })

    return () => {
      active = false
      if (objectUrl)
        URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (image.src !== src || !image.url)
    return <>{fallback}</>
  return <img src={image.url} alt={alt} className={className} />
}

export default ProtectedImage
