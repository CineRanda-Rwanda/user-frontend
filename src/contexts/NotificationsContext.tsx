import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import { toast } from 'react-toastify'
import { notificationsAPI } from '@/api/notifications'
import { NotificationsEnvelope, NotificationsQuery, UserNotification } from '@/types/notification'
import { DEFAULT_LIMIT } from '@/utils/constants'
import { isNotificationUnread } from '@/utils/notifications'
import { useAuth } from './AuthContext'

interface NotificationsContextValue {
  notifications: UserNotification[]
  unreadCount: number
  loading: boolean
  error: string | null
  refresh: (params?: NotificationsQuery) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

const calculateUnreadCount = (list: UserNotification[]) =>
  list.filter((notification) => isNotificationUnread(notification)).length

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inFlightRef = useRef(false)
  const lastFetchAtRef = useRef(0)

  const fetchNotifications = useCallback(async (params?: NotificationsQuery, options?: { silent?: boolean; force?: boolean }) => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const now = Date.now()
    // Throttle bursts: skip if last fetch < 2s and not forced
    if (!options?.force && now - lastFetchAtRef.current < 2000) {
      return
    }
    if (inFlightRef.current) {
      return
    }
    inFlightRef.current = true
    lastFetchAtRef.current = now

    const shouldToggleLoading = !options?.silent
    if (shouldToggleLoading) {
      setLoading(true)
    }

    try {
      const payload: NotificationsEnvelope = await notificationsAPI.getNotifications({
        limit: params?.limit ?? DEFAULT_LIMIT,
        page: params?.page ?? 1,
        status: params?.status
      })
      const nextNotifications = Array.isArray(payload.notifications) ? payload.notifications : []
      const fallbackUnread = calculateUnreadCount(nextNotifications)
      const serverUnread = typeof payload.unreadCount === 'number' ? payload.unreadCount : undefined
      const resolvedUnread = Math.max(serverUnread ?? 0, fallbackUnread)

      setNotifications(nextNotifications)
      setUnreadCount(resolvedUnread)
      setError(null)
    } catch (err) {
      console.error('Failed to load notifications:', err)
      setError('Unable to load notifications right now.')
    } finally {
      inFlightRef.current = false
      if (shouldToggleLoading) {
        setLoading(false)
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(undefined, { silent: false })
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [isAuthenticated, fetchNotifications])

  // No polling or focus listeners per request; rely on explicit refresh/useEffect above

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications((prev) => {
        const wasUnread = prev.some((notification) => notification._id === notificationId && isNotificationUnread(notification))
        if (wasUnread) {
          setUnreadCount((count) => Math.max(0, count - 1))
        }
        return prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: 'read', isRead: true, readAt: notification.readAt ?? new Date().toISOString() }
            : notification
        )
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      toast.error('Failed to update notification')
      throw err
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!unreadCount) {
      return
    }

    try {
      await notificationsAPI.markAllAsRead()
      setNotifications((prev) =>
        prev.map((notification) =>
          isNotificationUnread(notification)
            ? { ...notification, status: 'read', isRead: true, readAt: notification.readAt ?? new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
      toast.error('Failed to update notifications')
      throw err
    }
  }, [unreadCount])

  const refresh = useCallback(
    async (params?: NotificationsQuery) => {
      await fetchNotifications(params)
    },
    [fetchNotifications]
  )

  const value: NotificationsContextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAllAsRead
  }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
