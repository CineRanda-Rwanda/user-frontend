import React, { useMemo, useRef, useState } from 'react'
import { FiBell, FiCheckCircle, FiExternalLink, FiRefreshCcw, FiTrash, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Loader from '@/components/common/Loader'
import { useNotifications } from '@/contexts/NotificationsContext'
import { formatRelativeTime, isNotificationUnread, sortNotificationsByDate } from '@/utils/notifications'
import styles from './NotificationOverlay.module.css'

interface NotificationOverlayProps {
  onClose: () => void
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ onClose }) => {
  const { t } = useTranslation()
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
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set())
  const swipeStartXRef = useRef<number | null>(null)
  const swipeStartIdRef = useRef<string | null>(null)

  const EXIT_ANIMATION_MS = 420

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
    if (!(target instanceof Element)) return false
    return Boolean(target.closest('button,a,input,label'))
  }

  const trashCount = useMemo(
    () => sortedNotifications.filter((notification) => Boolean(notification.isArchived) && isNotificationUnread(notification)).length,
    [sortedNotifications]
  )

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

  const startExit = (notificationId: string, action: () => Promise<void>) => {
    setExitingIds((prev) => {
      if (prev.has(notificationId)) return prev
      const next = new Set(prev)
      next.add(notificationId)
      return next
    })

    window.setTimeout(() => {
      void action().finally(() => {
        setExitingIds((prev) => {
          if (!prev.has(notificationId)) return prev
          const next = new Set(prev)
          next.delete(notificationId)
          return next
        })
      })
    }, EXIT_ANIMATION_MS)
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
    <div
      id="notifications-panel"
      data-notification-overlay
      className={styles.overlay}
      role="dialog"
      aria-label={t('notifications.page.title')}
      tabIndex={-1}
    >
      <header className={styles.overlayHeader}>
        <div>
          <p className={styles.overlayLabel}>{t('notifications.overlay.label')}</p>
          <div className={styles.overlayTitleRow}>
            <h3>{t('notifications.page.title')}</h3>
            {unreadCount > 0 && <span className={styles.overlayCount}>{unreadCount}</span>}
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleRefresh}
            title={t('notifications.overlay.tooltips.refresh')}
            aria-label={t('notifications.overlay.tooltips.refresh')}
          >
            <FiRefreshCcw aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleClose}
            title={t('notifications.overlay.tooltips.close')}
            aria-label={t('notifications.overlay.tooltips.close')}
          >
            <FiX aria-hidden="true" />
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
            {t('notifications.filters.all')}
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'unread' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            {t('notifications.filters.unread')}
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'archived' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('archived')}
          >
            {t('notifications.filters.trash')}
            {trashCount > 0 && <span className={styles.filterCount}>{trashCount}</span>}
          </button>
        </div>
        <button
          type="button"
          className={styles.markAllButton}
          disabled={!unreadCount}
          onClick={handleMarkAll}
        >
          {t('notifications.overlay.actions.markAll')}
        </button>
      </div>

      <div className={styles.body}>
        {loading ? (
          <div className={styles.loaderWrap}>
            <Loader size="small" text="" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBell aria-hidden="true" />
            <p>
              {filter === 'unread'
                ? t('notifications.overlay.empty.unread')
                : t('notifications.overlay.empty.default')}
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredNotifications.map((notification) => {
              const unread = isNotificationUnread(notification)
              const actionable =
                filter !== 'archived' &&
                !exitingIds.has(notification._id) &&
                Boolean(notification.actionUrl || notification.actionType)

              return (
                <li
                  key={notification._id}
                  className={`${styles.item} ${unread ? styles.itemUnread : ''} ${exitingIds.has(notification._id) ? styles.itemExiting : ''}`}
                  role={actionable ? 'button' : undefined}
                  tabIndex={actionable ? 0 : -1}
                  aria-label={actionable ? notification.title : undefined}
                  onClick={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (!notification.actionUrl && !notification.actionType) return
                    handleOpenNotification(notification)
                  }}
                  onKeyDown={(event) => {
                    if (!actionable) return
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    handleOpenNotification(notification)
                  }}
                  onPointerDown={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (exitingIds.has(notification._id)) return
                    swipeStartXRef.current = event.clientX
                    swipeStartIdRef.current = notification._id
                  }}
                  onPointerUp={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (exitingIds.has(notification._id)) return
                    if (!swipeStartIdRef.current || swipeStartIdRef.current !== notification._id) return
                    if (swipeStartXRef.current == null) return
                    const deltaX = event.clientX - swipeStartXRef.current
                    swipeStartXRef.current = null
                    swipeStartIdRef.current = null
                    if (Math.abs(deltaX) < 45) return
                    startExit(notification._id, () => handleArchive(notification._id))
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
                        title={notification.actionLabel || t('notifications.actions.viewDetails')}
                        aria-label={notification.actionLabel || t('notifications.actions.viewDetails')}
                      >
                        <FiExternalLink aria-hidden="true" />
                      </button>
                    )}
                    {filter === 'archived' ? (
                      <>
                        <button
                          type="button"
                          className={styles.itemMark}
                          onClick={() => startExit(notification._id, () => handleRestore(notification._id))}
                          disabled={exitingIds.has(notification._id)}
                        >
                          {t('notifications.actions.restore')}
                        </button>
                        <button
                          type="button"
                          className={styles.itemDanger}
                          onClick={() => startExit(notification._id, () => handleDelete(notification._id))}
                          disabled={exitingIds.has(notification._id)}
                        >
                          {t('notifications.actions.deletePermanently')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.itemTrash}
                          onClick={() => startExit(notification._id, () => handleArchive(notification._id))}
                          disabled={exitingIds.has(notification._id)}
                          title={t('notifications.actions.moveToTrash')}
                          aria-label={t('notifications.actions.moveToTrash')}
                        >
                          <FiTrash aria-hidden="true" />
                        </button>
                        {unread ? (
                          <button
                            type="button"
                            className={styles.itemMark}
                            onClick={() => handleMarkSingle(notification._id)}
                            disabled={exitingIds.has(notification._id)}
                          >
                            <FiCheckCircle aria-hidden="true" />
                            {t('notifications.actions.markAsRead')}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.itemMark}
                            onClick={() => handleMarkUnread(notification._id)}
                            disabled={exitingIds.has(notification._id)}
                          >
                            {t('notifications.actions.markAsUnread')}
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
