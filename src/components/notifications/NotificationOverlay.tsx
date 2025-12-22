import React, { useMemo, useState } from 'react'
import { FiBell, FiCheckCircle, FiExternalLink, FiMaximize2, FiMinimize2, FiRefreshCcw, FiX } from 'react-icons/fi'
import Loader from '@/components/common/Loader'
import { useNotifications } from '@/contexts/NotificationsContext'
import { formatRelativeTime, isNotificationUnread, sortNotificationsByDate } from '@/utils/notifications'
import styles from './NotificationOverlay.module.css'

interface NotificationOverlayProps {
  onClose: () => void
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ onClose }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [expanded, setExpanded] = useState(true)

  const sortedNotifications = useMemo(() => sortNotificationsByDate(notifications), [notifications])
  const filteredNotifications = useMemo(
    () => (filter === 'unread' ? sortedNotifications.filter((notification) => isNotificationUnread(notification)) : sortedNotifications),
    [filter, sortedNotifications]
  )

  const visibleLimit = expanded ? 6 : 3
  const visibleNotifications = filteredNotifications.slice(0, visibleLimit)
  const hasMore = filteredNotifications.length > visibleLimit

  const handleMarkSingle = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
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

  return (
    <div className={`${styles.overlay} ${expanded ? styles.overlayExpanded : ''}`}>
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
          <button type="button" className={styles.iconButton} onClick={onClose} title="Close panel">
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
        ) : visibleNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <FiBell />
            <p>{filter === 'unread' ? 'No unread messages' : 'Nothing new just yet.'}</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {visibleNotifications.map((notification) => {
              const unread = isNotificationUnread(notification)
              return (
                <li key={notification._id} className={`${styles.item} ${unread ? styles.itemUnread : ''}`}>
                  <div className={styles.itemMain}>
                    <p className={styles.itemTitle}>{notification.title}</p>
                    <p className={styles.itemMessage}>{notification.message}</p>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemTime}>{formatRelativeTime(notification.createdAt)}</span>
                    {notification.actionUrl && (
                      <a
                        className={styles.itemLink}
                        href={notification.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={notification.actionLabel || 'Open details'}
                      >
                        <FiExternalLink />
                      </a>
                    )}
                    {unread && (
                      <button
                        type="button"
                        className={styles.itemMark}
                        onClick={() => handleMarkSingle(notification._id)}
                      >
                        <FiCheckCircle />
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        {hasMore && (
          <p className={styles.moreHint}>Showing {visibleLimit} of {filteredNotifications.length}</p>
        )}
      </div>

      <footer className={styles.footer}>
        <button type="button" className={styles.expandButton} onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <>
              <FiMinimize2 /> Collapse
            </>
          ) : (
            <>
              <FiMaximize2 /> Expand
            </>
          )}
        </button>
      </footer>
    </div>
  )
}

export default NotificationOverlay
