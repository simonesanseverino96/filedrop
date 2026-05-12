import { formatDistanceToNow } from 'date-fns'

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  if (diff <= 24 * 3600 * 1000) {
    const hours = Math.floor(diff / 3600000)
    return `Expires in ${hours} hour${hours === 1 ? '' : 's'}`
  }
  return 'Expires ' + formatDistanceToNow(new Date(expiresAt), { addSuffix: true })
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
