import React, { useMemo, useState } from 'react'
import { FiBell, FiCheckCircle, FiInbox, FiRefreshCcw } from 'react-icons/fi'
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
  const { notifications, unreadCount, loading, error, refresh, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const sortedNotifications = useMemo(
    () => sortNotificationsByDate(notifications),
    [notifications]
  )

  const filteredNotifications = useMemo(
    () => (filter === 'unread' ? sortedNotifications.filter((notification) => isNotificationUnread(notification)) : sortedNotifications),
    [filter, sortedNotifications]
  )

  const handleMarkSingle = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch {
      // Toast handled inside context
    }
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

  const emptyStateTitle = filter === 'unread' ? 'No unread notifications' : 'No notifications yet'
  const emptyStateCopy =
    filter === 'unread'
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
          </div>
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
              const cardClasses = [styles.card, unread ? styles.cardUnread : ''].filter(Boolean).join(' ')
              return (
                <li key={notification._id} className={cardClasses}>
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
                        <a
                          className={styles.actionLink}
                          href={notification.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {notification.actionLabel || 'View details'}
                        </a>
                      )}
                      {unread && (
                        <button
                          type="button"
                          className={styles.markButton}
                          onClick={() => handleMarkSingle(notification._id)}
                        >
                          Mark as read
                        </button>
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
