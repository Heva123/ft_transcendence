// Same limits as the backend upload module.
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const DOCUMENT_TYPES = ['application/pdf']
/** Chat attachments: images and documents. */
export const ATTACHMENT_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES]
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

export function isImageType(type: string) {
  return IMAGE_TYPES.includes(type)
}

export function formatBytes(size: number) {
  if (size >= 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.ceil(size / 1024))} KB`
}

/** Post images and avatars: PNG, JPEG or WEBP up to 5 MB. */
export function validateImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type))
    return 'Unsupported file. Please choose a PNG, JPEG or WEBP image.'
  if (file.size > MAX_IMAGE_BYTES)
    return 'That image is too large. Please choose one under 5 MB.'
  return ''
}

/** Chat attachments: images up to 5 MB, PDF documents up to 10 MB. */
export function validateAttachment(file: File) {
  if (!ATTACHMENT_TYPES.includes(file.type))
    return 'Unsupported file. You can attach PNG, JPEG, WEBP images or PDF documents.'
  if (isImageType(file.type))
    return validateImage(file)
  if (file.size > MAX_ATTACHMENT_BYTES)
    return 'That document is too large. Please choose one under 10 MB.'
  return ''
}
