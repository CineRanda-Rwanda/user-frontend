import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiStar } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Content } from '@/types/content'
import { contentAPI } from '@/api/content'
import Button from '@/components/common/Button'
import { useTranslation } from 'react-i18next'
import { getLocalizedContentTitle, getLocalizedContentDescription } from '@/utils/localizeContent'
import { useAutoTranslate } from '@/hooks/useAutoTranslate'
import { normalizeSupportedLanguage } from '@/utils/translate'
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
  const [loadingTrailer, setLoadingTrailer] = useState(false)
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    if (content.length === 0 || selectedId) return

    const interval = setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % content.length)
    }, ROTATION_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [content.length, selectedId])

  const current = useMemo(() => {
    if (!content.length) return null
    if (selectedId) {
      const found = content.find((c) => c._id === selectedId)
      if (found) return found
    }
    return content[Math.min(autoIndex, content.length - 1)]
  }, [content, autoIndex, selectedId])

  const language = normalizeSupportedLanguage(i18n.resolvedLanguage || i18n.language)
  const baseTitle = current ? getLocalizedContentTitle(current, language) : ''
  const baseDescription = current ? getLocalizedContentDescription(current, language) : ''

  const translatedTitle = useAutoTranslate(baseTitle, language, {
    enabled: language !== 'en',
    source: 'en',
    hideUntilTranslated: true,
  })
  const translatedDescription = useAutoTranslate(baseDescription, language, {
    enabled: language !== 'en',
    source: 'en',
    hideUntilTranslated: true,
  })

  if (!content.length || !current) return null

  const title = translatedTitle.text || ''
  const description = translatedDescription.text || ''

  const handleCenterPlay = () => {
    // The hero center play should always play the trailer.
    handleTrailer()
  }

  const resolveTrailerFromContentDetails = async (): Promise<string> => {
    const response = await contentAPI.getContentById(current._id)
    const payload = response?.data?.data
    const resolvedContent = payload?.movie || payload?.series || payload?.content || payload || response?.data
    const normalizedContent = resolvedContent?.content ?? resolvedContent
    const link = (normalizedContent as { trailerYoutubeLink?: string })?.trailerYoutubeLink
    return typeof link === 'string' ? link : ''
  }

  const handleTrailer = async () => {
    if (loadingTrailer) return
    
    try {
      setLoadingTrailer(true)

      let trailerLink = current.trailerYoutubeLink || ''

      // The hero usually receives a lightweight content object; fetch full details
      // to get trailerYoutubeLink (this is why it works on the More Info page).
      if (!trailerLink || !trailerLink.trim()) {
        trailerLink = await resolveTrailerFromContentDetails()
      }

      // Final fallback: call the trailer endpoint used elsewhere (it may return
      // series trailers too even if the name says “movie”).
      if (!trailerLink || !trailerLink.trim()) {
        const response = await contentAPI.getMovieTrailer(current._id)
        trailerLink =
          response?.data?.data?.movie?.trailerYoutubeLink ||
          response?.data?.data?.series?.trailerYoutubeLink ||
          ''
      }
      
      if (trailerLink && trailerLink.trim()) {
        // Navigate to trailer page
        navigate(`/trailer?url=${encodeURIComponent(trailerLink)}&title=${encodeURIComponent(title)}`)
      } else {
        toast.error(t('content.trailer.notAvailableForTitle'))
      }
    } catch (error) {
      console.error('Failed to load trailer:', error)
      // Fallback to trailerYoutubeLink if available
      if (current.trailerYoutubeLink) {
        navigate(`/trailer?url=${encodeURIComponent(current.trailerYoutubeLink)}&title=${encodeURIComponent(title)}`)
      } else {
        toast.error(t('content.trailer.notAvailable'))
      }
    } finally {
      setLoadingTrailer(false)
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
          alt={title || baseTitle}
          className={styles.backgroundImage}
          key={current._id}
        />
      </div>

      <div className={styles.overlay} />

      <button
        type="button"
        className={styles.centerPlayButton}
        onClick={handleCenterPlay}
        aria-label={t('content.actions.playTrailer')}
      >
        <FiPlay />
      </button>

      <div className={styles.content}>
        <div className={styles.badge}>{t('content.badge.featured')}</div>

        <h1 className={styles.title}>{title}</h1>

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

        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            icon={<FiPlay />}
            onClick={handleMoreInfo}
            className={styles.heroButton}
          >
            {t('content.actions.fullVideo')}
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
