// Same limits as the backend upload module: JPG, PNG or WEBP up to 5 MB.
export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImage(file: File) {
  if (!IMAGE_TYPES.includes(file.type))
    return 'Unsupported file. Please choose a PNG, JPEG or WEBP image.'
  if (file.size > MAX_IMAGE_BYTES)
    return 'That image is too large. Please choose one under 5 MB.'
  return ''
}
