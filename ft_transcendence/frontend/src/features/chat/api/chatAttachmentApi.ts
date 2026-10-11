import { uploadRequest } from '../../../api/apiClient'
import type { MessageAttachment } from '../types/Message'

export function uploadChatAttachment(
  channelId: string,
  file: File,
  onProgress: (value: number) => void,
) {
  return uploadRequest<MessageAttachment>(
    `/uploads/chat/${channelId}`,
    file,
    onProgress,
  )
}
