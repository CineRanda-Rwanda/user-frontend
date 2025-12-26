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

// Unread badge represents unread items in the inbox (non-archived).
const calculateUnreadCount = (list: UserNotification[]) =>
  list.filter((notification) => !notification.isArchived).filter((notification) => isNotificationUnread(notification)).length

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualUnreadIds, setManualUnreadIds] = useState<Set<string>>(() => new Set())
  const inFlightRef = useRef(false)
  const lastFetchAtRef = useRef(0)

  // Manual-unread is a temporary “keep unread for this exit” intent.
  // It should not persist across reloads/sessions.
  useEffect(() => {
    if (!isAuthenticated) {
      setManualUnreadIds(new Set())
    }
  }, [isAuthenticated])

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
      const resolvedUnread = calculateUnreadCount(nextNotifications)

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
        const wasUnread = prev.some(
          (notification) => notification._id === notificationId && !notification.isArchived && isNotificationUnread(notification)
        )
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
        return next
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
      // Only affect inbox items; trash can keep its own unread state.
      setNotifications((prev) =>
        prev.map((notification) =>
          !notification.isArchived && isNotificationUnread(notification)
            ? { ...notification, status: 'read', isRead: true, readAt: notification.readAt ?? new Date().toISOString() }
            : notification
        )
      )
      setUnreadCount(0)

      setManualUnreadIds((prev) => {
        if (!prev.size) return prev
        const next = new Set<string>()
        return next
      })
    } catch (err) {
      console.error('Failed to mark notifications as read:', err)
      toast.error('Failed to update notifications')
      throw err
    }
  }, [unreadCount])

  const markAsUnread = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.markAsUnread(notificationId)
      let delta = 0
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id !== notificationId) return notification
          if (!isNotificationUnread(notification)) {
            // Unread badge tracks inbox only.
            delta = notification.isArchived ? 0 : 1
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
        return next
      })
    } catch (err) {
      console.error('Failed to mark notification as unread:', err)
      toast.error('Failed to update notification')
      throw err
    }
  }, [])

  const archiveNotification = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.archiveNotification(notificationId)
      const archivedTimestamp = new Date().toISOString()
      let unreadDelta = 0
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id !== notificationId) return notification
          // Moving an unread inbox item to trash should reduce the inbox unread badge.
          if (!notification.isArchived && isNotificationUnread(notification)) unreadDelta = -1
          return {
            ...notification,
            isArchived: true,
            archivedAt: archivedTimestamp
          }
        })
      )
      if (unreadDelta) {
        setUnreadCount((count) => Math.max(0, count + unreadDelta))
      }
    } catch (err) {
      console.error('Failed to archive notification:', err)
      toast.error('Failed to move notification to archive')
      throw err
    }
  }, [])

  const restoreNotification = useCallback(async (notificationId: string) => {
    if (!notificationId) return

    try {
      await notificationsAPI.restoreNotification(notificationId)
      let unreadDelta = 0
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id !== notificationId) return notification
          // If it's unread in trash, restoring brings it back into inbox unread count.
          if (notification.isArchived && isNotificationUnread(notification)) unreadDelta = 1
          return { ...notification, isArchived: false, archivedAt: null }
        })
      )

      if (unreadDelta) {
        setUnreadCount((count) => count + unreadDelta)
      }
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
          // Only adjust inbox unread badge when deleting an unread inbox item.
          removedUnread = !notification.isArchived && isNotificationUnread(notification)
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
        return next
      })
    } catch (err) {
      console.error('Failed to delete notification:', err)
      toast.error('Failed to delete notification')
      throw err
    }
  }, [])

  const markUnreadAsReadOnExit = useCallback(async () => {
    const manualSnapshot = manualUnreadIds
    const unreadNow = notifications.filter((notification) => isNotificationUnread(notification))

    if (!unreadNow.length) {
      if (manualSnapshot.size) setManualUnreadIds(new Set())
      return
    }

    const nowIso = new Date().toISOString()
    const unreadNonManual = unreadNow.filter((n) => !manualSnapshot.has(n._id))
    const manualUnread = unreadNow.filter((n) => manualSnapshot.has(n._id))
    const inboxMarkedCount = unreadNonManual.filter((n) => !n.isArchived).length

    // Optimistic UI update: mark everything read except the current manual-unread set.
    setNotifications((prev) =>
      prev.map((n) => {
        if (!isNotificationUnread(n)) return n
        if (manualSnapshot.has(n._id)) return n
        return { ...n, status: 'read', isRead: true, readAt: n.readAt ?? nowIso }
      })
    )
    if (inboxMarkedCount) {
      setUnreadCount((count) => Math.max(0, count - inboxMarkedCount))
    }

    // Persist to backend using bulk "read all" for reliability, then restore manual ones to unread.
    const bulkResult = await Promise.allSettled([notificationsAPI.markAllAsRead()])
    const bulkFailed = bulkResult.some((r) => r.status === 'rejected')

    const restoreResults = manualUnread.length
      ? await Promise.allSettled(manualUnread.map((n) => notificationsAPI.markAsUnread(n._id)))
      : []
    const restoreFailed = restoreResults.some((r) => r.status === 'rejected')

    if (bulkFailed || restoreFailed) {
      toast.error('Some notifications could not be synced.')
    }

    // One-time exemption: next exit treats these normally.
    if (manualSnapshot.size) setManualUnreadIds(new Set())
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
