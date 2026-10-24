import { expireSession } from './session'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api')

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function makeHeaders(options: RequestInit) {
  const headers = new Headers(options.headers)
  const token = localStorage.getItem('accessToken')

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`,
    )
  }

  if (
    options.body &&
    !(options.body instanceof FormData)
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    )
  }

  return headers
}

function resolveUrl(path: string) {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path
  }

  /*
    Backend sometimes returns URLs such as:
    /api/uploads/avatar/USER_ID

    VITE_API_URL already ends with /api,
    so we remove the extra /api here.
  */
  if (path.startsWith('/api/')) {
    return `${API_URL}${path.slice(4)}`
  }

  if (path.startsWith('/')) {
    return `${API_URL}${path}`
  }

  return `${API_URL}/${path}`
}

async function getErrorMessage(
  response: Response,
) {
  try {
    const data = await response.json()

    if (
      typeof data?.message === 'string'
    ) {
      return data.message
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(', ')
    }
  } catch {
    // Response was not JSON.
  }

  return 'Request failed.'
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
) {
  const headers =
    makeHeaders(options)

  const response = await fetch(
    resolveUrl(path),
    {
      ...options,
      headers,
    },
  )

  if (!response.ok) {
    const message =
      await getErrorMessage(response)

    if (response.status === 401 && headers.has('Authorization'))
      expireSession()

    throw new ApiError(
      response.status,
      message,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function apiBlob(
  path: string,
) {
  const headers =
    makeHeaders({})

  const response = await fetch(
    resolveUrl(path),
    {
      headers,
    },
  )

  if (!response.ok) {
    const message =
      await getErrorMessage(response)

    if (response.status === 401 && headers.has('Authorization'))
      expireSession()

    throw new ApiError(
      response.status,
      message,
    )
  }

  return response.blob()
}

function setUploadAuth(
  xhr: XMLHttpRequest,
) {
  const token =
    localStorage.getItem(
      'accessToken',
    )

  if (token) {
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${token}`,
    )
  }
}

function getUploadErrorMessage(
  xhr: XMLHttpRequest,
) {
  const response = xhr.response

  if (
    response &&
    typeof response.message ===
      'string'
  ) {
    return response.message
  }

  if (
    response &&
    Array.isArray(response.message)
  ) {
    return response.message.join(', ')
  }

  return 'Upload failed.'
}

export function uploadRequest<T>(
  path: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return new Promise<T>(
    (resolve, reject) => {
      const xhr =
        new XMLHttpRequest()

      const body =
        new FormData()

      body.append(
        'file',
        file,
      )

      xhr.open(
        'POST',
        resolveUrl(path),
      )

      setUploadAuth(xhr)

      xhr.responseType = 'json'

      xhr.upload.onprogress = (
        event,
      ) => {
        if (
          event.lengthComputable
        ) {
          onProgress(
            Math.round(
              (event.loaded * 100) /
                event.total,
            ),
          )
        }
      }

      xhr.onload = () => {
        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          onProgress(100)

          resolve(
            xhr.response as T,
          )

          return
        }

        if (xhr.status === 401)
          expireSession()

        reject(
          new ApiError(
            xhr.status,
            getUploadErrorMessage(
              xhr,
            ),
          ),
        )
      }

      xhr.onerror = () => {
        reject(
          new ApiError(
            0,
            'Could not connect to the server.',
          ),
        )
      }

      xhr.send(body)
    },
  )
}