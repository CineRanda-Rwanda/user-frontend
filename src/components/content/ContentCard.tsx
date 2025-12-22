import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar, FiLock, FiUnlock } from 'react-icons/fi'
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
  const isPremium = (content.priceInRwf || 0) > 0
  const isUnlockedPremium = isPremium && (content.isPurchased || content.userAccess?.isPurchased)
  const isLocked = isPremium && !isUnlockedPremium && !content.isFree

  const handleClick = () => {
    navigate(`/content/${content._id}`)
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

      {isLocked && (
        <div className={styles.lockBadge} title="Locked">
          <FiLock size={16} />
        </div>
      )}

      {isUnlockedPremium && (
        <div className={styles.unlockBadge} title="Unlocked">
          <FiUnlock size={16} />
        </div>
      )}

      {!hidePrice && content.priceInRwf > 0 && (
        <div className={styles.price}>{formatCurrency(content.priceInRwf)}</div>
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
      </div>
    </div>
  )
}

export default ContentCard
