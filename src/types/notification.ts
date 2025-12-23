export type NotificationStatus = 'read' | 'unread' | string

export type NotificationMetadata = Record<string, any>

export interface UserNotification {
  _id: string
  notificationId?: string
  title: string
  message: string
  type?: string
  actionType?: string
  status?: NotificationStatus
  category?: string
  actionLabel?: string
  actionUrl?: string
  readAt?: string | null
  createdAt: string
  receivedAt?: string
  updatedAt?: string
  metadata?: NotificationMetadata
  priority?: 'low' | 'medium' | 'high'
  isRead?: boolean
  isArchived?: boolean
  archivedAt?: string | null
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
  unreadOnly?: boolean
  includeArchived?: boolean
  archivedOnly?: boolean
}

export interface NotificationsEnvelope {
  notifications: UserNotification[]
  unreadCount: number
  pagination?: NotificationsPagination
}
