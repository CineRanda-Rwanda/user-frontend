import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import {
  getLocalizedContentDescription,
  getLocalizedContentTitle,
  getLocalizedEpisodeDescription,
  getLocalizedEpisodeTitle,
  getLocalizedText,
  hasLocalizedText,
} from '../utils/localizeContent';
import { useAutoTranslate } from '../hooks/useAutoTranslate';
import { normalizeSupportedLanguage } from '../utils/translate';
import styles from './ContentDetails.module.css';

const ContentDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();

  const [content, setContent] = useState<Content | null>(null);
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [contentUnlocking, setContentUnlocking] = useState(false);
  const [paymentPolling, setPaymentPolling] = useState(false);
  const paymentPollRef = useRef<number | null>(null);
  const [pendingTransactionRef, setPendingTransactionRef] = useState<string | null>(null);
  const [episodeUnlockingId, setEpisodeUnlockingId] = useState<string | null>(null);
  const [seasonUnlockingId, setSeasonUnlockingId] = useState<string | null>(null);
  const lastCheckoutRef = useRef<{ url: string; openedAt: number } | null>(null);

  // Machine-translation fallback for dynamic backend content.
  // Hooks must run on every render (including loading states), so we compute safe defaults.
  const targetLanguage = normalizeSupportedLanguage(i18n.resolvedLanguage || i18n.language);
  const baseContentTitle = getLocalizedContentTitle(content, targetLanguage);
  const baseContentDescription = getLocalizedContentDescription(content, targetLanguage);
  const baseEpisodeTitle = activeEpisode ? getLocalizedEpisodeTitle(activeEpisode, targetLanguage) : '';
  const baseEpisodeDescription = activeEpisode ? getLocalizedEpisodeDescription(activeEpisode, targetLanguage) : '';

  const shouldTranslateContentTitle =
    targetLanguage !== 'en' && !hasLocalizedText(content, 'title', targetLanguage);
  const shouldTranslateContentDescription =
    targetLanguage !== 'en' && !hasLocalizedText(content, 'description', targetLanguage);
  const shouldTranslateEpisodeTitle =
    targetLanguage !== 'en' && !hasLocalizedText(activeEpisode, 'title', targetLanguage);
  const shouldTranslateEpisodeDescription =
    targetLanguage !== 'en' && !hasLocalizedText(activeEpisode, 'description', targetLanguage);

  const translatedContentTitle = useAutoTranslate(baseContentTitle, targetLanguage, {
    enabled: shouldTranslateContentTitle,
    source: 'en',
  });
  const translatedContentDescription = useAutoTranslate(baseContentDescription, targetLanguage, {
    enabled: shouldTranslateContentDescription,
    source: 'en',
  });
  const translatedEpisodeTitle = useAutoTranslate(baseEpisodeTitle, targetLanguage, {
    enabled: shouldTranslateEpisodeTitle,
    source: 'en',
  });
  const translatedEpisodeDescription = useAutoTranslate(baseEpisodeDescription, targetLanguage, {
    enabled: shouldTranslateEpisodeDescription,
    source: 'en',
  });

  const resolveEpisodeId = (episode?: Episode | null) => {
    if (!episode) return '';
    return episode._id || (episode as unknown as { id?: string })?.id || '';
  };

  const resolveEpisodePriceInRwf = (episode?: Episode | null): number | null => {
    if (!episode) return null;
    const maybe = (episode as unknown as { priceInRwf?: unknown })?.priceInRwf;
    return typeof maybe === 'number' ? maybe : null;
  };

  const resolveSeriesDiscountPercent = (series?: Content | null): number => {
    if (!series) return 0;
    const fromPercent = (series as unknown as { seriesDiscountPercent?: unknown })?.seriesDiscountPercent;
    if (typeof fromPercent === 'number' && Number.isFinite(fromPercent) && fromPercent > 0) return fromPercent;

    const fromFinal = (series as unknown as { finalSeriesPrice?: { discount?: unknown } })?.finalSeriesPrice?.discount;
    if (typeof fromFinal === 'number' && Number.isFinite(fromFinal) && fromFinal > 0) return fromFinal;

    return 0;
  };

  const resolveEpisodeEffectivePriceInRwf = (episode?: Episode | null, series?: Content | null): number | null => {
    const base = resolveEpisodePriceInRwf(episode);
    if (typeof base !== 'number') return null;
    if (!series || series.contentType !== 'Series') return base;

    const discountPercent = resolveSeriesDiscountPercent(series);
    if (!discountPercent || discountPercent <= 0) return base;
    if (base <= 0) return base;

    // Match typical backend discounting; 500 with 9% discount => 455.
    const discounted = Math.round(base * (100 - discountPercent) / 100);
    return discounted;
  };

  const resolveSeriesIsFree = (series: Content): boolean => {
    if (series.isFree) return true;
    const seasons = series.seasons || [];
    if (seasons.length === 0) return false;

    for (const season of seasons) {
      for (const episode of season.episodes || []) {
        if (episode.isFree) continue;
        const price = resolveEpisodePriceInRwf(episode);
        // If pricing is missing, do NOT assume free.
        if (typeof price !== 'number') return false;
        if (price > 0) return false;
      }
    }

    return true;
  };

  const resolveUnlockedEpisodeIds = (contentLike: Content, season?: Season | null) => {
    const ids = new Set<string>();

    const pushAll = (list?: unknown) => {
      if (!Array.isArray(list)) return;
      list.forEach((value) => {
        if (typeof value === 'string' && value.trim()) ids.add(value);
      });
    };

    pushAll(contentLike.userAccess?.unlockedEpisodes);
    pushAll(season?.userAccess?.unlockedEpisodes);
    return ids;
  };

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
        const orderedSeasons = [...mergedContent.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);

        const pickFirstUnlockedEpisode = () => {
          for (const season of orderedSeasons) {
            const orderedEpisodes = [...(season.episodes || [])].sort((a, b) => a.episodeNumber - b.episodeNumber);
            for (const episode of orderedEpisodes) {
              const episodeId = resolveEpisodeId(episode);
              const unlockedIds = resolveUnlockedEpisodeIds(mergedContent, season);
              const explicitPrice = resolveEpisodePriceInRwf(episode);
              const isUnlocked = Boolean(
                mergedContent.isPurchased ||
                  mergedContent.userAccess?.isPurchased ||
                  mergedContent.isFree ||
                  season.userAccess?.isPurchased ||
                  episode.isFree ||
                  episode.isUnlocked ||
                  (typeof explicitPrice === 'number' && explicitPrice === 0) ||
                  (episodeId && unlockedIds.has(episodeId))
              );

              if (isUnlocked) {
                return { seasonNumber: season.seasonNumber, episode };
              }
            }
          }
          return null;
        };

        const initial = pickFirstUnlockedEpisode();
        const firstSeason = orderedSeasons[0];
        const firstEpisode = firstSeason?.episodes?.[0] || null;

        if (initial) {
          setActiveSeason(initial.seasonNumber);
          setActiveEpisode(initial.episode);
        } else if (firstSeason) {
          setActiveSeason(firstSeason.seasonNumber);
          setActiveEpisode(firstEpisode);
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
      const canPlayEpisode = Boolean(isContentPurchased || isContentFree || isEpisodeUnlocked(activeEpisode));
      if (!canPlayEpisode) {
        toast.info('This episode is locked. Unlock it to watch.');
        return;
      }
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

  const beginSeasonUnlockPolling = useCallback(
    ({ contentId, seasonId }: { contentId: string; seasonId: string }) => {
      if (paymentPollRef.current) {
        window.clearInterval(paymentPollRef.current);
      }

      setPaymentPolling(true);
      const startedAt = Date.now();

      paymentPollRef.current = window.setInterval(() => {
        (async () => {
          try {
            const response = await contentAPI.getContentById(contentId);
            const payload = response?.data?.data;
            const resolvedContent = payload?.movie || payload?.series || payload?.content || payload || response?.data;
            const normalized = resolvedContent?.content ?? resolvedContent;

            const seasons: Season[] = Array.isArray(normalized?.seasons) ? normalized.seasons : [];
            const targetSeason = seasons.find((season) => season?._id === seasonId);

            const hasUnlocked = Boolean(
              targetSeason?.userAccess?.isPurchased ||
                // Some variants may expose season-level unlock flags differently.
                (targetSeason as unknown as { isUnlocked?: boolean })?.isUnlocked
            );

            if (hasUnlocked) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current);
                paymentPollRef.current = null;
              }
              setPaymentPolling(false);
              setPendingTransactionRef(null);
              toast.success('Season unlocked! Enjoy the episodes.');
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
            console.error('Error polling season unlock status:', pollError);
          }
        })();
      }, 5000);
    },
    [loadContentDetails]
  );

  const beginEpisodeUnlockPolling = useCallback(
    ({ contentId, episodeId }: { contentId: string; episodeId: string }) => {
      if (paymentPollRef.current) {
        window.clearInterval(paymentPollRef.current);
      }

      setPaymentPolling(true);
      const startedAt = Date.now();

      paymentPollRef.current = window.setInterval(() => {
        (async () => {
          try {
            const response = await contentAPI.getContentById(contentId);
            const payload = response?.data?.data;
            const resolvedContent = payload?.movie || payload?.series || payload?.content || payload || response?.data;
            const normalized = resolvedContent?.content ?? resolvedContent;
            const normalizedUserAccess = normalized?.userAccess ?? payload?.userAccess;

            const unlockedIds = new Set<string>(Array.isArray(normalizedUserAccess?.unlockedEpisodes) ? normalizedUserAccess.unlockedEpisodes : []);

            let isUnlocked = unlockedIds.has(episodeId);

            if (!isUnlocked && Array.isArray(normalized?.seasons)) {
              for (const season of normalized.seasons as Season[]) {
                const seasonAccess = season?.userAccess;
                if (Array.isArray(seasonAccess?.unlockedEpisodes) && seasonAccess.unlockedEpisodes.includes(episodeId)) {
                  isUnlocked = true;
                  break;
                }

                for (const episode of season.episodes || []) {
                  const idCandidate = resolveEpisodeId(episode);
                  if (idCandidate === episodeId && episode.isUnlocked) {
                    isUnlocked = true;
                    break;
                  }
                }

                if (isUnlocked) break;
              }
            }

            if (isUnlocked) {
              if (paymentPollRef.current) {
                window.clearInterval(paymentPollRef.current);
                paymentPollRef.current = null;
              }
              setPaymentPolling(false);
              setPendingTransactionRef(null);
              toast.success('Episode unlocked! Enjoy the show.');
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
            console.error('Error polling episode unlock status:', pollError);
          }
        })();
      }, 5000);
    },
    [loadContentDetails]
  );

  const openCheckoutTab = (url: string) => {
    const now = Date.now();
    const last = lastCheckoutRef.current;
    if (last && last.url === url && now - last.openedAt < 1500) {
      return;
    }
    lastCheckoutRef.current = { url, openedAt: now };

    // Redirect in the same tab (replace current page) per UX request.
    window.location.replace(url);
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
      const amount = typeof response?.amount === 'number' ? response.amount : null;
      const discount = typeof response?.discount === 'number' ? response.discount : null;
      const amountLabel = amount !== null ? formatCurrency(amount) : null;
      toast.info(
        amountLabel
          ? discount && discount > 0
            ? `Redirecting to checkout. Pay ${amountLabel} (discount applied) to unlock ${scopeLabel}.`
            : `Redirecting to checkout. Pay ${amountLabel} to unlock ${scopeLabel}.`
          : `Redirecting to checkout. Complete payment to unlock ${scopeLabel}.`
      );
      openCheckoutTab(paymentLink);
      if (payloadOverrides?.scope === 'episode' && payloadOverrides.episodeId) {
        beginEpisodeUnlockPolling({ contentId, episodeId: payloadOverrides.episodeId });
      } else if (payloadOverrides?.scope === 'season' && payloadOverrides.seasonId) {
        beginSeasonUnlockPolling({ contentId, seasonId: payloadOverrides.seasonId });
      } else {
        beginPaymentPolling(contentId);
      }
    },
    [beginEpisodeUnlockPolling, beginPaymentPolling, beginSeasonUnlockPolling]
  );

  const handleUnlockContent = async () => {
    if (!content) return;
    if (content.contentType === 'Series') {
      toast.info('Select a season or episode to unlock.');
      return;
    }
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

    const episodeId = resolveEpisodeId(episode);
    const owningSeason =
      parentSeason ||
      content.seasons?.find((entry) => entry.episodes?.some((item) => resolveEpisodeId(item) === episodeId));

    if (!owningSeason) {
      toast.error('Unable to determine season for this episode. Please refresh and try again.');
      return;
    }

    try {
      setEpisodeUnlockingId(episodeId);
      await startDirectCheckout({
        contentId,
        scopeLabel: `Episode ${episode.episodeNumber}`,
        payloadOverrides: {
          scope: 'episode',
          seasonId: owningSeason._id,
          episodeId,
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

  const isSeriesContent = content?.contentType === 'Series';
  // IMPORTANT: for series, `userAccess.isPurchased` is not reliable as "all episodes unlocked"
  // (e.g., episodes added after a season purchase may still require per-episode unlock).
  // Only treat content-level purchase as a full unlock for movies.
  const isContentPurchased = Boolean(content?.isPurchased || content?.userAccess?.isPurchased);
  const isContentFree = content
    ? isSeriesContent
      ? resolveSeriesIsFree(content)
      : Boolean(content.isFree || content.priceInRwf === 0)
    : false;

  const unlockedEpisodeIds = useMemo(
    () => new Set(content?.userAccess?.unlockedEpisodes || []),
    [content?.userAccess?.unlockedEpisodes]
  );

  const isEpisodeUnlocked = useCallback(
    (episode?: Episode | null, parentSeason?: Season) => {
      if (!episode) return false;
      if (isContentPurchased) return true;

      // IMPORTANT: Some API responses omit priceInRwf (or include other pricing fields).
      // Treat an episode as unlocked only when it's explicitly free/unlocked or appears
      // in user access lists; do not infer "free" from missing pricing.
      if (episode.isFree) return true;
      if (episode.isUnlocked) return true;
      const explicitPrice = resolveEpisodePriceInRwf(episode);
      if (typeof explicitPrice === 'number' && explicitPrice === 0) return true;

      const episodeId = resolveEpisodeId(episode);
      if (episodeId && unlockedEpisodeIds.has(episodeId)) return true;

      const owningSeason =
        parentSeason ||
        content?.seasons?.find((season) =>
          season.episodes?.some((entry) => resolveEpisodeId(entry) === episodeId)
        );

      if (owningSeason?.userAccess?.isPurchased) return true;
      if (episodeId && owningSeason?.userAccess?.unlockedEpisodes?.includes(episodeId)) return true;

      return false;
    },
    [content, isContentPurchased, unlockedEpisodeIds]
  );

  const orderedEpisodeRefs = useMemo(() => {
    if (!content || content.contentType !== 'Series' || !content.seasons) return [] as Array<{ seasonNumber: number; episode: Episode }>;
    return [...content.seasons]
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .flatMap((season) =>
        [...(season.episodes || [])]
          .sort((a, b) => a.episodeNumber - b.episodeNumber)
          .map((episode) => ({ seasonNumber: season.seasonNumber, episode }))
      );
  }, [content]);

  const activeEpisodeIndex = useMemo(() => {
    if (!activeEpisode) return -1;
    const activeId = resolveEpisodeId(activeEpisode);
    return orderedEpisodeRefs.findIndex((ref) => resolveEpisodeId(ref.episode) === activeId);
  }, [activeEpisode, orderedEpisodeRefs]);

  const goToAdjacentEpisode = (delta: -1 | 1) => {
    if (activeEpisodeIndex < 0) return;
    const next = orderedEpisodeRefs[activeEpisodeIndex + delta];
    if (!next) return;
    setActiveSeason(next.seasonNumber);
    setActiveEpisode(next.episode);
  };
    [content, isContentPurchased, unlockedEpisodeIds]
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

  const language = targetLanguage;
  const localizedContentTitle = translatedContentTitle.text || baseContentTitle;
  const localizedContentDescription = translatedContentDescription.text || baseContentDescription;

  const isSeries = content.contentType === 'Series';
  const activeSeasonObj = isSeries
    ? content.seasons?.find((season) => season.seasonNumber === activeSeason) || null
    : null;

  const activeEpisodeUnlocked =
    isSeries && activeEpisode ? isEpisodeUnlocked(activeEpisode, activeSeasonObj || undefined) : false;

  const canStream = isSeries
    ? Boolean(isContentFree || activeEpisodeUnlocked)
    : Boolean(isContentPurchased || isContentFree);
  const isLocked = !canStream;

  const activeEpisodePrice = isSeries && activeEpisode ? resolveEpisodeEffectivePriceInRwf(activeEpisode, content) : null;
  const heroPriceLabel = isSeries
    ? activeEpisodePrice && activeEpisodePrice > 0
      ? formatCurrency(activeEpisodePrice)
      : activeEpisode?.isFree
      ? 'Free'
      : 'Paid'
    : formatCurrency(content.priceInRwf || 0);

  const shortTransactionRef = pendingTransactionRef ? pendingTransactionRef.slice(-8).toUpperCase() : null;
  const localizedEpisodeTitle =
    isSeries && activeEpisode ? translatedEpisodeTitle.text || baseEpisodeTitle : '';
  const localizedEpisodeDescription =
    isSeries && activeEpisode ? translatedEpisodeDescription.text || baseEpisodeDescription : '';
  const heroTitle =
    isSeries && activeEpisode
      ? `${localizedContentTitle} - S${activeSeason}:E${activeEpisode.episodeNumber} - ${localizedEpisodeTitle}`
      : localizedContentTitle;
  const heroDescription = isSeries && activeEpisode ? localizedEpisodeDescription : localizedContentDescription;
  const heroDuration = isSeries && activeEpisode ? `${activeEpisode.duration} min` : `${content.duration ?? 0} min`;
  const totalSeasons = content.seasons?.length || 0;
  const totalEpisodes = content.seasons?.reduce((acc, season) => acc + (season.episodes?.length || 0), 0) || 0;
  const genreNames = Array.isArray(content.genres)
    ? content.genres.map((g) => getLocalizedText(g, 'name', language) || g.name)
    : [];
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

  const handlePrimaryUnlock = () => {
    if (!content) return;
    if (content.contentType !== 'Series') {
      handleUnlockContent();
      return;
    }

    if (!activeEpisode || !activeSeasonObj) {
      toast.error('Please select an episode to unlock.');
      return;
    }

    handleUnlockEpisode(activeEpisode, activeSeasonObj);
  };

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
            <img src={content.posterImageUrl} alt={localizedContentTitle} className={styles.heroImage} />
            <div className={styles.heroOverlay} />
          </div>

          <div className={styles.heroContent}>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              <FiArrowLeft size={22} />
            </button>

            <div className={styles.heroGrid}>
              <div className={styles.heroVisual}>
                <div className={styles.heroPoster}>
                  <img src={content.posterImageUrl} alt={`${localizedContentTitle} poster`} />
                  {isLocked && (
                    <>
                      <div className={styles.posterOverlay}>
                        <button
                          type="button"
                          onClick={handlePrimaryUnlock}
                          disabled={unlockInProgress}
                          className={styles.posterUnlockButton}
                        >
                          {unlockInProgress ? (
                            paymentPolling ? 'Confirming...' : 'Unlocking...'
                          ) : (
                            <>
                              <FiUnlock size={18} />
                              {isSeries
                                ? heroPriceLabel === 'Paid'
                                  ? 'Unlock Episode'
                                  : `Unlock Episode • ${heroPriceLabel}`
                                : `Unlock • ${heroPriceLabel}`}
                            </>
                          )}
                        </button>
                        <p className={styles.posterHint}>
                          {!isAuthenticated
                            ? 'Sign in to unlock this title.'
                            : paymentPolling
                            ? 'Waiting for payment confirmation...'
                            : isSeries
                            ? 'Complete checkout to unlock this episode instantly.'
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
                    onClick={canStream ? handlePlayFullVideo : handlePrimaryUnlock}
                    className={styles.primaryCta}
                    disabled={!canStream && unlockInProgress}
                  >
                    {canStream ? (
                      <>
                        <FiPlay size={22} />
                        {isSeries ? 'Watch Episode' : 'Watch Now'}
                      </>
                    ) : unlockInProgress ? (
                      paymentPolling ? 'Confirming...' : 'Unlocking...'
                    ) : (
                      <>
                        <FiUnlock size={22} />
                        {isSeries
                          ? heroPriceLabel === 'Paid'
                            ? 'Unlock Episode'
                            : `Unlock Episode • ${heroPriceLabel}`
                          : `Unlock • ${heroPriceLabel}`}
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
                      <p>{isSeries ? 'Unlock the episode to start watching.' : 'Unlock once and stream in full HD forever.'}</p>
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

                  <div className={styles.upNextNavRow}>
                    <button
                      type="button"
                      className={styles.upNextNavButton}
                      onClick={() => goToAdjacentEpisode(-1)}
                      disabled={activeEpisodeIndex <= 0}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className={styles.upNextNavButton}
                      onClick={() => goToAdjacentEpisode(1)}
                      disabled={activeEpisodeIndex < 0 || activeEpisodeIndex >= orderedEpisodeRefs.length - 1}
                    >
                      Next
                    </button>
                  </div>
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
              const showSeasonUnlock = !seasonUnlocked && !isContentPurchased && !season.isFree && seasonPrice > 0;
              const unlockingSeason = seasonUnlockingId === season._id;

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
                      {showSeasonUnlock && (
                        <button
                          type="button"
                          className={styles.seasonUnlockButton}
                          onClick={() => handleUnlockSeason(season)}
                          disabled={unlockingSeason || paymentPolling}
                        >
                          {unlockingSeason ? 'Unlocking...' : paymentPolling ? 'Confirming...' : 'Unlock Season'}
                        </button>
                      )}
                      {seasonUnlocked && (
                        <span className={styles.seasonUnlockedBadge}>
                          <FiUnlock size={14} /> Season unlocked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={styles.episodesList}>
                    {season.episodes?.map((episode) => {
                      const isActive = activeEpisode?._id === episode._id;
                      const episodeUnlocked = isEpisodeUnlocked(episode, season);
                      const episodePrice = resolveEpisodeEffectivePriceInRwf(episode, content);
                      const showEpisodeUnlock = !episodeUnlocked && !episode.isFree && !seasonUnlocked && !isContentPurchased;
                      const resolvedEpisodeId = resolveEpisodeId(episode);
                      const unlockingEpisode = episodeUnlockingId === resolvedEpisodeId;
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
                              {!episodeUnlocked && !episode.isFree && (
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
                                  className={episodePrice && episodePrice > 0 ? styles.episodePrice : styles.episodePriceFree}
                                >
                                  {episode.isFree
                                    ? 'Free'
                                    : episodePrice && episodePrice > 0
                                    ? formatCurrency(episodePrice)
                                    : 'Paid'}
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
