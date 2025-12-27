import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar, FiLock, FiUnlock } from 'react-icons/fi'
import { Content } from '@/types/content'
import { formatCurrency } from '@/utils/formatters'
import { useTranslation } from 'react-i18next'
import { getLocalizedContentTitle } from '@/utils/localizeContent'
import { useAutoTranslate } from '@/hooks/useAutoTranslate'
import { normalizeSupportedLanguage } from '@/utils/translate'
import styles from './ContentCard.module.css'

interface ContentCardProps {
  content: Content
  showBadge?: boolean
  hidePrice?: boolean
}

const ContentCard: React.FC<ContentCardProps> = ({ content, showBadge = false, hidePrice = false }) => {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const language = normalizeSupportedLanguage(i18n.language)
  const baseTitle = getLocalizedContentTitle(content, language)
  const translatedTitle = useAutoTranslate(baseTitle, language, {
    enabled: language !== 'en',
    source: 'en',
    hideUntilTranslated: true,
  })
  const title = translatedTitle.text || ''
  const isPremium = (content.priceInRwf || 0) > 0
  const isUnlockedPremium = isPremium && (content.isPurchased || content.userAccess?.isPurchased)
  const isLocked = isPremium && !isUnlockedPremium && !content.isFree

  const handleClick = () => {
    navigate(`/content/${content._id}`)
  }

  return (
    <button
      type="button"
      className={styles.card}
      onClick={handleClick}
      aria-label={t('content.card.openAria', { title })}
    >
      <img
        src={content.posterImageUrl}
        alt={title}
        className={styles.poster}
        loading="lazy"
      />

      {showBadge && (
        <div className={styles.badge}>{t('content.badge.new')}</div>
      )}

      {isLocked && (
        <div className={styles.lockBadge} title={t('content.status.locked')} aria-label={t('content.status.locked')}>
          <FiLock size={16} aria-hidden="true" />
        </div>
      )}

      {isUnlockedPremium && (
        <div className={styles.unlockBadge} title={t('content.status.unlocked')} aria-label={t('content.status.unlocked')}>
          <FiUnlock size={16} aria-hidden="true" />
        </div>
      )}

      {!hidePrice && content.priceInRwf > 0 && (
        <div className={styles.price}>{formatCurrency(content.priceInRwf)}</div>
      )}

      <div className={styles.overlay}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <FiStar fill="currentColor" aria-hidden="true" />
            {content.averageRating?.toFixed(1) || t('content.rating.na')}
          </span>
          <span>•</span>
          <span>{content.releaseYear}</span>
          <span>•</span>
          <span>{content.contentType}</span>
        </div>
      </div>
    </button>
  )
}

export default ContentCard
