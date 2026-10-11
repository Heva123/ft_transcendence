let API_URL: string

API_URL = import.meta.env.VITE_API_URL
  || 'http://localhost:3000/api'

function makeHeaders(options: RequestInit) {
  let headers: Headers
  let token: string | null

  headers = new Headers(options.headers)
  token = localStorage.getItem('accessToken')
  if (token)
    headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json')
  return headers
}

function resolveUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://'))
    return path
  if (path.startsWith('/api/'))
    return path
  return `${API_URL}${path}`
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
) {
  let headers: Headers
  let response: Response

  headers = makeHeaders(options)
  response = await fetch(resolveUrl(path), { ...options, headers })
  if (!response.ok)
    throw new Error(await response.text())
  if (response.status === 204)
    return undefined as T
  return response.json() as Promise<T>
}

export async function apiBlob(path: string) {
  let response: Response
  let headers: Headers

  headers = makeHeaders({})
  response = await fetch(resolveUrl(path), { headers })
  if (!response.ok)
    throw new Error(await response.text())
  return response.blob()
}

function setUploadAuth(xhr: XMLHttpRequest) {
  let token: string | null

  token = localStorage.getItem('accessToken')
  if (token)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
}

export function uploadRequest<T>(
  path: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return new Promise<T>((resolve, reject) => {
    let xhr: XMLHttpRequest
    let body: FormData

    xhr = new XMLHttpRequest()
    body = new FormData()
    body.append('file', file)
    xhr.open('POST', resolveUrl(path))
    setUploadAuth(xhr)
    xhr.responseType = 'json'
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round(event.loaded * 100 / event.total))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100)
        resolve(xhr.response as T)
      } else
        reject(new Error('Upload failed.'))
    }
    xhr.onerror = () => reject(new Error('Upload failed.'))
    xhr.send(body)
  })
}
