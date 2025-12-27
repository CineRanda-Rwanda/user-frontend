import React, { useRef, useEffect } from 'react'
import { FiYoutube, FiPlay } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styles from './WatchMenu.module.css'

interface WatchMenuProps {
  isOpen: boolean
  onClose: () => void
  onTrailer: () => void
  onFullVideo: () => void
  hasTrailer: boolean
  position?: { x: number; y: number }
}

const WatchMenu: React.FC<WatchMenuProps> = ({ 
  isOpen, 
  onClose, 
  onTrailer, 
  onFullVideo, 
  hasTrailer,
  position 
}) => {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      requestAnimationFrame(() => {
        const first = menuRef.current?.querySelector<HTMLElement>('button:not([disabled])')
        first?.focus()
      })
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      requestAnimationFrame(() => openerRef.current?.focus())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    const menuEl = menuRef.current
    if (!menuEl) return

    const items = Array.from(menuEl.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
    if (items.length === 0) return
    const currentIndex = items.findIndex((item) => item === document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = items[(currentIndex + 1 + items.length) % items.length]
      next.focus()
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = items[(currentIndex - 1 + items.length) % items.length]
      prev.focus()
    }

    if (event.key === 'Home') {
      event.preventDefault()
      items[0].focus()
    }

    if (event.key === 'End') {
      event.preventDefault()
      items[items.length - 1].focus()
    }
  }

  return (
    <div 
      ref={menuRef}
      className={styles.menu}
      style={position ? { top: position.y, left: position.x } : undefined}
      role="menu"
      aria-label={t('watchMenu.label')}
      onKeyDown={handleMenuKeyDown}
    >
      {hasTrailer && (
        <button 
          className={styles.menuItem}
          role="menuitem"
          onClick={() => {
            onTrailer()
            onClose()
          }}
        >
          <FiYoutube className={styles.icon} aria-hidden="true" />
          <span>{t('watchMenu.watchTrailer')}</span>
        </button>
      )}
      <button 
        className={styles.menuItem}
        role="menuitem"
        onClick={() => {
          onFullVideo()
          onClose()
        }}
      >
        <FiPlay className={styles.icon} aria-hidden="true" />
        <span>{t('watchMenu.watchFullVideo')}</span>
      </button>
    </div>
  )
}

export default WatchMenu
