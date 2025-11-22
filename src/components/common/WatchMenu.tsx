import React, { useRef, useEffect } from 'react'
import { FiYoutube, FiPlay } from 'react-icons/fi'
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
  const menuRef = useRef<HTMLDivElement>(null)

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
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      ref={menuRef}
      className={styles.menu}
      style={position ? { top: position.y, left: position.x } : undefined}
    >
      {hasTrailer && (
        <button 
          className={styles.menuItem}
          onClick={() => {
            onTrailer()
            onClose()
          }}
        >
          <FiYoutube className={styles.icon} />
          <span>Watch Trailer</span>
        </button>
      )}
      <button 
        className={styles.menuItem}
        onClick={() => {
          onFullVideo()
          onClose()
        }}
      >
        <FiPlay className={styles.icon} />
        <span>Watch Full Video</span>
      </button>
    </div>
  )
}

export default WatchMenu
