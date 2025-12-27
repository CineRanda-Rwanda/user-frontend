import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronRight, FiLock, FiPlay, FiUnlock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { contentAPI } from '../api/content'
import { initiateContentPurchase } from '../api/payment'
import { Content, Episode } from '../types/content'
import Loader from '../components/common/Loader'
import { formatCurrency } from '../utils/formatters'
import {
  getLocalizedContentDescription,
  getLocalizedContentTitle,
  getLocalizedEpisodeDescription,
  getLocalizedEpisodeTitle,
  hasLocalizedText,
} from '../utils/localizeContent'
import { useAutoTranslate } from '../hooks/useAutoTranslate'
import { normalizeSupportedLanguage } from '../utils/translate'
import styles from './Watch.module.css'

const resolveContentIdentifier = (item?: Partial<Content> | null) =>
  item?._id || (item as { id?: string })?.id || ''

const detectMimeType = (url?: string) => {
  if (!url) return 'video/mp4'
  const normalized = url.split('?')[0].toLowerCase()
  if (normalized.endsWith('.m3u8')) return 'application/x-mpegURL'
  if (normalized.endsWith('.mpd')) return 'application/dash+xml'
  if (normalized.endsWith('.webm')) return 'video/webm'
  if (normalized.endsWith('.ogg') || normalized.endsWith('.ogv')) return 'video/ogg'
  if (normalized.endsWith('.mov')) return 'video/quicktime'
  return 'video/mp4'
}

const Watch: React.FC = () => {
  const { i18n, t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [content, setContent] = useState<Content | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [activeSeason, setActiveSeason] = useState<number>(1)
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null)
  const [episodesOpen, setEpisodesOpen] = useState(true)

  const [purchasing, setPurchasing] = useState(false)
  const [paymentPolling, setPaymentPolling] = useState(false)
  const paymentPollRef = useRef<number | null>(null)
  const [pendingTransactionRef, setPendingTransactionRef] = useState<string | null>(null)

  const lastCheckoutRef = useRef<{ url: string; openedAt: number } | null>(null)

  const [streamSource, setStreamSource] = useState('')
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)

  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null)
  const [pendingNextEpisode, setPendingNextEpisode] = useState<{ episode: Episode; seasonNumber: number } | null>(null)

  const [accessInfo, setAccessInfo] = useState<{
    hasAccess: boolean
    accessType?: string
    unlockedEpisodeIds: Set<string>
    totalEpisodes?: number
  } | null>(null)

  const [videoRefreshKey, setVideoRefreshKey] = useState(0)

  const lockedPanelRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const lockedTitleId = useId()
  const lockedDescId = useId()
  const lockedNoteId = useId()
  const episodesListId = useId()

  // Machine-translation fallback for dynamic backend content.
  // Hooks must run even during loading states, so we compute safe defaults.
  const targetLanguage = normalizeSupportedLanguage(i18n.language)
  const baseContentTitle = getLocalizedContentTitle(content, targetLanguage)
  const baseContentDescription = getLocalizedContentDescription(content, targetLanguage)
  const baseEpisodeTitle = activeEpisode ? getLocalizedEpisodeTitle(activeEpisode, targetLanguage) : ''
  const baseEpisodeDescription = activeEpisode ? getLocalizedEpisodeDescription(activeEpisode, targetLanguage) : ''

  const shouldTranslateContentTitle =
    targetLanguage !== 'rw' && !hasLocalizedText(content, 'title', targetLanguage)
  const shouldTranslateContentDescription =
    targetLanguage !== 'rw' && !hasLocalizedText(content, 'description', targetLanguage)
  const shouldTranslateEpisodeTitle =
    targetLanguage !== 'rw' && !hasLocalizedText(activeEpisode, 'title', targetLanguage)
  const shouldTranslateEpisodeDescription =
    targetLanguage !== 'rw' && !hasLocalizedText(activeEpisode, 'description', targetLanguage)

  const translatedContentTitle = useAutoTranslate(baseContentTitle, targetLanguage, {
    enabled: shouldTranslateContentTitle,
    source: 'auto',
    hideUntilTranslated: false,
  })
  const translatedContentDescription = useAutoTranslate(baseContentDescription, targetLanguage, {
    enabled: shouldTranslateContentDescription,
    source: 'auto',
    hideUntilTranslated: false,
  })
  const translatedEpisodeTitle = useAutoTranslate(baseEpisodeTitle, targetLanguage, {
    enabled: shouldTranslateEpisodeTitle,
    source: 'auto',
    hideUntilTranslated: false,
  })
  const translatedEpisodeDescription = useAutoTranslate(baseEpisodeDescription, targetLanguage, {
    enabled: shouldTranslateEpisodeDescription,
    source: 'auto',
    hideUntilTranslated: false,
  })

  const translationsReady =
    translatedContentTitle.ready &&
    translatedContentDescription.ready &&
    translatedEpisodeTitle.ready &&
    translatedEpisodeDescription.ready

  const orderedSeasons = useMemo(() => {
    if (!content?.seasons) return []
    return [...content.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber)
  }, [content?.seasons])

  const isSeries = content?.contentType === 'Series'
  const hasServerFullAccess = Boolean(
    accessInfo?.hasAccess &&
      (accessInfo?.accessType === 'full' ||
        accessInfo?.accessType === 'free' ||
        accessInfo?.accessType === 'content' ||
        !accessInfo?.accessType)
  )

  const isContentUnlocked = Boolean(
    content?.isFree ||
      content?.priceInRwf === 0 ||
      content?.isPurchased ||
      content?.userAccess?.isPurchased ||
      hasServerFullAccess
  )

  const isEpisodeUnlocked = useCallback(
    (episode?: Episode | null) => {
      if (!content) return false
      if (isContentUnlocked) return true
      if (!episode) return false
      if (episode.isFree || episode.isUnlocked) return true

      if (accessInfo?.unlockedEpisodeIds && accessInfo.unlockedEpisodeIds.has(episode._id)) return true

      const unlockedEpisodes = content.userAccess?.unlockedEpisodes || []
      if (unlockedEpisodes.includes(episode._id)) return true

      const seasonWithEpisode = content.seasons?.find((season) =>
        season.episodes?.some((entry) => entry._id === episode._id)
      )

      if (seasonWithEpisode?.userAccess?.isPurchased) return true
      if (seasonWithEpisode?.userAccess?.unlockedEpisodes?.includes(episode._id)) return true

      return false
    },
    [content, isContentUnlocked, accessInfo]
  )

  const canPlayCurrent = Boolean(
    content && (isSeries ? activeEpisode && isEpisodeUnlocked(activeEpisode) : isContentUnlocked)
  )

  const lockedOverlayOpen = Boolean(content && (!canPlayCurrent || !streamSource))

  useEffect(() => {
    if (!lockedOverlayOpen) return

    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusInitial = window.setTimeout(() => {
      lockedPanelRef.current?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const container = lockedPanelRef.current
      if (!container) return

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((node) => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true')

      if (focusables.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusInitial)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [lockedOverlayOpen])


  const loadContent = useCallback(async () => {
    if (!id) return
    try {
      setLoadingContent(true)
      const response = await contentAPI.getContentById(id)
      const payload = response?.data?.data
      const resolved =
        payload?.movie ||
        payload?.series ||
        payload?.content ||
        payload ||
        response?.data
      const normalized = resolved?.content ?? resolved

      if (!normalized) throw new Error('Content not found')

      const mergedContent = {
        ...normalized,
        isPurchased:
          normalized.isPurchased ??
          payload?.isPurchased ??
          response?.data?.isPurchased ??
          normalized.userAccess?.isPurchased ??
          false,
        userAccess: normalized.userAccess ?? payload?.userAccess ?? response?.data?.userAccess,
      } as Content

      const fallbackId =
        mergedContent._id || payload?._id || (resolved as { _id?: string })?._id || (resolved as { id?: string })?.id || id

      const finalContent: Content = { ...mergedContent, _id: fallbackId }
      setContent(finalContent)

      if (finalContent.contentType === 'Series' && finalContent.seasons?.length) {
        const seasonParam = Number(searchParams.get('season')) || undefined
        const episodeParam = Number(searchParams.get('episode')) || undefined
        const sorted = [...finalContent.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber)
        const defaultSeason =
          sorted.find((season) => season.seasonNumber === seasonParam) || sorted[0]
        const defaultEpisode =
          defaultSeason.episodes?.find((episode) => episode.episodeNumber === episodeParam) ||
          defaultSeason.episodes?.[0] ||
          null

        setActiveSeason(defaultSeason.seasonNumber)
        setActiveEpisode(defaultEpisode ?? null)
      } else {
        setActiveEpisode(null)
      }
    } catch (error) {
      console.error('Failed to load content', error)
      toast.error(t('watch.errors.loadFailed'))
      navigate('/browse')
    } finally {
      setLoadingContent(false)
    }
  }, [id, navigate, searchParams, t])

  const loadAccessInfo = useCallback(async () => {
    if (!id) return
    try {
      const response = await contentAPI.checkAccess(id)
      const payload = response?.data?.data || response?.data
      const unlockedIdsSource = Array.isArray(payload?.purchasedEpisodeIds)
        ? payload.purchasedEpisodeIds
        : Array.isArray(payload?.unlockedEpisodeIds)
        ? payload.unlockedEpisodeIds
        : []

      const unlockedEpisodeIds = new Set<string>(
        unlockedIdsSource.filter((value: unknown): value is string => typeof value === 'string')
      )

      setAccessInfo({
        hasAccess: Boolean(payload?.hasAccess ?? payload?.accessGranted ?? false),
        accessType: payload?.accessType,
        unlockedEpisodeIds,
        totalEpisodes: payload?.totalEpisodes,
      })
    } catch (error) {
      console.warn('Failed to load access info', error)
      setAccessInfo(null)
    }
  }, [id])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  useEffect(() => {
    loadAccessInfo()
  }, [loadAccessInfo])

  useEffect(() => () => {
    if (paymentPollRef.current) {
      window.clearInterval(paymentPollRef.current)
    }
  }, [])

  const beginPaymentPolling = useCallback(
    (contentId: string) => {
      if (paymentPollRef.current) {
        window.clearInterval(paymentPollRef.current)
      }

      setPaymentPolling(true)
      const startedAt = Date.now()

      paymentPollRef.current = window.setInterval(() => {
        (async () => {
          try {
            const response = await contentAPI.checkAccess(contentId)
            const payload = response?.data?.data || response?.data
            const hasUnlocked = Boolean(
              payload?.hasAccess ||
                payload?.accessGranted ||
                payload?.isPurchased ||
                payload?.userAccess?.isPurchased
            )

            if (hasUnlocked) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current)
                paymentPollRef.current = null
              }
              setPaymentPolling(false)
              setPendingTransactionRef(null)
              toast.success(t('watch.payment.confirmedStream'))
              await Promise.all([loadAccessInfo(), loadContent()])
            } else if (Date.now() - startedAt > 5 * 60 * 1000) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current)
                paymentPollRef.current = null
              }
              setPaymentPolling(false)
              setPendingTransactionRef(null)
              toast.info(t('watch.payment.stillWaiting'))
            }
          } catch (error) {
            console.error('Error polling payment status:', error)
          }
        })()
      }, 5000)
    },
    [loadAccessInfo, loadContent, t]
  )

  const openCheckoutTab = (url: string) => {
    const now = Date.now()
    const last = lastCheckoutRef.current
    if (last && last.url === url && now - last.openedAt < 1500) {
      return
    }
    lastCheckoutRef.current = { url, openedAt: now }

    // Redirect in the same tab (replace current page) per UX request.
    window.location.replace(url)
  }

  const startDirectCheckout = useCallback(
    async (contentId: string, scopeLabel: string) => {
      const response = await initiateContentPurchase({ contentId, scope: 'content' })
      const paymentLink = response?.paymentLink
      if (!paymentLink) {
        throw new Error('Payment link unavailable.')
      }
      setPendingTransactionRef(response.transactionRef)
      toast.info(t('watch.purchase.redirectingToCheckout', { scope: scopeLabel }))
      openCheckoutTab(paymentLink)
      beginPaymentPolling(contentId)
    },
    [beginPaymentPolling, t]
  )


  const fetchStreamSource = useCallback(async () => {
    if (!content) return
    if (isSeries && !activeEpisode) return
    const identifier = resolveContentIdentifier(content)
    if (!identifier) return

    setStreamLoading(true)
    setStreamError(null)

    try {
      const response = isSeries && activeEpisode
        ? await contentAPI.getEpisodeStreamUrl(identifier, activeEpisode._id, {
            seasonNumber: activeSeason,
            episodeNumber: activeEpisode.episodeNumber,
          })
        : await contentAPI.getStreamUrl(identifier)
      const payload = response?.data?.data || response?.data
      const url = payload?.videoUrl || payload?.streamUrl

      if (url) {
        setStreamSource(url)
      } else {
        const fallback = isSeries ? activeEpisode?.videoUrl : content.movieFileUrl
        if (fallback) {
          setStreamSource(fallback)
        } else {
          throw new Error('Missing stream URL')
        }
      }
    } catch (error) {
      console.error('Unable to load stream', error)
      const status = (error as any)?.response?.status
      if (status === 401 || status === 403) {
        setStreamSource('')
        setStreamError(t('watch.stream.locked'))
      } else {
        const fallback = isSeries ? activeEpisode?.videoUrl : content?.movieFileUrl
        if (fallback) {
          setStreamSource(fallback)
        } else {
          setStreamSource('')
          setStreamError(t('watch.stream.unavailable'))
        }
      }
    } finally {
      setStreamLoading(false)
    }
  }, [content, activeEpisode, activeSeason, isSeries, t])

  useEffect(() => {
    if (!canPlayCurrent) return
    fetchStreamSource()
  }, [fetchStreamSource, canPlayCurrent])

  const findNextEpisode = useCallback(() => {
    if (!content || content.contentType !== 'Series' || !activeEpisode) return null
    const seasons = [...(content.seasons || [])].sort((a, b) => a.seasonNumber - b.seasonNumber)
    const seasonIndex = seasons.findIndex((season) => season.seasonNumber === activeSeason)
    if (seasonIndex < 0) return null
    const currentSeason = seasons[seasonIndex]
    const currentEpisodes = currentSeason.episodes || []
    const episodeIndex = currentEpisodes.findIndex((episode) => episode._id === activeEpisode._id)

    if (episodeIndex > -1 && episodeIndex < currentEpisodes.length - 1) {
      return { episode: currentEpisodes[episodeIndex + 1], seasonNumber: currentSeason.seasonNumber }
    }

    for (let index = seasonIndex + 1; index < seasons.length; index += 1) {
      const nextSeason = seasons[index]
      if (nextSeason.episodes?.length) {
        return { episode: nextSeason.episodes[0], seasonNumber: nextSeason.seasonNumber }
      }
    }

    return null
  }, [content, activeEpisode, activeSeason])

  const cancelAutoNext = useCallback(() => {
    setAutoNextCountdown(null)
    setPendingNextEpisode(null)
  }, [])

  const handleEpisodeSelect = useCallback(
    (episode: Episode, seasonNumber: number, autoplay: boolean = false) => {
      setActiveSeason(seasonNumber)
      setActiveEpisode(episode)
      setEpisodesOpen(true)
      if (!autoplay) {
        cancelAutoNext()
      }
    },
    [cancelAutoNext]
  )

  const triggerAutoNext = useCallback(() => {
    const next = findNextEpisode()
    if (!next) return
    if (!isEpisodeUnlocked(next.episode)) return
    setPendingNextEpisode(next)
    setAutoNextCountdown(10)
  }, [findNextEpisode, isEpisodeUnlocked])

  const playPendingEpisode = useCallback(() => {
    if (!pendingNextEpisode) return
    handleEpisodeSelect(pendingNextEpisode.episode, pendingNextEpisode.seasonNumber, true)
    setPendingNextEpisode(null)
    setAutoNextCountdown(null)
  }, [pendingNextEpisode, handleEpisodeSelect])

  useEffect(() => {
    if (autoNextCountdown === null) return
    if (autoNextCountdown <= 0) {
      playPendingEpisode()
      return
    }
    const timer = window.setTimeout(() => {
      setAutoNextCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [autoNextCountdown, playPendingEpisode])

  const videoPoster = content?.posterImageUrl || undefined
  const resolvedStreamSource = canPlayCurrent ? streamSource : ''

  useEffect(() => {
    setVideoRefreshKey((prev) => prev + 1)
  }, [resolvedStreamSource])

  const handleVideoEnded = useCallback(() => {
    triggerAutoNext()
  }, [triggerAutoNext])

  const handleVideoError = useCallback(() => {
    setStreamError(t('watch.stream.unavailable'))
  }, [t])

  const handleSeasonChange = (seasonNumber: number) => {
    const season = orderedSeasons.find((entry) => entry.seasonNumber === seasonNumber)
    if (!season) return
    if (season.episodes?.length) {
      handleEpisodeSelect(season.episodes[0], seasonNumber)
    } else {
      setActiveSeason(seasonNumber)
      setActiveEpisode(null)
    }
  }

  const handlePurchase = async () => {
    if (!content) return
    const identifier = resolveContentIdentifier(content)
    if (!identifier) return

    if (content.contentType === 'Series') {
      toast.info(t('watch.purchase.unlockFromDetails'))
      navigate(`/content/${identifier}`)
      return
    }

    try {
      setPurchasing(true)
      const language = i18n.resolvedLanguage || i18n.language || 'en'
      const label = getLocalizedContentTitle(content, language) || t('watch.purchase.thisTitle')
      await startDirectCheckout(identifier, label)
    } catch (error: any) {
      const message = error?.response?.data?.message || t('watch.purchase.failed')
      toast.error(message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loadingContent || !translationsReady) {
    return (
      <div className={styles.loadingState}>
        <Loader fullScreen={false} text={t('common.loading')} />
      </div>
    )
  }

  if (!content) return null

  const language = targetLanguage
  const localizedContentTitle = translatedContentTitle.text || baseContentTitle
  const localizedContentDescription = translatedContentDescription.text || baseContentDescription
  const localizedEpisodeTitle = activeEpisode ? translatedEpisodeTitle.text || baseEpisodeTitle : ''
  const localizedEpisodeDescription = activeEpisode ? translatedEpisodeDescription.text || baseEpisodeDescription : ''

  const pageTitle =
    isSeries && activeEpisode
      ? `${localizedContentTitle} • S${activeSeason}E${activeEpisode.episodeNumber} ${localizedEpisodeTitle ? '– ' + localizedEpisodeTitle : ''}`
      : localizedContentTitle

  const description =
    isSeries && activeEpisode ? localizedEpisodeDescription : localizedContentDescription

  const shortTransactionRef = pendingTransactionRef ? pendingTransactionRef.slice(-8).toUpperCase() : null

  const durationLabel =
    content.contentType === 'Movie'
      ? t('watch.episodes.minutes', { minutes: content.duration ?? Math.round((content.watchProgress?.duration || 0) / 60) })
      : activeEpisode
      ? t('watch.episodes.minutes', { minutes: activeEpisode.duration })
      : '—'

  const unlockButtonDisabled = purchasing || paymentPolling

  const currentSeason = orderedSeasons.find((season) => season.seasonNumber === activeSeason)

  return (
    <div className={styles.page}>
      <div className={styles.backBar}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} aria-hidden="true" focusable="false" />
          <span>{t('watch.backToBrowse')}</span>
        </button>
      </div>

      <section className={styles.playerSection}>
        <div className={styles.playerShell}>
          <div className={styles.videoWrapper}>
            <div data-vjs-player className={styles.videoContainer}>
              <video
                key={videoRefreshKey}
                className={styles.videoElement}
                playsInline
                controls
                preload="metadata"
                poster={videoPoster}
                onEnded={handleVideoEnded}
                onError={handleVideoError}
              >
                {resolvedStreamSource && (
                  <source src={resolvedStreamSource} type={detectMimeType(resolvedStreamSource)} />
                )}
              </video>
            </div>

            {lockedOverlayOpen && (
              <div className={styles.playerOverlay}>
                <div
                  className={styles.lockedPanel}
                  ref={lockedPanelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={lockedTitleId}
                  aria-describedby={`${lockedDescId} ${lockedNoteId}`}
                  tabIndex={-1}
                >
                  <FiLock size={40} color="#FFD700" style={{ marginBottom: 16 }} aria-hidden="true" focusable="false" />
                  <h2 className={styles.lockedTitle} id={lockedTitleId}>
                    {t('watch.overlay.unlockTitle')}
                  </h2>
                  <p id={lockedDescId} style={{ color: 'var(--text-gray)', marginBottom: 16 }}>
                    {t('watch.overlay.purchase')}{' '}
                    <strong>{content.title}</strong>{' '}
                    {isSeries && activeEpisode
                      ? t('watch.overlay.toWatchEpisode', { season: activeSeason, episode: activeEpisode.episodeNumber })
                      : t('watch.overlay.toStartStreaming')}
                  </p>
                  <div className={styles.lockedPrice}>{formatCurrency(content.priceInRwf || 0)}</div>
                  <div className={styles.lockedActions}>
                    {!isSeries && (
                      <button
                        type="button"
                        className={`${styles.ctaButton} ${styles.primaryCta}`}
                        onClick={handlePurchase}
                        disabled={unlockButtonDisabled}
                      >
                        {purchasing ? t('watch.overlay.openingCheckout') : paymentPolling ? t('watch.overlay.confirming') : (
                          <>
                            <FiUnlock size={18} aria-hidden="true" focusable="false" /> {t('watch.overlay.payAndUnlock')}
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${styles.ctaButton} ${styles.secondaryCta}`}
                      onClick={() => navigate(`/content/${resolveContentIdentifier(content)}`)}
                    >
                      <FiPlay size={16} aria-hidden="true" focusable="false" /> {t('watch.overlay.viewDetails')}
                    </button>
                  </div>
                  <p id={lockedNoteId} style={{ marginTop: 12, color: 'var(--text-gray)' }}>
                    {t('watch.overlay.checkoutNote')}
                  </p>
                  {paymentPolling && (
                    <p style={{ marginTop: 4, color: 'var(--text-gray)' }}>
                      {t('watch.overlay.waitingForConfirmation', {
                        refSuffix: shortTransactionRef ? ` (Ref: ${shortTransactionRef})` : ''
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {streamLoading && (
            <div className={styles.playerOverlay}>
              <Loader fullScreen={false} text={t('watch.stream.fetching')} />
            </div>
          )}

          {streamError && (
            <div className={styles.streamError} role="alert" aria-live="assertive">
              {streamError}
            </div>
          )}

          {autoNextCountdown !== null && pendingNextEpisode && (
            <div className={styles.autoNextBanner} role="status" aria-live="polite">
              <p className={styles.autoNextTitle}>
                {t('watch.autoNext.nextIn')}{' '}
                <strong>{autoNextCountdown}s</strong>
              </p>
              <p style={{ color: 'var(--text-gray)' }}>
                S{pendingNextEpisode.seasonNumber}E{pendingNextEpisode.episode.episodeNumber}:{' '}
                {getLocalizedEpisodeTitle(pendingNextEpisode.episode, language) || pendingNextEpisode.episode.title}
              </p>
              <div className={styles.autoNextActions}>
                <button className={`${styles.ctaButton} ${styles.primaryCta}`} onClick={playPendingEpisode}>
                  {t('watch.autoNext.playNow')}
                </button>
                <button className={`${styles.ctaButton} ${styles.secondaryCta}`} onClick={cancelAutoNext}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.metaSection}>
        <div className={styles.metaHeader}>
          <h1 className={styles.metaTitle}>{pageTitle}</h1>
          <p className={styles.metaDescription}>{description}</p>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>{t('watch.meta.releaseYear')}</p>
            <p className={styles.metaValue}>{content.releaseYear || '—'}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>{t('watch.meta.rating')}</p>
            <p className={styles.metaValue}>{content.averageRating?.toFixed(1) || content.ageRating || 'NR'}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>{t('watch.meta.duration')}</p>
            <p className={styles.metaValue}>{durationLabel}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>{t('watch.meta.language')}</p>
            <p className={styles.metaValue}>{content.language || content.countryOfOrigin || t('watch.meta.languageFallback')}</p>
          </div>
        </div>
      </section>

      {isSeries && orderedSeasons.length > 0 && (
        <section className={styles.episodesSection}>
          <div className={styles.episodesHeader}>
            <h2 className={styles.metaTitle} style={{ fontSize: 24 }}>{t('watch.episodes.title')}</h2>
            <div className={styles.episodesActions}>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setEpisodesOpen((prev) => !prev)}
                aria-expanded={episodesOpen}
                aria-controls={episodesListId}
              >
                {episodesOpen ? t('watch.episodes.hideList') : t('watch.episodes.showList')}
              </button>
            </div>
          </div>

          {episodesOpen && (
            <>
              <div className={styles.seasonTabs}>
                {orderedSeasons.map((season) => (
                  <button
                    key={season._id}
                    type="button"
                    onClick={() => handleSeasonChange(season.seasonNumber)}
                    className={`${styles.seasonTab} ${season.seasonNumber === activeSeason ? styles.seasonTabActive : ''}`}
                    aria-pressed={season.seasonNumber === activeSeason}
                  >
                    {t('watch.episodes.season', { number: season.seasonNumber })}
                  </button>
                ))}
              </div>

              <div className={styles.episodesList} id={episodesListId}>
                {currentSeason?.episodes?.map((episode) => {
                  const isActive = activeEpisode?._id === episode._id
                  const unlocked = isEpisodeUnlocked(episode)
                  return (
                    <button
                      type="button"
                      key={episode._id}
                      className={`${styles.episodeCard} ${isActive ? styles.episodeCardActive : ''}`}
                      onClick={() => handleEpisodeSelect(episode, currentSeason.seasonNumber)}
                    >
                      <div className={styles.episodeNumber}>{episode.episodeNumber}</div>
                      <div className={styles.episodeInfo}>
                        <div className={styles.episodeTitle}>
                          {getLocalizedEpisodeTitle(episode, language) || episode.title}
                        </div>
                        <p className={styles.episodeDescription}>
                          {getLocalizedEpisodeDescription(episode, language) || episode.description}
                        </p>
                        <div className={styles.episodeMeta}>
                          <span>{t('watch.episodes.minutes', { minutes: episode.duration })}</span>
                          {!unlocked && (
                            <span className={styles.episodeLock}>
                              <FiLock size={14} aria-hidden="true" focusable="false" /> {t('watch.episodes.locked')}
                            </span>
                          )}
                          {isActive && <span style={{ color: 'var(--primary-yellow)' }}>{t('watch.episodes.nowPlaying')}</span>}
                        </div>
                      </div>
                      <FiChevronRight size={20} color="var(--text-gray)" aria-hidden="true" focusable="false" />
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}

export default Watch
