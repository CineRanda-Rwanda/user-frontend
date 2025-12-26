import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronRight, FiLock, FiPlay, FiUnlock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { contentAPI } from '../api/content'
import { initiateContentPurchase } from '../api/payment'
import { Content, Episode } from '../types/content'
import Loader from '../components/common/Loader'
import { formatCurrency } from '../utils/formatters'
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

  const isContentUnlocked = isSeries
    ? Boolean(content?.isFree || content?.priceInRwf === 0 || hasServerFullAccess)
    : Boolean(
        content?.isFree ||
          content?.priceInRwf === 0 ||
          content?.isPurchased ||
          content?.userAccess?.isPurchased ||
          hasServerFullAccess
      )

  const isEpisodeUnlocked = useCallback(
    (episode?: Episode | null) => {
      if (!content) return false
      if (hasServerFullAccess) return true
      if (!episode) return false
      if (episode.isFree || episode.isUnlocked) return true

      if (accessInfo?.unlockedEpisodeIds && accessInfo.unlockedEpisodeIds.has(episode._id)) return true

      const unlockedEpisodes = content.userAccess?.unlockedEpisodes || []
      if (unlockedEpisodes.includes(episode._id)) return true

      const seasonWithEpisode = content.seasons?.find((season) =>
        season.episodes?.some((entry) => entry._id === episode._id)
      )
      if (seasonWithEpisode?.userAccess?.unlockedEpisodes?.includes(episode._id)) return true

      return false
    },
    [content, accessInfo, hasServerFullAccess]
  )

  const canPlayCurrent = Boolean(
    content && (isSeries ? activeEpisode && isEpisodeUnlocked(activeEpisode) : isContentUnlocked)
  )


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
      toast.error('Failed to load content. Please try again.')
      navigate('/browse')
    } finally {
      setLoadingContent(false)
    }
  }, [id, navigate, searchParams])

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
              toast.success('Payment confirmed! Enjoy your stream.')
              await Promise.all([loadAccessInfo(), loadContent()])
            } else if (Date.now() - startedAt > 5 * 60 * 1000) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current)
                paymentPollRef.current = null
              }
              setPaymentPolling(false)
              setPendingTransactionRef(null)
              toast.info('Still waiting for payment confirmation. Refresh once checkout completes.')
            }
          } catch (error) {
            console.error('Error polling payment status:', error)
          }
        })()
      }, 5000)
    },
    [loadAccessInfo, loadContent]
  )

  const openCheckoutTab = (url: string) => {
    const checkoutWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (!checkoutWindow) {
      window.location.href = url
    }
  }

  const startDirectCheckout = useCallback(
    async (contentId: string, scopeLabel: string) => {
      const response = await initiateContentPurchase({ contentId, scope: 'content' })
      const paymentLink = response?.paymentLink
      if (!paymentLink) {
        throw new Error('Payment link unavailable.')
      }
      setPendingTransactionRef(response.transactionRef)
      toast.info(`Checkout opened in a new tab. Complete payment to unlock ${scopeLabel}.`)
      openCheckoutTab(paymentLink)
      beginPaymentPolling(contentId)
    },
    [beginPaymentPolling]
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
        setStreamError('This episode is still locked. Unlock it to keep watching.')
      } else {
        const fallback = isSeries ? activeEpisode?.videoUrl : content?.movieFileUrl
        if (fallback) {
          setStreamSource(fallback)
        } else {
          setStreamSource('')
          setStreamError('Unable to load video stream right now. Please try again later.')
        }
      }
    } finally {
      setStreamLoading(false)
    }
  }, [content, activeEpisode, activeSeason, isSeries])

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
    setStreamError('Unable to load video stream right now. Please try again later.')
  }, [])

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
      toast.info('Unlock episodes from the details page to avoid purchase errors.')
      navigate(`/content/${identifier}`)
      return
    }

    try {
      setPurchasing(true)
      await startDirectCheckout(identifier, content.title || 'this title')
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Purchase failed. Please try again.'
      toast.error(message)
    } finally {
      setPurchasing(false)
    }
  }

  if (loadingContent) {
    return (
      <div className={styles.loadingState}>
        <Loader fullScreen={false} text="Loading stream..." />
      </div>
    )
  }

  if (!content) return null

  const pageTitle =
    isSeries && activeEpisode
      ? `${content.title} • S${activeSeason}E${activeEpisode.episodeNumber} ${activeEpisode.title ? '– ' + activeEpisode.title : ''}`
      : content.title

  const description =
    isSeries && activeEpisode ? activeEpisode.description : content.description

  const shortTransactionRef = pendingTransactionRef ? pendingTransactionRef.slice(-8).toUpperCase() : null

  const durationLabel =
    content.contentType === 'Movie'
      ? `${content.duration ?? Math.round((content.watchProgress?.duration || 0) / 60)} min`
      : activeEpisode
      ? `${activeEpisode.duration} min`
      : '—'

  const unlockButtonDisabled = purchasing || paymentPolling

  const currentSeason = orderedSeasons.find((season) => season.seasonNumber === activeSeason)

  return (
    <div className={styles.page}>
      <div className={styles.backBar}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} />
          <span>Back to Browse</span>
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

            {(!canPlayCurrent || !streamSource) && (
              <div className={styles.playerOverlay}>
                <div className={styles.lockedPanel}>
                  <FiLock size={40} color="#FFD700" style={{ marginBottom: 16 }} />
                  <h2 className={styles.lockedTitle}>Unlock to watch this title</h2>
                  <p style={{ color: 'var(--text-gray)', marginBottom: 16 }}>
                    Purchase <strong>{content.title}</strong>{' '}
                    {isSeries && activeEpisode ? `to watch S${activeSeason}E${activeEpisode.episodeNumber}` : 'to start streaming in full HD.'}
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
                        {purchasing ? 'Opening checkout...' : paymentPolling ? 'Confirming...' : (
                          <>
                            <FiUnlock size={18} /> Pay & Unlock
                          </>
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`${styles.ctaButton} ${styles.secondaryCta}`}
                      onClick={() => navigate(`/content/${resolveContentIdentifier(content)}`)}
                    >
                      <FiPlay size={16} /> View Details
                    </button>
                  </div>
                  <p style={{ marginTop: 12, color: 'var(--text-gray)' }}>
                    Secure checkout powered by Flutterwave. Keep this page open while we confirm your payment.
                  </p>
                  {paymentPolling && (
                    <p style={{ marginTop: 4, color: 'var(--text-gray)' }}>
                      Waiting for confirmation{shortTransactionRef ? ` (Ref: ${shortTransactionRef})` : ''}.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {streamLoading && (
            <div className={styles.playerOverlay}>
              <Loader fullScreen={false} text="Fetching secure stream..." />
            </div>
          )}

          {streamError && <div className={styles.streamError}>{streamError}</div>}

          {autoNextCountdown !== null && pendingNextEpisode && (
            <div className={styles.autoNextBanner}>
              <p className={styles.autoNextTitle}>
                Next episode in <strong>{autoNextCountdown}s</strong>
              </p>
              <p style={{ color: 'var(--text-gray)' }}>
                S{pendingNextEpisode.seasonNumber}E{pendingNextEpisode.episode.episodeNumber}: {pendingNextEpisode.episode.title}
              </p>
              <div className={styles.autoNextActions}>
                <button className={`${styles.ctaButton} ${styles.primaryCta}`} onClick={playPendingEpisode}>
                  Play Now
                </button>
                <button className={`${styles.ctaButton} ${styles.secondaryCta}`} onClick={cancelAutoNext}>
                  Cancel
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
            <p className={styles.metaLabel}>Release Year</p>
            <p className={styles.metaValue}>{content.releaseYear || '—'}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>Rating</p>
            <p className={styles.metaValue}>{content.averageRating?.toFixed(1) || content.ageRating || 'NR'}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>Duration</p>
            <p className={styles.metaValue}>{durationLabel}</p>
          </div>
          <div className={styles.metaCard}>
            <p className={styles.metaLabel}>Language</p>
            <p className={styles.metaValue}>{content.language || content.countryOfOrigin || 'Kinyarwanda'}</p>
          </div>
        </div>
      </section>

      {isSeries && orderedSeasons.length > 0 && (
        <section className={styles.episodesSection}>
          <div className={styles.episodesHeader}>
            <h2 className={styles.metaTitle} style={{ fontSize: 24 }}>Episodes</h2>
            <div className={styles.episodesActions}>
              <button className={styles.toggleButton} onClick={() => setEpisodesOpen((prev) => !prev)}>
                {episodesOpen ? 'Hide List' : 'Show List'}
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
                  >
                    Season {season.seasonNumber}
                  </button>
                ))}
              </div>

              <div className={styles.episodesList}>
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
                        <div className={styles.episodeTitle}>{episode.title}</div>
                        <p className={styles.episodeDescription}>{episode.description}</p>
                        <div className={styles.episodeMeta}>
                          <span>{episode.duration} min</span>
                          {!unlocked && (
                            <span className={styles.episodeLock}>
                              <FiLock size={14} /> Locked
                            </span>
                          )}
                          {isActive && <span style={{ color: 'var(--primary-yellow)' }}>Now Playing</span>}
                        </div>
                      </div>
                      <FiChevronRight size={20} color="var(--text-gray)" />
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
