import React from 'react'
import { FiSearch, FiFilm, FiAlertCircle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
        return t('emptyState.search.title')
      case 'content':
        return t('emptyState.content.title')
      case 'error':
        return t('emptyState.error.title')
      default:
        return t('errors.generic')
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return t('emptyState.search.message')
      case 'content':
        return t('emptyState.content.message')
      case 'error':
        return t('emptyState.error.message')
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
