import React, { useMemo, useRef, useState } from 'react'
import { FiBell, FiCheckCircle, FiExternalLink, FiRefreshCcw, FiTrash, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Loader from '@/components/common/Loader'
import { useNotifications } from '@/contexts/NotificationsContext'
import { formatRelativeTime, isNotificationUnread, sortNotificationsByDate } from '@/utils/notifications'
import styles from './NotificationOverlay.module.css'

interface NotificationOverlayProps {
  onClose: () => void
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ onClose }) => {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    archiveNotification,
    restoreNotification,
    deleteNotification,
    markUnreadAsReadOnExit,
    refresh
  } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const swipeStartXRef = useRef<number | null>(null)
  const swipeStartIdRef = useRef<string | null>(null)

  const sortedNotifications = useMemo(() => sortNotificationsByDate(notifications), [notifications])
  const filteredNotifications = useMemo(
    () => {
      if (filter === 'archived') {
        return sortedNotifications.filter((notification) => Boolean(notification.isArchived))
      }

      const inbox = sortedNotifications.filter((notification) => !notification.isArchived)
      if (filter === 'unread') {
        return inbox.filter((notification) => isNotificationUnread(notification))
      }

      return inbox
    },
    [filter, sortedNotifications]
  )

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false
    return Boolean(target.closest('button,a,input,label'))
  }

  const resolveActionUrl = (rawUrl?: string) => {
    if (!rawUrl) return null
    const url = rawUrl.trim()
    if (!url) return null
    if (url.startsWith('#')) return null
    if (url.startsWith('/')) return { kind: 'internal' as const, url }
    if (url.startsWith('?')) return { kind: 'internal' as const, url }
    if (/^https?:\/\//i.test(url)) return { kind: 'external' as const, url }

    // Heuristic: treat plain relative paths as internal (e.g. "watch/123").
    // Only treat as external when it looks like a domain ("www.x.com" or "x.com/path").
    const looksLikeDomain = /^www\./i.test(url) || /^[^/]+\.[^/]+/.test(url)
    if (looksLikeDomain) return { kind: 'external' as const, url: `https://${url}` }

    return { kind: 'internal' as const, url: `/${url}` }
  }

  const resolveInternalFromActionType = (actionType?: string, metadata?: Record<string, any>) => {
    const slug = (actionType || '').toLowerCase().trim()
    const metaId = metadata?.contentId ?? metadata?.id ?? metadata?._id

    if (!slug) return null
    if (slug === 'profile') return '/profile'
    if (slug === 'browse' || slug === 'home') return '/browse'
    if (slug === 'movies') return '/movies'
    if (slug === 'series') return '/series'
    if (slug === 'search') return '/search'
    if ((slug === 'content' || slug === 'details') && metaId) return `/content/${String(metaId)}`
    if (slug === 'watch' && metaId) return `/watch/${String(metaId)}`

    return '/browse'
  }

  const handleOpenNotification = (notification: { actionUrl?: string; actionType?: string; metadata?: Record<string, any> }) => {
    const internalFromType = resolveInternalFromActionType(notification.actionType, notification.metadata)
    if (internalFromType) {
      onClose()
      navigate(internalFromType)
      return
    }

    const resolved = resolveActionUrl(notification.actionUrl)
    if (!resolved) return

    if (resolved.kind === 'internal') {
      onClose()
      navigate(resolved.url)
      return
    }

    window.open(resolved.url, '_blank', 'noopener,noreferrer')
  }

  const handleMarkSingle = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleMarkUnread = async (notificationId: string) => {
    try {
      await markAsUnread(notificationId)
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification(notificationId)
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleRestore = async (notificationId: string) => {
    try {
      await restoreNotification(notificationId)
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleRefresh = async () => {
    try {
      await refresh()
    } catch {
      // Errors already surfaced by context toast
    }
  }

  const handleClose = () => {
    onClose()
    void markUnreadAsReadOnExit().catch(() => undefined)
  }

  return (
    <div className={styles.overlay}>
      <header className={styles.overlayHeader}>
        <div>
          <p className={styles.overlayLabel}>Live feed</p>
          <div className={styles.overlayTitleRow}>
            <h3>Notifications</h3>
            {unreadCount > 0 && <span className={styles.overlayCount}>{unreadCount}</span>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconButton} onClick={handleRefresh} title="Refresh notifications">
            <FiRefreshCcw />
          </button>
          <button type="button" className={styles.iconButton} onClick={handleClose} title="Close panel">
            <FiX />
          </button>
        </div>
      </header>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'unread' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'archived' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('archived')}
          >
            Trash
          </button>
        </div>
        <button
          type="button"
          className={styles.markAllButton}
          disabled={!unreadCount}
          onClick={handleMarkAll}
        >
          Mark all
        </button>
      </div>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.loaderWrap}>
            <Loader size="small" text="" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBell />
            <p>{filter === 'unread' ? 'No unread messages' : 'Nothing new just yet.'}</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredNotifications.map((notification) => {
              const unread = isNotificationUnread(notification)
              return (
                <li
                  key={notification._id}
                  className={`${styles.item} ${unread ? styles.itemUnread : ''}`}
                  onClick={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (!notification.actionUrl && !notification.actionType) return
                    handleOpenNotification(notification)
                  }}
                  onPointerDown={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    swipeStartXRef.current = event.clientX
                    swipeStartIdRef.current = notification._id
                  }}
                  onPointerUp={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (!swipeStartIdRef.current || swipeStartIdRef.current !== notification._id) return
                    if (swipeStartXRef.current == null) return
                    const deltaX = event.clientX - swipeStartXRef.current
                    swipeStartXRef.current = null
                    swipeStartIdRef.current = null
                    if (Math.abs(deltaX) < 45) return
                    void handleArchive(notification._id)
                  }}
                >
                  <div className={styles.itemMain}>
                    <p className={styles.itemTitle}>{notification.title}</p>
                    <p className={styles.itemMessage}>{notification.message}</p>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemTime}>{formatRelativeTime(notification.createdAt)}</span>
                    {(notification.actionUrl || notification.actionType) && (
                      <button
                        type="button"
                        className={styles.itemLink}
                        onClick={() => handleOpenNotification(notification)}
                        title={notification.actionLabel || 'Open details'}
                      >
                        <FiExternalLink />
                      </button>
                    )}
                    {filter === 'archived' ? (
                      <>
                        <button
                          type="button"
                          className={styles.itemMark}
                          onClick={() => handleRestore(notification._id)}
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          className={styles.itemDanger}
                          onClick={() => handleDelete(notification._id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.itemTrash}
                          onClick={() => handleArchive(notification._id)}
                          title="Move to trash"
                        >
                          <FiTrash />
                        </button>
                        {unread ? (
                          <button
                            type="button"
                            className={styles.itemMark}
                            onClick={() => handleMarkSingle(notification._id)}
                          >
                            <FiCheckCircle />
                            Mark read
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.itemMark}
                            onClick={() => handleMarkUnread(notification._id)}
                          >
                            Mark unread
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default NotificationOverlay
