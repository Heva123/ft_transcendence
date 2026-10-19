export function formatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()))
    return value
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
