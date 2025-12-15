export type NotificationStatus = 'read' | 'unread' | string

export type NotificationMetadata = Record<string, any>

export interface UserNotification {
  _id: string
  title: string
  message: string
  type?: string
  status?: NotificationStatus
  category?: string
  actionLabel?: string
  actionUrl?: string
  readAt?: string
  createdAt: string
  updatedAt?: string
  metadata?: NotificationMetadata
  priority?: 'low' | 'medium' | 'high'
  isRead?: boolean
}

export interface NotificationsPagination {
  total?: number
  page?: number
  limit?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface NotificationsQuery {
  page?: number
  limit?: number
  status?: NotificationStatus | 'all'
}

export interface NotificationsEnvelope {
  notifications: UserNotification[]
  unreadCount: number
  pagination?: NotificationsPagination
}
