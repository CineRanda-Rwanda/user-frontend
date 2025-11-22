import React, { useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import styles from './TrailerModal.module.css'

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  youtubeUrl: string
  title: string
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, youtubeUrl, title }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  console.log('TrailerModal - isOpen:', isOpen, 'youtubeUrl:', youtubeUrl)

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const videoId = getYouTubeVideoId(youtubeUrl)
  console.log('Extracted videoId:', videoId)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title} - Trailer</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close trailer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className={styles.videoContainer}>
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.videoFrame}
            />
          ) : (
            <div className={styles.errorMessage}>
              <p>Unable to load trailer. Invalid YouTube URL.</p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fallbackLink}
              >
                Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrailerModal
