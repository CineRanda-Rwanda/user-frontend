import React from 'react'
import { FiSearch, FiFilm, FiAlertCircle } from 'react-icons/fi'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  type?: 'search' | 'content' | 'error'
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'search',
  title,
  message,
  action
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <FiSearch />
      case 'content':
        return <FiFilm />
      case 'error':
        return <FiAlertCircle />
      default:
        return <FiSearch />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'search':
        return 'No results found'
      case 'content':
        return 'No content available'
      case 'error':
        return 'Something went wrong'
      default:
        return 'Nothing to show'
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return 'Try adjusting your search or filters to find what you\'re looking for.'
      case 'content':
        return 'Check back later for new content.'
      case 'error':
        return 'Please try again or contact support if the problem persists.'
      default:
        return ''
    }
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{getIcon()}</div>
      <h3 className={styles.title}>{title || getDefaultTitle()}</h3>
      <p className={styles.message}>{message || getDefaultMessage()}</p>
      {action && (
        <button className={styles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
