export function timeAgo(iso?: string): string {
  if (!iso) return 'Hace un momento'
  const timestamp = new Date(iso).getTime()
  if (Number.isNaN(timestamp)) return 'Hace un momento'

  const hours = (Date.now() - timestamp) / 3_600_000
  if (hours < 1) return 'Hace un momento'
  if (hours < 24) return `Hace ${Math.round(hours)}h`
  return `Hace ${Math.round(hours / 24)}d`
}

export function formatTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date()
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}
