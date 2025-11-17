import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { Content } from '@/types/content'
import { formatCurrency } from '@/utils/formatters'
import styles from './ContentCard.module.css'

interface ContentCardProps {
  content: Content
  showBadge?: boolean
  hidePrice?: boolean
}

const ContentCard: React.FC<ContentCardProps> = ({ content, showBadge = false, hidePrice = false }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    // Route based on content type
    const route = content.type === 'Movie' ? '/movies' : '/series'
    navigate(`${route}?selected=${content._id}`)
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <img
        src={content.posterImageUrl}
        alt={content.title}
        className={styles.poster}
        loading="lazy"
      />

      {showBadge && (
        <div className={styles.badge}>New</div>
      )}

      {!hidePrice && content.priceInCoins > 0 && (
        <div className={styles.price}>{content.priceInCoins} coins</div>
      )}

      <div className={styles.overlay}>
        <div className={styles.title}>{content.title}</div>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <FiStar fill="currentColor" />
            {content.averageRating?.toFixed(1) || 'N/A'}
          </span>
          <span>•</span>
          <span>{content.releaseYear}</span>
          <span>•</span>
          <span>{content.contentType}</span>
        </div>
        {content.priceInRwf > 0 && (
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-gray)' }}>
            {formatCurrency(content.priceInRwf)} RWF
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentCard
