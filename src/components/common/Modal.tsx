import React, { useEffect, ReactNode, useId, useMemo, useRef } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'medium' | 'large'
  closeAriaLabel?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeAriaLabel = 'Close'
}) => {
  const titleId = useId()
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const labelledBy = useMemo(() => (title ? titleId : undefined), [title, titleId])

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
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

  useEffect(() => {
    if (!isOpen) return

    // Focus close button if available, otherwise focus the dialog container.
    const id = window.setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
        return
      }

      const firstFocusable = contentRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )

      ;(firstFocusable ?? contentRef.current)?.focus()
    }, 0)

    return () => {
      window.clearTimeout(id)
      document.body.style.overflow = 'unset'
      openerRef.current?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const contentClass = size === 'large'
    ? `${styles['modal-content']} ${styles['modal-content-large']}`
    : styles['modal-content']

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const root = contentRef.current
    if (!root) return

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

    if (focusables.length === 0) {
      e.preventDefault()
      root.focus()
      return
    }

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement

    if (e.shiftKey) {
      if (active === first || active === root) {
        e.preventDefault()
        last.focus()
      }
      return
    }

    if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={overlayRef}
      className={styles['modal-overlay']}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={contentRef}
        className={contentClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {title && (
          <div className={styles['modal-header']}>
            <h2 id={titleId} className={styles['modal-title']}>{title}</h2>
            <button
              ref={closeButtonRef}
              type="button"
              className={styles['modal-close']}
              onClick={onClose}
              aria-label={closeAriaLabel}
            >
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
