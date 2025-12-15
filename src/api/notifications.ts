import api from './axios'
import { NotificationsEnvelope, NotificationsQuery, UserNotification } from '@/types/notification'

const normalizeNotificationsResponse = (payload: any): NotificationsEnvelope => {
  const root = payload?.data ?? payload
  const notifications = (root?.notifications ?? root?.data?.notifications ?? root?.items ?? []) as UserNotification[]
  const unreadCount = root?.unreadCount ?? root?.meta?.unreadCount ?? 0
  const pagination = root?.pagination ?? root?.meta?.pagination

  return {
    notifications,
    unreadCount: typeof unreadCount === 'number' ? unreadCount : Number(unreadCount) || 0,
    pagination
  }
}

export const notificationsAPI = {
  getNotifications: async (params?: NotificationsQuery): Promise<NotificationsEnvelope> => {
    const response = await api.get('/notifications', { params })
    return normalizeNotificationsResponse(response.data)
  },

  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all')
}
