export function formatDate (date) {
  if (!date) {
    return ''
  }
  return new Date(date).toLocaleDateString('fr-CH', { timeZone: 'UTC' })
}

export function formatDuration (seconds) {
  if (!Number.isFinite(seconds)) {
    return ''
  }

  const minutes = Math.floor(seconds / 60)
  const rest = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${minutes}:${rest}`
}
