import React, { useEffect, ReactNode } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'medium' | 'large'
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const contentClass = size === 'large'
    ? `${styles['modal-content']} ${styles['modal-content-large']}`
    : styles['modal-content']

  return (
    <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
      <div className={contentClass}>
        {title && (
          <div className={styles['modal-header']}>
            <h2 className={styles['modal-title']}>{title}</h2>
            <button className={styles['modal-close']} onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className={styles['modal-body']}>{children}</div>
        {footer && <div className={styles['modal-footer']}>{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
