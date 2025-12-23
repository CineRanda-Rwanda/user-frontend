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
  markAsUnread: (notificationId: string) => Promise<void>
  archiveNotification: (notificationId: string) => Promise<void>
  restoreNotification: (notificationId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  markUnreadAsReadOnExit: () => Promise<void>
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
  const [manualUnreadIds, setManualUnreadIds] = useState<Set<string>>(() => new Set())
  const inFlightRef = useRef(false)
  const lastFetchAtRef = useRef(0)

  const manualUnreadStorageKey = 'notifications.manualUnreadIds'

  useEffect(() => {
    if (!isAuthenticated) {
      setManualUnreadIds(new Set())
      try {
        localStorage.removeItem(manualUnreadStorageKey)
      } catch {
        // ignore
      }
      return
    }

    try {
      const raw = localStorage.getItem(manualUnreadStorageKey)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setManualUnreadIds(new Set(parsed.filter((id) => typeof id === 'string')))
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated])

  const persistManualUnreadIds = useCallback((next: Set<string>) => {
    try {
      localStorage.setItem(manualUnreadStorageKey, JSON.stringify(Array.from(next)))
    } catch {
      // ignore
    }
  }, [])

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
        // Aim to show "all" notifications in the UI without paging.
        // If the backend caps this, the UI will still render everything returned.
        limit: params?.limit ?? Math.max(DEFAULT_LIMIT, 200),
        page: params?.page ?? 1,
        status: params?.status,
        unreadOnly: params?.unreadOnly,
        includeArchived: params?.includeArchived ?? true,
        archivedOnly: params?.archivedOnly
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

      setManualUnreadIds((prev) => {
        if (!prev.has(notificationId)) return prev
        const next = new Set(prev)
        next.delete(notificationId)
        persistManualUnreadIds(next)
        return next
      })
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      toast.error('Failed to update notification')
      throw err
    }
  }, [persistManualUnreadIds])

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

      setManualUnreadIds((prev) => {
        if (!prev.size) return prev
        const next = new Set<string>()
        persistManualUnreadIds(next)
        return next
      })
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
      toast.error('Failed to update notifications')
      throw err
    }
  }, [persistManualUnreadIds, unreadCount])

  const markAsUnread = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.markAsUnread(notificationId)
      let delta = 0
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id !== notificationId) return notification
          if (!isNotificationUnread(notification)) {
            delta = 1
          }
          const { readAt: _omit, ...rest } = notification
          return { ...rest, status: 'unread', isRead: false }
        })
      )
      if (delta) {
        setUnreadCount((count) => count + delta)
      }

      setManualUnreadIds((prev) => {
        if (prev.has(notificationId)) return prev
        const next = new Set(prev)
        next.add(notificationId)
        persistManualUnreadIds(next)
        return next
      })
    } catch (err) {
      console.error('Failed to mark notification as unread:', err)
      toast.error('Failed to update notification')
      throw err
    }
  }, [persistManualUnreadIds])

  const archiveNotification = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.archiveNotification(notificationId)
      const archivedTimestamp = new Date().toISOString()
      let unreadDelta = 0
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id !== notificationId) return notification
          if (isNotificationUnread(notification)) {
            unreadDelta = -1
          }
          return {
            ...notification,
            isArchived: true,
            archivedAt: archivedTimestamp,
            status: 'read',
            isRead: true,
            readAt: notification.readAt ?? archivedTimestamp
          }
        })
      )
      if (unreadDelta) {
        setUnreadCount((count) => Math.max(0, count + unreadDelta))
      }

      setManualUnreadIds((prev) => {
        if (!prev.has(notificationId)) return prev
        const next = new Set(prev)
        next.delete(notificationId)
        persistManualUnreadIds(next)
        return next
      })
    } catch (err) {
      console.error('Failed to archive notification:', err)
      toast.error('Failed to move notification to archive')
      throw err
    }
  }, [persistManualUnreadIds])

  const restoreNotification = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.restoreNotification(notificationId)
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isArchived: false, archivedAt: null }
            : notification
        )
      )
    } catch (err) {
      console.error('Failed to restore notification:', err)
      toast.error('Failed to restore notification')
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.deleteNotification(notificationId)
      let removedUnread = false
      setNotifications((prev) =>
        prev.filter((notification) => {
          if (notification._id !== notificationId) return true
          removedUnread = isNotificationUnread(notification)
          return false
        })
      )
      if (removedUnread) {
        setUnreadCount((count) => Math.max(0, count - 1))
      }

      setManualUnreadIds((prev) => {
        if (!prev.has(notificationId)) return prev
        const next = new Set(prev)
        next.delete(notificationId)
        persistManualUnreadIds(next)
        return next
      })
    } catch (err) {
      console.error('Failed to delete notification:', err)
      toast.error('Failed to delete notification')
      throw err
    }
  }, [persistManualUnreadIds])

  const markUnreadAsReadOnExit = useCallback(async () => {
    const toMarkRead = notifications
      .filter((notification) => !notification.isArchived)
      .filter((notification) => isNotificationUnread(notification))
      .map((notification) => notification._id)
      .filter((id) => !manualUnreadIds.has(id))

    if (!toMarkRead.length) return

    await Promise.all(
      toMarkRead.map((id) =>
        notificationsAPI
          .markAsRead(id)
          .then(() => {
            setNotifications((prev) =>
              prev.map((n) => (n._id === id ? { ...n, status: 'read', isRead: true, readAt: n.readAt ?? new Date().toISOString() } : n))
            )
          })
          .catch(() => undefined)
      )
    )

    setUnreadCount((count) => Math.max(0, count - toMarkRead.length))
  }, [manualUnreadIds, notifications])

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
    markAllAsRead,
    markAsUnread,
    archiveNotification,
    restoreNotification,
    deleteNotification,
    markUnreadAsReadOnExit
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
