import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiInfo, FiStar } from 'react-icons/fi'
import { Content } from '@/types/content'
import Button from '@/components/common/Button'
import styles from './FeaturedHero.module.css'

interface FeaturedHeroProps {
  content: Content[]
  hidePrice?: boolean
}

const FeaturedHero: React.FC<FeaturedHeroProps> = ({ content, hidePrice = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (content.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [content.length])

  if (content.length === 0) return null

  const current = content[currentIndex]

  return (
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
          <Button
            variant="primary"
            size="large"
            icon={<FiPlay />}
            onClick={() => navigate(`/content/${current._id}`)}
          >
            Watch Now
          </Button>
          <Button
            variant="secondary"
            size="large"
            icon={<FiInfo />}
            onClick={() => navigate(`/content/${current._id}`)}
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
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default FeaturedHero
