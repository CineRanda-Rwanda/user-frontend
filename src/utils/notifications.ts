import { UserNotification } from '@/types/notification'

export const isNotificationUnread = (notification?: UserNotification | null): boolean => {
  if (!notification) return false
  if (typeof notification.isRead === 'boolean') {
    return !notification.isRead
  }
  if (notification.status) {
    return notification.status.toLowerCase() !== 'read'
  }
  return !notification.readAt
}

export const formatRelativeTime = (timestamp?: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

export const sortNotificationsByDate = (list: UserNotification[]) =>
  [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
