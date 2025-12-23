import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FiBell, FiCheckCircle, FiInbox, FiRefreshCcw, FiTrash } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Loader from '@/components/common/Loader'
import Button from '@/components/common/Button'
import { useNotifications } from '@/contexts/NotificationsContext'
import { formatCurrency } from '@/utils/formatters'
import { formatRelativeTime, isNotificationUnread, sortNotificationsByDate } from '@/utils/notifications'
import styles from './Notifications.module.css'

const resolveTypeClass = (type?: string) => {
  const base = styles.typeBadge
  if (!type) return `${base} ${styles.typeSystem}`

  const slug = type.toLowerCase()
  if (slug.includes('transaction') || slug.includes('wallet') || slug.includes('payment')) {
    return `${base} ${styles.typeTransaction}`
  }
  if (slug.includes('bonus') || slug.includes('reward')) {
    return `${base} ${styles.typeReward}`
  }
  if (slug.includes('promo') || slug.includes('offer')) {
    return `${base} ${styles.typePromo}`
  }
  if (slug.includes('security') || slug.includes('auth')) {
    return `${base} ${styles.typeSecurity}`
  }
  return `${base} ${styles.typeSystem}`
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    restoreNotification,
    deleteNotification,
    markUnreadAsReadOnExit
  } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set())
  const swipeStartXRef = useRef<number | null>(null)
  const swipeStartIdRef = useRef<string | null>(null)

  const EXIT_ANIMATION_MS = 420

  const sortedNotifications = useMemo(
    () => sortNotificationsByDate(notifications),
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    if (filter === 'archived') {
      return sortedNotifications.filter((notification) => Boolean(notification.isArchived))
    }

    const inbox = sortedNotifications.filter((notification) => !notification.isArchived)
    if (filter === 'unread') {
      return inbox.filter((notification) => isNotificationUnread(notification))
    }
    return inbox
  }, [filter, sortedNotifications])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [filter])

  useEffect(() => {
    return () => {
      void markUnreadAsReadOnExit().catch(() => undefined)
    }
  }, [markUnreadAsReadOnExit])

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
    const resolved = resolveActionUrl(notification.actionUrl)

    if (internalFromType) {
      navigate(internalFromType)
      return
    }

    if (!resolved) return

    if (resolved.kind === 'internal') {
      navigate(resolved.url)
      return
    }

    window.open(resolved.url, '_blank', 'noopener,noreferrer')
  }

  const handleMarkSingle = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch {
      // Toast handled inside context
    }
  }

  const handleMarkUnread = async (notificationId: string) => {
    try {
      await markAsUnread(notificationId)
    } catch {
      // Toast handled inside context
    }
  }

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification(notificationId)
    } catch {
      // Toast handled inside context
    }
  }

  const handleRestore = async (notificationId: string) => {
    try {
      await restoreNotification(notificationId)
    } catch {
      // Toast handled inside context
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
    } catch {
      // Toast handled inside context
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

  const toggleSelected = (notificationId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(notificationId)) {
        next.delete(notificationId)
      } else {
        next.add(notificationId)
      }
      return next
    })
  }

  const handleMarkSelectedUnread = async () => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return

    await Promise.all(
      ids.map((id) =>
        markAsUnread(id).catch(() => undefined)
      )
    )
    setSelectedIds(new Set())
  }

  const handleMarkAll = async () => {
    try {
      await markAllAsRead()
    } catch {
      // Toast handled inside context
    }
  }

  const handleRefresh = async () => {
    try {
      await refresh()
    } catch {
      // Toast handled inside context
    }
  }

  const emptyStateTitle =
    filter === 'archived'
      ? 'Trash is empty'
      : filter === 'unread'
        ? 'No unread notifications'
        : 'No notifications yet'
  const emptyStateCopy =
    filter === 'archived'
      ? 'Items you move to trash will show up here.'
      : filter === 'unread'
        ? 'Take a breather—you are fully caught up.'
        : 'We will ping you when you earn bonuses, unlock titles, or need to take action.'

  return (
    <Layout>
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Inbox</p>
            <h1>Notifications</h1>
            <p className={styles.subtext}>
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" size="small" onClick={handleRefresh} icon={<FiRefreshCcw />}>
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button variant="secondary" size="small" onClick={handleMarkAll} icon={<FiCheckCircle />}>
                Mark all read
              </Button>
            )}
          </div>
        </header>

        <div className={styles.filterBar}>
          <div className={styles.filterToggle}>
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
              {unreadCount > 0 && <span className={styles.filterCount}>{unreadCount}</span>}
            </button>
            <button
              type="button"
              className={`${styles.filterButton} ${filter === 'archived' ? styles.filterButtonActive : ''}`}
              onClick={() => setFilter('archived')}
            >
              Trash
              {trashCount > 0 && <span className={styles.filterCount}>{trashCount}</span>}
            </button>
          </div>

          {filter !== 'archived' && (
            <div className={styles.bulkActions}>
              <button
                type="button"
                className={styles.markButton}
                disabled={selectedIds.size === 0}
                onClick={handleMarkSelectedUnread}
              >
                Mark selected unread
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  className={styles.clearSelection}
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {loading ? (
          <div className={styles.loaderWrap}>
            <Loader text="Loading your notifications" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiInbox />
            <h2>{emptyStateTitle}</h2>
            <p>{emptyStateCopy}</p>
            <Button variant="primary" size="small" onClick={handleRefresh} icon={<FiBell />}>
              Check again
            </Button>
          </div>
        ) : (
          <ul className={styles.list}>
            {filteredNotifications.map((notification) => {
              const unread = isNotificationUnread(notification)
              const cardClasses = [styles.card, unread ? styles.cardUnread : '', notification.isArchived ? styles.cardArchived : '']
                .filter(Boolean)
                .join(' ')
              return (
                <li
                  key={notification._id}
                  className={`${cardClasses} ${exitingIds.has(notification._id) ? styles.cardExiting : ''}`}
                  onClick={(event) => {
                    if (filter === 'archived') return
                    if (isInteractiveTarget(event.target)) return
                    if (!notification.actionUrl && !notification.actionType) return
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
                    if (Math.abs(deltaX) < 60) return
                    startExit(notification._id, () => handleArchive(notification._id))
                  }}
                >
                  {filter !== 'archived' && (
                    <label className={styles.selectBox}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification._id)}
                        onChange={() => toggleSelected(notification._id)}
                      />
                      <span className={styles.selectIndicator} />
                    </label>
                  )}
                  <div className={styles.cardIcon}>{unread ? <FiBell /> : <FiCheckCircle />}</div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={resolveTypeClass(notification.type)}>
                        {notification.type?.replace(/[-_]/g, ' ') || 'System'}
                      </span>
                      <span className={styles.timestamp}>{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <h3>{notification.title}</h3>
                    <p className={styles.message}>{notification.message}</p>
                    {typeof notification.metadata?.amount === 'number' && (
                      <p className={styles.highlight}>Amount: {formatCurrency(notification.metadata.amount)}</p>
                    )}
                    <div className={styles.cardActions}>
                      {notification.actionUrl && (
                        <button
                          type="button"
                          className={styles.actionLink}
                          onClick={() => handleOpenNotification(notification)}
                        >
                          {notification.actionLabel || 'View details'}
                        </button>
                      )}

                      {filter === 'archived' ? (
                        <>
                          <button
                            type="button"
                            className={styles.markButton}
                            onClick={() => startExit(notification._id, () => handleRestore(notification._id))}
                            disabled={exitingIds.has(notification._id)}
                          >
                            Restore
                          </button>
                          <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={() => startExit(notification._id, () => handleDelete(notification._id))}
                            disabled={exitingIds.has(notification._id)}
                          >
                            Delete permanently
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={styles.trashButton}
                            onClick={() => startExit(notification._id, () => handleArchive(notification._id))}
                            disabled={exitingIds.has(notification._id)}
                            title="Move to trash"
                          >
                            <FiTrash />
                          </button>
                          {unread ? (
                            <button
                              type="button"
                              className={styles.markButton}
                              onClick={() => handleMarkSingle(notification._id)}
                              disabled={exitingIds.has(notification._id)}
                            >
                              Mark as read
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={styles.markButton}
                              onClick={() => handleMarkUnread(notification._id)}
                              disabled={exitingIds.has(notification._id)}
                            >
                              Mark unread
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </Layout>
  )
}

export default NotificationsPage
