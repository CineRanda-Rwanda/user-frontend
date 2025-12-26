import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../api/content';
import { Content, Episode, Season } from '../types/content';
import { FiPlay, FiPlus, FiArrowLeft, FiInfo, FiUnlock, FiLock } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import ContentCard from '../components/content/ContentCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { initiateContentPurchase } from '../api/payment';
import { InitiateContentPurchaseRequest } from '../types/payment';
import { formatCurrency } from '../utils/formatters';
import styles from './ContentDetails.module.css';

const ContentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [content, setContent] = useState<Content | null>(null);
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [contentUnlocking, setContentUnlocking] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const paymentPollRef = useRef<number | null>(null);
  const [pendingTransactionRef, setPendingTransactionRef] = useState<string | null>(null);
  const [seasonUnlockingId, setSeasonUnlockingId] = useState<string | null>(null);
  const [episodeUnlockingId, setEpisodeUnlockingId] = useState<string | null>(null);

  const loadContentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const contentResponse = await contentAPI.getContentById(id!);
      const payload = contentResponse?.data?.data;
      const resolvedContent =
        payload?.movie ||
        payload?.series ||
        payload?.content ||
        payload ||
        contentResponse?.data;
      const normalizedContent = resolvedContent?.content ?? resolvedContent;

      if (!normalizedContent) throw new Error('Content not found');

      const mergedContent = {
        ...normalizedContent,
        isPurchased:
          normalizedContent.isPurchased ??
          payload?.isPurchased ??
          contentResponse?.data?.isPurchased ??
          normalizedContent.userAccess?.isPurchased ??
          false,
        userAccess: normalizedContent.userAccess ?? payload?.userAccess ?? contentResponse?.data?.userAccess,
      } as Content;

      setContent(mergedContent);

      if (mergedContent.contentType === 'Series' && mergedContent.seasons && mergedContent.seasons.length > 0) {
        const firstSeason = mergedContent.seasons[0];
        setActiveSeason(firstSeason.seasonNumber);
        if (firstSeason.episodes?.length > 0) {
          setActiveEpisode(firstSeason.episodes[0]);
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadRelatedContent = useCallback(async () => {
    try {
      const response = await contentAPI.getPublishedMovies(1, 10);
      const movies = response?.data?.data?.movies || response?.data?.data || [];
      setRelatedContent(Array.isArray(movies) ? movies.slice(0, 5) : []);
    } catch (error) {
      console.error('Error loading related content:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadContentDetails();
      loadRelatedContent();
    }
  }, [id, loadContentDetails, loadRelatedContent]);

  useEffect(() => () => {
    if (paymentPollRef.current) {
      window.clearInterval(paymentPollRef.current);
    }
  }, []);

  const resolveContentId = () => content?._id || (content as unknown as { id?: string })?.id || '';

  const requireAuthentication = (redirectPath: string) => {
    if (isAuthenticated) return true;
    toast.info('Please sign in to continue.');
    navigate('/login', { state: { from: redirectPath } });
    return false;
  };

  const handlePlayFullVideo = () => {
    if (!content) return;
    const contentId = resolveContentId();
    if (!contentId) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${contentId}` } });
      return;
    }

    if (content.contentType === 'Series' && activeEpisode) {
      navigate(`/watch/${contentId}?season=${activeSeason}&episode=${activeEpisode.episodeNumber}`);
    } else {
      navigate(`/watch/${contentId}`);
    }
  };

  const beginPaymentPolling = useCallback(
    (contentId: string) => {
      if (paymentPollRef.current) {
        window.clearInterval(paymentPollRef.current);
      }

      setPaymentPolling(true);
      const startedAt = Date.now();

      paymentPollRef.current = window.setInterval(() => {
        (async () => {
          try {
            const response = await contentAPI.checkAccess(contentId);
            const accessPayload = response?.data?.data || response?.data;
            const hasUnlocked = Boolean(
              accessPayload?.isPurchased ||
                accessPayload?.hasAccess ||
                accessPayload?.userAccess?.isPurchased
            );

            if (hasUnlocked) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current);
                paymentPollRef.current = null;
              }
              setPaymentPolling(false);
              setPendingTransactionRef(null);
              toast.success('Payment confirmed! Enjoy the show.');
              await loadContentDetails();
            } else if (Date.now() - startedAt > 5 * 60 * 1000) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current);
                paymentPollRef.current = null;
              }
              setPaymentPolling(false);
              setPendingTransactionRef(null);
              toast.info('Still waiting for payment confirmation. Refresh once checkout completes.');
            }
          } catch (pollError) {
            console.error('Error polling payment status:', pollError);
          }
        })();
      }, 5000);
    },
    [loadContentDetails]
  );

  const openCheckoutTab = (url: string) => {
    const checkoutWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (!checkoutWindow) {
      window.location.href = url;
    }
  };

  const startDirectCheckout = useCallback(
    async ({
      contentId,
      scopeLabel,
      payloadOverrides,
    }: {
      contentId: string;
      scopeLabel: string;
      payloadOverrides?: Partial<InitiateContentPurchaseRequest>;
    }) => {
      const response = await initiateContentPurchase({ contentId, ...payloadOverrides });
      const paymentLink = response?.paymentLink;
      if (!paymentLink) {
        throw new Error('Payment link unavailable.');
      }

      setPendingTransactionRef(response.transactionRef);
      toast.info(`Checkout opened in a new tab. Complete payment to unlock ${scopeLabel}.`);
      openCheckoutTab(paymentLink);
      beginPaymentPolling(contentId);
    },
    [beginPaymentPolling]
  );

  const handleUnlockContent = async () => {
    if (!content) return;
    const contentId = resolveContentId();
    if (!contentId) {
      toast.error('Unable to determine content identifier. Please refresh and try again.');
      return;
    }

    if (!requireAuthentication(`/content/${contentId}`)) {
      return;
    }

    try {
      setContentUnlocking(true);
      await startDirectCheckout({
        contentId,
        scopeLabel: content.title || 'this title',
        payloadOverrides: {
          scope: 'content',
        },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to initiate payment.';
      toast.error(message);
    } finally {
      setContentUnlocking(false);
    }
  };

  const handleUnlockSeason = async (season: Season) => {
    if (!content) return;
    const contentId = resolveContentId();
    if (!contentId) {
      toast.error('Unable to determine content identifier. Please refresh and try again.');
      return;
    }

    const redirectPath = `/content/${contentId}`;
    if (!requireAuthentication(redirectPath)) {
      return;
    }

    try {
      setSeasonUnlockingId(season._id);
      await startDirectCheckout({
        contentId,
        scopeLabel: `Season ${season.seasonNumber}`,
        payloadOverrides: {
          scope: 'season',
          seasonId: season._id,
          seasonNumber: season.seasonNumber,
        },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to initiate payment.';
      toast.error(message);
    } finally {
      setSeasonUnlockingId(null);
    }
  };

  const handleUnlockEpisode = async (episode: Episode, parentSeason?: Season) => {
    if (!content) return;
    const contentId = resolveContentId();
    if (!contentId) {
      toast.error('Unable to determine content identifier. Please refresh and try again.');
      return;
    }

    const redirectPath = `/content/${contentId}`;
    if (!requireAuthentication(redirectPath)) {
      return;
    }

    const owningSeason =
      parentSeason ||
      content.seasons?.find((entry) => entry.episodes?.some((item) => item._id === episode._id));

    if (!owningSeason) {
      toast.error('Unable to determine season for this episode. Please refresh and try again.');
      return;
    }

    try {
      setEpisodeUnlockingId(episode._id);
      await startDirectCheckout({
        contentId,
        scopeLabel: `Episode ${episode.episodeNumber}`,
        payloadOverrides: {
          scope: 'episode',
          seasonId: owningSeason._id,
          episodeId: episode._id,
          seasonNumber: owningSeason.seasonNumber,
          episodeNumber: episode.episodeNumber,
        },
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Unable to initiate payment.';
      toast.error(message);
    } finally {
      setEpisodeUnlockingId(null);
    }
  };

  const handleTrailer = async () => {
    try {
      let link = '';

      if (content?.contentType === 'Series' && activeEpisode?.trailerYoutubeLink) {
        link = activeEpisode.trailerYoutubeLink;
      } else if (content?.trailerYoutubeLink) {
        link = content.trailerYoutubeLink;
      } else if (content?._id) {
        const response = await contentAPI.getMovieTrailer(content._id);
        link =
          response?.data?.data?.movie?.trailerYoutubeLink ||
          response?.data?.data?.series?.trailerYoutubeLink ||
          '';
      }

      if (link) {
        const title =
          content?.contentType === 'Series' && activeEpisode
            ? `${content.title} - S${activeSeason}:E${activeEpisode.episodeNumber}`
            : content?.title || 'Trailer';
        navigate(`/trailer?url=${encodeURIComponent(link)}&title=${encodeURIComponent(title)}`);
      } else {
        toast.error('Trailer not available');
      }
    } catch (error) {
      toast.error('Failed to load trailer');
    }
  };

  const handleEpisodeClick = (episode: Episode, seasonNumber: number) => {
    setActiveEpisode(episode);
    setActiveSeason(seasonNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeasonSelect = (seasonNumber: number) => {
    if (!content?.seasons) return;
    const selectedSeason = content.seasons.find((season) => season.seasonNumber === seasonNumber);
    setActiveSeason(seasonNumber);
    const firstEpisode = selectedSeason?.episodes?.[0] || null;
    setActiveEpisode(firstEpisode);

    const panel = document.getElementById(`season-${seasonNumber}`);
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const isContentPurchased = Boolean(content?.isPurchased || content?.userAccess?.isPurchased);
  const isContentFree = Boolean(content?.isFree || content?.priceInRwf === 0);

  const unlockedEpisodeIds = useMemo(
    () => new Set(content?.userAccess?.unlockedEpisodes || []),
    [content?.userAccess?.unlockedEpisodes]
  );

  const isEpisodeUnlocked = useCallback(
    (episode?: Episode | null, parentSeason?: Season) => {
      if (!episode) return false;
      if (isContentPurchased) return true;
      if (episode.isFree || (episode.priceInRwf ?? 0) === 0 || episode.isUnlocked) return true;

      if (unlockedEpisodeIds.has(episode._id)) return true;

      const owningSeason =
        parentSeason ||
        content?.seasons?.find((season) =>
          season.episodes?.some((entry) => entry._id === episode._id)
        );

      if (owningSeason?.userAccess?.isPurchased) return true;
      if (owningSeason?.userAccess?.unlockedEpisodes?.includes(episode._id)) return true;

      return false;
    },
    [content, isContentPurchased, unlockedEpisodeIds]
  );

  const isSeasonUnlocked = useCallback(
    (season?: Season | null) => {
      if (!season) return false;
      if (isContentPurchased) return true;
      if (season.isFree) return true;
      if (
        (season.priceInRwf ?? season.seasonPriceInRwf ?? season.finalSeasonPrice?.price ?? 0) === 0
      ) {
        return true;
      }
      if (season.userAccess?.isPurchased) return true;

      const totalEpisodes = season.episodes?.length || 0;
      if (totalEpisodes === 0) return true;

      const unlockedCount =
        season.episodes?.filter((episode) => isEpisodeUnlocked(episode, season)).length || 0;

      return unlockedCount === totalEpisodes;
    },
    [isContentPurchased, isEpisodeUnlocked]
  );

  const getSeasonPriceInRwf = (season?: Season | null) => {
    if (!season) return 0;

    const withTotals = season as Season & {
      totalSeasonPriceInRwf?: number;
      totalPriceInRwf?: number;
    };

    const priceCandidates = [
      season.finalSeasonPrice?.price,
      season.priceInRwf,
      season.seasonPriceInRwf,
      withTotals.totalSeasonPriceInRwf,
      withTotals.totalPriceInRwf,
    ].filter((value): value is number => typeof value === 'number' && value > 0);

    if (priceCandidates.length > 0) {
      return priceCandidates[0];
    }

    return season.episodes?.reduce((sum, episode) => sum + (episode.priceInRwf || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader fullScreen={false} text="Loading title..." />
      </div>
    );
  }

  if (!content) return null;

  const isSeries = content.contentType === 'Series';
  const canStream =
    isContentPurchased ||
    isContentFree ||
    (isSeries && activeEpisode ? isEpisodeUnlocked(activeEpisode) : false);
  const isLocked = !canStream;
  const heroPriceLabel = formatCurrency(content.priceInRwf || 0);
  const shortTransactionRef = pendingTransactionRef ? pendingTransactionRef.slice(-8).toUpperCase() : null;
  const heroTitle =
    isSeries && activeEpisode
      ? `${content.title} - S${activeSeason}:E${activeEpisode.episodeNumber} - ${activeEpisode.title}`
      : content.title;
  const heroDescription = isSeries && activeEpisode ? activeEpisode.description : content.description;
  const heroDuration = isSeries && activeEpisode ? `${activeEpisode.duration} min` : `${content.duration ?? 0} min`;
  const totalSeasons = content.seasons?.length || 0;
  const totalEpisodes = content.seasons?.reduce((acc, season) => acc + (season.episodes?.length || 0), 0) || 0;
  const genreNames = Array.isArray(content.genres) ? content.genres.map((g) => g.name) : [];
  const primaryGenres = genreNames.slice(0, 3).join(' • ') || 'Drama';
  const primaryCreator = content.director || content.cast?.[0] || 'Randa Plus Studio';
  const primaryLanguage = content.language || content.countryOfOrigin || 'Kinyarwanda';
  const castNames = Array.isArray(content.cast) ? content.cast.filter(Boolean) : [];
  const castPreview = (() => {
    if (!castNames.length) return 'Not listed';
    const shown = castNames.slice(0, 3);
    const remaining = castNames.length - shown.length;
    return remaining > 0 ? `${shown.join(', ')} +${remaining} more` : shown.join(', ');
  })();
  const unlockInProgress = contentUnlocking || paymentPolling;

  const getEpisodeArtwork = (episode?: Episode | null) => {
    if (!content) return '';
    const episodeLike: any = episode || {};
    return (
      episodeLike.thumbnailUrl ||
      episodeLike.thumbnailImageUrl ||
      episodeLike.coverImageUrl ||
      content.posterImageUrl
    );
  };

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroBackground}>
            <img src={content.posterImageUrl} alt={content.title} className={styles.heroImage} />
            <div className={styles.heroOverlay} />
          </div>

          <div className={styles.heroContent}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <FiArrowLeft size={22} />
            </button>

            <div className={styles.heroGrid}>
              <div className={styles.heroVisual}>
                <div className={styles.heroPoster}>
                  <img src={content.posterImageUrl} alt={`${content.title} poster`} />
                  {isLocked && (
                    <>
                      <div className={styles.posterOverlay}>
                        <button
                          type="button"
                          onClick={handleUnlockContent}
                          disabled={unlockInProgress}
                          className={styles.posterUnlockButton}
                        >
                          {unlockInProgress ? (
                            paymentPolling ? 'Confirming...' : 'Unlocking...'
                          ) : (
                            <>
                              <FiUnlock size={18} />
                              {`Unlock • ${heroPriceLabel}`}
                            </>
                          )}
                        </button>
                        <p className={styles.posterHint}>
                          {!isAuthenticated
                            ? 'Sign in to unlock this title.'
                            : paymentPolling
                            ? 'Waiting for payment confirmation...'
                            : 'Complete the secure checkout to unlock instantly.'}
                        </p>
                        {shortTransactionRef && (
                          <p className={styles.posterHint}>
                            Ref: <strong>{shortTransactionRef}</strong>
                          </p>
                        )}
                      </div>
                      <div className={styles.posterLockBadge}>
                        <FiLock size={18} />
                      </div>
                    </>
                  )}
                  {!isLocked && (content.priceInRwf || 0) > 0 && (
                    <div className={styles.posterUnlockBadge}>
                      <FiUnlock size={18} />
                    </div>
                  )}
                  <div className={styles.posterGlow} />
                </div>
              </div>

              <div className={styles.heroDetails}>
                {isSeries && (
                  <div className={styles.badgeRow}>
                    <span>Series</span>
                    {genreNames.slice(0, 2).map((name) => (
                      <span key={name}>{name}</span>
                    ))}
                  </div>
                )}

                <h1 className={styles.heroTitle}>{heroTitle}</h1>

                <div className={styles.metaRow}>
                  <span>{content.releaseYear}</span>
                  <span className={styles.metaDot} />
                  <span>{heroDuration}</span>
                  <span className={styles.metaDot} />
                  <span>{primaryGenres}</span>
                  {isSeries && activeEpisode && (
                    <span className={styles.metaChip}>S{activeSeason} · EP {activeEpisode.episodeNumber}</span>
                  )}
                  <span className={styles.hdChip}>HD</span>
                </div>

                {isSeries && content.seasons && content.seasons.length > 0 && (
                  <div className={styles.seasonPicker}>
                    <label htmlFor="seasonSelect">Quick Season</label>
                    <select
                      id="seasonSelect"
                      className={styles.seasonSelect}
                      value={activeSeason}
                      onChange={(event) => handleSeasonSelect(Number(event.target.value))}
                    >
                      {content.seasons.map((season) => (
                        <option key={season._id} value={season.seasonNumber}>
                          {`Season ${season.seasonNumber}${season.seasonTitle ? ` · ${season.seasonTitle}` : ''}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className={styles.description}>{heroDescription}</p>

                <div className={styles.ctaRow}>
                  <button
                    onClick={canStream ? handlePlayFullVideo : handleUnlockContent}
                    className={styles.primaryCta}
                    disabled={!canStream && unlockInProgress}
                  >
                    {canStream ? (
                      <>
                        <FiPlay size={22} />
                        Watch Now
                      </>
                    ) : unlockInProgress ? (
                      paymentPolling ? 'Confirming...' : 'Unlocking...'
                    ) : (
                      <>
                        <FiUnlock size={22} />
                        {`Unlock • ${heroPriceLabel}`}
                      </>
                    )}
                  </button>
                  <button onClick={handleTrailer} className={styles.secondaryCta}>
                    <FiInfo size={22} />
                    Trailer
                  </button>
                  <button className={styles.circleCta}>
                    <FiPlus size={22} />
                  </button>
                </div>

                {!canStream && (
                  <div className={styles.lockInfo}>
                    <div className={styles.priceTag}>{heroPriceLabel}</div>
                    <div>
                      <p>Unlock once and stream in full HD forever.</p>
                      <p className={styles.walletHint}>
                        Secure checkout powered by Flutterwave. No wallet balance required.
                      </p>
                      {paymentPolling && (
                        <p className={styles.walletWarning}>
                          Waiting for payment confirmation{shortTransactionRef ? ` (Ref: ${shortTransactionRef})` : ''}.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Creator</p>
                    <p className={styles.statValue}>{primaryCreator}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Cast</p>
                    <p className={styles.statValue}>{castPreview}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Language</p>
                    <p className={styles.statValue}>{primaryLanguage}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Rating</p>
                    <p className={styles.statValue}>{content.averageRating?.toFixed(1) || content.ageRating || 'PG-13'}</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Episodes</p>
                    <p className={styles.statValue}>{totalEpisodes}</p>
                  </div>
                </div>
              </div>

              {isSeries && (
                <aside className={styles.upNextCard}>
                  <div className={styles.upNextImage}>
                    <img src={getEpisodeArtwork(activeEpisode)} alt={activeEpisode?.title || content.title} />
                  </div>
                  <p className={styles.upNextMeta}>Up Next</p>
                  <p className={styles.upNextTitle}>{activeEpisode?.title || content.title}</p>
                  <p className={styles.upNextDesc}>
                    {activeEpisode?.description || 'Dive into the next chapter of this exclusive series.'}
                  </p>
                  <div className={styles.upNextStats}>
                    <span>Duration</span>
                    <span>{(activeEpisode?.duration || content.duration || 0)} min</span>
                  </div>
                  <button onClick={handlePlayFullVideo} className={styles.upNextButton}>
                    Continue Episode
                  </button>
                </aside>
              )}
            </div>
          </div>
        </section>

        {isSeries && content.seasons && content.seasons.length > 0 && (
          <section className={styles.seasonsSection}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.badgeRow}>
                  <span>Randa Plus Originals</span>
                </div>
                <h3 className={styles.sectionTitle}>Seasons & Episodes</h3>
              </div>
              <p className={styles.sectionSubtitle}>
                {totalSeasons} Seasons · {totalEpisodes} Episodes
              </p>
            </div>

            {content.seasons.map((season) => {
              const seasonUnlocked = isSeasonUnlocked(season);
              const seasonPrice = getSeasonPriceInRwf(season);
              const seasonPriceLabel = seasonPrice > 0 ? formatCurrency(seasonPrice) : 'Free';
              const seasonUnlocking = seasonUnlockingId === season._id;
              const seasonHasEpisodes = (season.episodes?.length || 0) > 0;
              const showSeasonUnlock = !seasonUnlocked && seasonPrice > 0 && seasonHasEpisodes;

              return (
                <div key={season._id} id={`season-${season.seasonNumber}`} className={styles.seasonPanel}>
                  <div className={styles.seasonHeader}>
                    <div>
                      <div className={styles.seasonChip}>Season {season.seasonNumber}</div>
                      {season.seasonTitle && <p className={styles.sectionSubtitle}>{season.seasonTitle}</p>}
                    </div>
                    <div className={styles.seasonActions}>
                      <p className={styles.sectionSubtitle}>{season.episodes?.length || 0} Episodes</p>
                      <span className={styles.seasonPrice}>{seasonPriceLabel}</span>
                      {seasonUnlocked && (
                        <span className={styles.seasonUnlockedBadge}>
                          <FiUnlock size={14} /> Season unlocked
                        </span>
                      )}
                      {showSeasonUnlock && (
                        <button
                          type="button"
                          className={styles.seasonUnlockButton}
                          onClick={() => handleUnlockSeason(season)}
                          disabled={seasonUnlocking || paymentPolling}
                        >
                          {seasonUnlocking ? 'Unlocking...' : paymentPolling ? 'Confirming...' : 'Unlock Season'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.episodesList}>
                    {season.episodes?.map((episode) => {
                      const isActive = activeEpisode?._id === episode._id;
                      const episodeUnlocked = isEpisodeUnlocked(episode, season);
                      const episodePrice = episode.priceInRwf || 0;
                      const showEpisodeUnlock = !episodeUnlocked && episodePrice > 0;
                      const unlockingEpisode = episodeUnlockingId === episode._id;
                      const episodeClassName = `${styles.episodeCard} ${isActive ? styles.episodeCardActive : ''}`;
                      return (
                        <div
                          key={episode._id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleEpisodeClick(episode, season.seasonNumber)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleEpisodeClick(episode, season.seasonNumber);
                            }
                          }}
                          className={episodeClassName}
                        >
                          <div className={styles.episodeThumb}>
                            <img src={getEpisodeArtwork(episode)} alt={episode.title} className={styles.episodeImage} />
                            <div className={styles.episodeGrad} />
                            <div className={styles.episodeBadges}>
                              <span className={styles.episodeBadge}>EP {episode.episodeNumber}</span>
                              <span className={styles.episodeBadge}>{episode.duration}m</span>
                            </div>
                          </div>

                          <div className={styles.episodeBody}>
                            <div className={styles.episodeHeading}>
                              <div>
                                <p className={styles.sectionSubtitle}>Episode {episode.episodeNumber}</p>
                                <h5 className={styles.episodeTitle}>{episode.title}</h5>
                              </div>
                              {isActive && <span className={styles.nowPlaying}>Now Playing</span>}
                            </div>
                            <p>{episode.description}</p>
                            <div className={styles.episodeMeta}>
                              <span>{episode.duration} min</span>
                              {!episodeUnlocked && episodePrice > 0 && (
                                <span className={styles.episodeStatusLocked}>
                                  <FiLock size={14} /> Locked
                                </span>
                              )}
                              {episodeUnlocked && !isContentPurchased && (
                                <span className={styles.episodeStatusUnlocked}>
                                  <FiUnlock size={14} /> Unlocked
                                </span>
                              )}
                            </div>
                            <div className={styles.episodeFooter}>
                              <div className={styles.episodePricing}>
                                <span
                                  className={episodePrice > 0 ? styles.episodePrice : styles.episodePriceFree}
                                >
                                  {episodePrice > 0 ? formatCurrency(episodePrice) : 'Free'}
                                </span>
                              </div>
                              {showEpisodeUnlock && (
                                <button
                                  type="button"
                                  className={styles.episodeUnlockButton}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleUnlockEpisode(episode, season);
                                  }}
                                  disabled={unlockingEpisode || paymentPolling}
                                >
                                  {unlockingEpisode ? 'Unlocking...' : paymentPolling ? 'Confirming...' : 'Unlock Episode'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <div>
              <div className={styles.badgeRow}>
                <span>More To Love</span>
              </div>
              <h3 className={styles.relatedTitle}>Recommended For You</h3>
            </div>
            <span className={styles.relatedSubtitle}>Hand-picked from the Randa Plus vault</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {relatedContent.map((item) => (
              <ContentCard key={item._id} content={item} hidePrice />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ContentDetails;
