import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiInfo, FiStar, FiEye } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Content } from '@/types/content'
import { contentAPI } from '@/api/content'
import Button from '@/components/common/Button'
import WatchMenu from '@/components/common/WatchMenu'
import { useAuth } from '@/contexts/AuthContext'
import styles from './FeaturedHero.module.css'

interface FeaturedHeroProps {
  content: Content[]
  /** Optional explicit selected content id (e.g. from query param). */
  selectedId?: string | null
  hidePrice?: boolean
}

const ROTATION_INTERVAL_MS = 8000

const FeaturedHero: React.FC<FeaturedHeroProps> = ({ content, selectedId = null }) => {
  const [autoIndex, setAutoIndex] = useState(0)
  const [showWatchMenu, setShowWatchMenu] = useState(false)
  const [loadingTrailer, setLoadingTrailer] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (content.length === 0 || selectedId) return

    const interval = setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % content.length)
    }, ROTATION_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [content.length, selectedId])

  if (content.length === 0) return null

  const current = useMemo(() => {
    if (!content.length) return content[0]
    if (selectedId) {
      const found = content.find((c) => c._id === selectedId)
      if (found) return found
    }
    return content[Math.min(autoIndex, content.length - 1)]
  }, [content, autoIndex, selectedId])

  if (!current) return null

  const handleWatchClick = () => {
    if (current.contentType === 'Series') {
      navigate(`/content/${current._id}`)
    } else {
      // For movies, toggle the watch menu
      setShowWatchMenu(!showWatchMenu)
    }
  }

  // Check if content has trailer (either from API endpoint or in content data)
  const hasTrailer = current.contentType === 'Movie' || !!current.trailerYoutubeLink

  const handleTrailer = async () => {
    if (loadingTrailer) return
    
    try {
      setLoadingTrailer(true)
      
      // Fetch trailer from API
      const response = current.contentType === 'Movie'
        ? await contentAPI.getMovieTrailer(current._id)
        : null // Series trailer endpoint would be different
      
      const trailerLink = response?.data?.data?.movie?.trailerYoutubeLink || 
                         response?.data?.data?.series?.trailerYoutubeLink ||
                         current.trailerYoutubeLink
      
      if (trailerLink && trailerLink.trim()) {
        // Navigate to trailer page
        navigate(`/trailer?url=${encodeURIComponent(trailerLink)}&title=${encodeURIComponent(current.title)}`)
      } else {
        toast.error('Trailer not available for this title')
      }
    } catch (error) {
      console.error('Failed to load trailer:', error)
      // Fallback to trailerYoutubeLink if available
      if (current.trailerYoutubeLink) {
        navigate(`/trailer?url=${encodeURIComponent(current.trailerYoutubeLink)}&title=${encodeURIComponent(current.title)}`)
      } else {
        toast.error('Trailer not available')
      }
    } finally {
      setLoadingTrailer(false)
    }
  }

  const handleFullVideo = () => {
    const isPurchased = current.isPurchased || current.userAccess?.isPurchased
    const isFree = current.isFree || current.priceInRwf === 0
    
    if (isAuthenticated && (isPurchased || isFree)) {
      navigate(`/watch/${current._id}`)
    } else if (!isAuthenticated) {
      navigate('/login')
    } else {
      navigate(`/content/${current._id}`)
    }
  }

  const handleMoreInfo = () => {
    navigate(`/content/${current._id}`)
  }

  return (
    <>
    <div className={styles.hero}>
      <div className={styles.background}>
        <img
          src={current.posterImageUrl}
          alt={current.title}
          className={styles.backgroundImage}
          key={current._id}
        />
      </div>

      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>Featured</div>

        <h1 className={styles.title}>{current.title}</h1>

        <div className={styles.meta}>
            <span className={styles.rating}>
              <FiStar fill="currentColor" />
              {current.averageRating?.toFixed(1) || 'N/A'}
            </span>
            <span>•</span>
            <span>{current.releaseYear}</span>
            <span>•</span>
            <span>{current.contentType}</span>
            {current.genres && current.genres.length > 0 && (
              <>
                <span>•</span>
                <span>{current.genres.slice(0, 3).map(g => g.name).join(', ')}</span>
              </>
            )}
          </div>

        <p className={styles.description}>{current.description}</p>

          <div className={styles.actions}>
          <div className={styles.watchButtonContainer}>
            <Button
              variant="primary"
              size="large"
              icon={current.contentType === 'Series' ? <FiEye /> : <FiPlay />}
              onClick={handleWatchClick}
            >
              {current.contentType === 'Series' ? 'View' : 'Watch'}
            </Button>
            {current.contentType !== 'Series' && (
              <WatchMenu
                isOpen={showWatchMenu}
                onClose={() => setShowWatchMenu(false)}
                onTrailer={handleTrailer}
                onFullVideo={handleFullVideo}
                hasTrailer={hasTrailer}
              />
            )}
          </div>

          <Button
            variant="ghost"
            size="large"
            icon={<FiInfo />}
            onClick={handleMoreInfo}
          >
            More Info
          </Button>
        </div>
      </div>

      {content.length > 1 && (
        <div className={styles.indicators}>
          {content.map((_, index) => (
            <div
              key={index}
              className={`${styles.indicator} ${index === autoIndex ? styles.active : ''}`}
              onClick={() => setAutoIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
    </>
  )
}

export default FeaturedHero
