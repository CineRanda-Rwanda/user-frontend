import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiStar, FiPlay, FiFilm, FiTv, FiLayers, FiArrowLeft } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

import { contentAPI } from '../api/content';
import { userAPI } from '../api/user';
import { getContinueWatching, WatchHistoryItem } from '../api/watchHistory';
import { Content } from '../types/content';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import styles from './MyLibrary.module.css';

interface EpisodeAccessItem {
  episodeId: string;
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  duration?: number;
  thumbnailUrl?: string;
  description?: string;
}

interface EpisodeAccessGroup {
  contentId: string;
  content: Content | null;
  episodes: EpisodeAccessItem[];
}

const normalizeContentEntity = (raw: any): Content | null => {
  if (!raw || typeof raw !== 'object') return null;
  const entity = raw.content ?? raw;
  const wrapperMeta = raw.content
    ? Object.fromEntries(Object.entries(raw).filter(([key]) => key !== 'content'))
    : {};
  const fallbackId =
    entity._id ||
    entity.id ||
    entity.contentId ||
    entity.seriesId;

  if (!fallbackId) return null;
  return { ...entity, ...wrapperMeta, _id: fallbackId } as Content;
};

const extractContentFromResponse = (response: any): Content | null => {
  if (!response) return null;
  const payload = response?.data?.data ?? response?.data ?? response;
  const resolved =
    payload?.movie ||
    payload?.series ||
    payload?.content ||
    payload;
  return normalizeContentEntity(resolved);
};

const normalizeEpisodeAccess = (entry: any, options?: { episodeFallbackPrefix?: string }): EpisodeAccessItem | null => {
  if (!entry) return null;
  const rawEpisode = entry.episode || entry.episodeDetails || entry;
  const episodeId = entry.episodeId || rawEpisode?._id || entry._id;
  if (!episodeId) return null;

  const seasonNumber =
    entry.seasonNumber ??
    rawEpisode?.seasonNumber ??
    rawEpisode?.season?.seasonNumber;

  return {
    episodeId,
    title:
      rawEpisode?.title ||
      entry.title ||
      `${options?.episodeFallbackPrefix || 'Episode'} ${rawEpisode?.episodeNumber ?? entry.episodeNumber ?? ''}`,
    seasonNumber,
    episodeNumber: rawEpisode?.episodeNumber ?? entry.episodeNumber,
    duration: rawEpisode?.duration ?? entry.duration,
    thumbnailUrl:
      rawEpisode?.thumbnailUrl ||
      rawEpisode?.posterImageUrl ||
      rawEpisode?.thumbnailImageUrl ||
      entry.thumbnailUrl ||
      entry.posterImageUrl,
    description: rawEpisode?.description || entry.description,
  };
};

const MyLibrary: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [purchasedContent, setPurchasedContent] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Movie' | 'Series'>('all');
  const [episodeGroups, setEpisodeGroups] = useState<EpisodeAccessGroup[]>([]);
  const [episodeAccessLookup, setEpisodeAccessLookup] = useState<Record<string, EpisodeAccessGroup>>({});

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const [libraryResponse] = await Promise.all([
        userAPI.getLibrary().catch(err => {
          console.error('Library load error:', err);
          return { data: { data: { content: [] } } };
        }),
      ]);

      // Handle different response structures with safe navigation
      const libraryPayload = libraryResponse?.data?.data || libraryResponse?.data || {};

      const toContentArray = (value: unknown): Content[] =>
        (Array.isArray(value) ? value : [])
          .map((item) => normalizeContentEntity(item))
          .filter((item): item is Content => Boolean(item));

      const aggregatedContentMap = new Map<string, Content>();
      const registerContent = (entry?: Content | null) => {
        if (!entry?._id) return;
        aggregatedContentMap.set(entry._id, entry);
      };

      [...toContentArray(libraryPayload?.content),
        ...toContentArray(libraryPayload?.movies),
        ...toContentArray(libraryPayload?.series),
      ].forEach(registerContent);

      const purchasedEpisodesRaw = Array.isArray(libraryPayload?.purchasedEpisodes)
        ? libraryPayload.purchasedEpisodes
        : [];

      const episodeMap = new Map<string, EpisodeAccessGroup>();
      const missingSeriesIds = new Set<string>();

      purchasedEpisodesRaw.forEach((entry: any) => {
        const contentId =
          entry?.contentId ||
          entry?.content?._id ||
          entry?.seriesId;
        if (!contentId) return;

        if (!episodeMap.has(contentId)) {
          episodeMap.set(contentId, {
            contentId,
            content: aggregatedContentMap.get(contentId) || normalizeContentEntity(entry?.content),
            episodes: [],
          });
        }

        const group = episodeMap.get(contentId);
        if (!group) return;

        if (!group.content) {
          const normalized = normalizeContentEntity(entry?.content);
          if (normalized) {
            registerContent(normalized);
            group.content = normalized;
          } else {
            missingSeriesIds.add(contentId);
          }
        }

        const normalizedEpisode = normalizeEpisodeAccess(entry, { episodeFallbackPrefix: t('myLibrary.episodeFallback') });
        if (normalizedEpisode) {
          group.episodes.push(normalizedEpisode);
        }
      });

      if (missingSeriesIds.size > 0) {
        const fetchedSeries = await Promise.all(
          Array.from(missingSeriesIds).map(async (seriesId) => {
            try {
              const response = await contentAPI.getContentById(seriesId);
              return extractContentFromResponse(response);
            } catch (error) {
              console.warn('Unable to fetch series for library entry:', seriesId, error);
              return null;
            }
          })
        );

        fetchedSeries
          .filter((item): item is Content => Boolean(item))
          .forEach((item) => {
            registerContent(item);
            const group = episodeMap.get(item._id);
            if (group) {
              group.content = item;
            }
          });
      }

      const resolvedContent = Array.from(aggregatedContentMap.values());
      const getAddedAt = (item: any) => {
        const candidate =
          item?.unlockedAt ||
          item?.purchasedAt ||
          item?.addedAt ||
          item?.purchaseDate ||
          item?.updatedAt ||
          item?.createdAt;
        const ts = candidate ? new Date(candidate).getTime() : 0;
        return Number.isFinite(ts) ? ts : 0;
      };

      const sortedByLatestAdded = [...resolvedContent].sort((a: any, b: any) => getAddedAt(b) - getAddedAt(a));
      setPurchasedContent(sortedByLatestAdded);

      const resolvedEpisodeGroups = Array.from(episodeMap.values())
        .map((group) => ({
          ...group,
          episodes: group.episodes.sort((a, b) => {
            const seasonDelta = (a.seasonNumber || 0) - (b.seasonNumber || 0);
            if (seasonDelta !== 0) return seasonDelta;
            return (a.episodeNumber || 0) - (b.episodeNumber || 0);
          }),
        }))
        .filter((group) => group.episodes.length > 0 && group.content);

      setEpisodeGroups(resolvedEpisodeGroups);
      setEpisodeAccessLookup(
        resolvedEpisodeGroups.reduce<Record<string, EpisodeAccessGroup>>((acc, group) => {
          acc[group.contentId] = group;
          return acc;
        }, {})
      );
      setContinueWatching([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('myLibrary.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    getContinueWatching()
      .then((items) => {
        if (cancelled) return;
        setContinueWatching(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (cancelled) return;
        setContinueWatching([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredContent =
    filter === 'all'
      ? purchasedContent
      : purchasedContent.filter((c) => c.contentType === filter);

  const gridClassNames = [styles.grid];
  if (filteredContent.length === 1) {
    gridClassNames.push(styles.gridSingle);
  }

  const movieCount = purchasedContent.filter((c) => c.contentType === 'Movie').length;
  const seriesCount = purchasedContent.filter((c) => c.contentType === 'Series').length;
  const progressHours = continueWatching.reduce((total, item) => total + (item.watchedDuration || 0), 0) / 3600;
  const averageCompletion = continueWatching.length
    ? Math.round(
        continueWatching.reduce((acc, item) => acc + getProgressPercentage(item), 0) /
          continueWatching.length
      )
    : 0;

  const formatDuration = (seconds: number) => {
    const safeSeconds = Math.max(seconds, 0);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getProgressPercentage = (item: WatchHistoryItem) => {
    if (!item.totalDuration) return 0;
    return Math.min(100, Math.round((item.watchedDuration / item.totalDuration) * 100));
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
      return;
    }
    navigate('/browse');
  };

  const handleQuickPlay = (event: React.MouseEvent, content: Content) => {
    event.stopPropagation();
    if (content.contentType === 'Series') {
      navigate(`/content/${content._id}`);
    } else {
      navigate(`/watch/${content._id}`);
    }
  };

  const handleOpenDetails = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    navigate(`/content/${id}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader fullScreen={false} text={t('myLibrary.loading')} />
      </div>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.pageToolbar}>
          <button type="button" className={styles.backButton} onClick={handleGoBack}>
            <FiArrowLeft />
            <span>{t('common.back')}</span>
          </button>
        </div>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>{t('myLibrary.hero.eyebrow')}</p>
            <h1 className={styles.heroTitle}>{t('myLibrary.hero.title')}</h1>
            <p className={styles.heroSubtitle}>
              {t('myLibrary.hero.subtitle')}
            </p>
          </div>
          <div className={styles.heroSummary}>
            <div className={styles.summaryChip}>
              <FiLayers />
              <div>
                <p className={styles.summaryLabel}>{t('myLibrary.summary.librarySize')}</p>
                <p className={styles.summaryValue}>{t('myLibrary.summary.ownedTitles', { count: purchasedContent.length })}</p>
                <p className={styles.summaryMeta}>{t('myLibrary.summary.breakdown', { movies: movieCount, series: seriesCount })}</p>
              </div>
            </div>
            {continueWatching.length > 0 && (
              <div className={styles.summaryChip}>
                <FiPlay />
                <div>
                  <p className={styles.summaryLabel}>{t('myLibrary.summary.inProgress')}</p>
                  <p className={styles.summaryValue}>{t('myLibrary.summary.waiting', { count: continueWatching.length })}</p>
                  <p className={styles.summaryMeta}>{t('myLibrary.summary.avgCompletion', { percent: averageCompletion })}</p>
                </div>
              </div>
            )}
            {progressHours > 0 && (
              <div className={styles.summaryChip}>
                <FiStar />
                <div>
                  <p className={styles.summaryLabel}>{t('myLibrary.summary.hoursWatched')}</p>
                  <p className={styles.summaryValue}>
                    {progressHours >= 10 ? progressHours.toFixed(1) : progressHours.toFixed(2)} {t('myLibrary.summary.hoursShort')}
                  </p>
                  <p className={styles.summaryMeta}>{t('myLibrary.summary.hoursHint')}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {continueWatching.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{t('myLibrary.resume.eyebrow')}</p>
                <h2 className={styles.sectionTitle}>{t('myLibrary.resume.title')}</h2>
              </div>
              <p className={styles.sectionHint}>
                {t('myLibrary.resume.hint', { count: continueWatching.length })}
              </p>
            </div>
            <div className={styles.carousel}>
              {continueWatching.map((item) => (
                <div
                  key={item._id}
                  className={styles.progressCard}
                  onClick={() => navigate(`/watch/${item.movieId}`)}
                >
                  <div className={styles.progressThumb}>
                    <img src={item.content.posterImageUrl} alt={item.content.title} />
                    <div className={styles.progressOverlay}>
                      <div className={styles.progressPlay}>
                        <FiPlay size={20} />
                      </div>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${getProgressPercentage(item)}%` }}
                      />
                    </div>
                  </div>
                  <div className={styles.progressMeta}>
                    <h3>{item.content.title}</h3>
                    <div className={styles.progressInfo}>
                      <span>{t('myLibrary.resume.watched', { percent: getProgressPercentage(item) })}</span>
                      <span>{t('myLibrary.resume.left', { duration: formatDuration(item.totalDuration - item.watchedDuration) })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.filterBar}>
          {[
            { key: 'all', label: t('myLibrary.filters.all', { count: purchasedContent.length }), icon: <FiLayers /> },
            { key: 'Movie', label: t('myLibrary.filters.movies', { count: movieCount }), icon: <FiFilm /> },
            { key: 'Series', label: t('myLibrary.filters.series', { count: seriesCount }), icon: <FiTv /> },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key as 'all' | 'Movie' | 'Series')}
              className={`${styles.filterChip} ${filter === option.key ? styles.filterChipActive : ''}`}
            >
              <span className={styles.filterLabel}>
                {option.icon}
                {option.label}
              </span>
            </button>
          ))}
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionEyebrow}>{t('myLibrary.collection.eyebrow')}</p>
              <h2 className={styles.sectionTitle}>
                {filter === 'all'
                  ? t('myLibrary.collection.allTitles')
                  : filter === 'Movie'
                    ? t('myLibrary.collection.movies')
                    : t('myLibrary.collection.series')}
              </h2>
            </div>
            <p className={styles.sectionHint}>
              {t('myLibrary.collection.hint', { count: filteredContent.length })}
            </p>
          </div>

          {filteredContent.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>📚</div>
              <h3>{t('myLibrary.empty.title')}</h3>
              <p>{t('myLibrary.empty.message')}</p>
              <button type="button" className={styles.emptyAction} onClick={() => navigate('/browse')}>
                {t('myLibrary.empty.cta')}
              </button>
            </div>
          ) : (
            <div className={gridClassNames.join(' ')}>
              {filteredContent.map((content) => {
                const partialSeriesAccess = episodeAccessLookup[content._id];
                const showPartialBadge =
                  content.contentType === 'Series' &&
                  partialSeriesAccess &&
                  !(content.isPurchased || content.userAccess?.isPurchased);

                const badgeLabel = showPartialBadge
                  ? t('myLibrary.badge.partialUnlocked', { count: partialSeriesAccess.episodes.length })
                  : t('myLibrary.badge.owned');

                return (
                <div
                  key={content._id}
                  className={styles.card}
                  onClick={() => navigate(`/content/${content._id}`)}
                >
                  <div className={styles.cardPoster}>
                    <img src={content.posterImageUrl} alt={content.title} />
                    <div className={styles.cardOverlay}>
                      <span className={`${styles.ownedBadge} ${showPartialBadge ? styles.partialBadge : ''}`}>
                        {badgeLabel}
                      </span>
                      <div className={styles.overlayMeta}>
                        <FiStar color="#f5c518" />
                        <span>{content.averageRating?.toFixed(1) || t('myLibrary.rating.na')}</span>
                        <span>•</span>
                        <span>{content.releaseYear}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.primaryAction}
                          onClick={(event) => handleQuickPlay(event, content)}
                        >
                          <FiPlay /> {t('myLibrary.actions.watch')}
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          onClick={(event) => handleOpenDetails(event, content._id)}
                        >
                          {t('myLibrary.actions.details')}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{content.title}</h3>
                    <div className={styles.cardMeta}>
                      <span>
                        {content.contentType === 'Movie'
                          ? t('myLibrary.contentType.movie')
                          : t('myLibrary.contentType.series')}
                      </span>
                      {content.duration && content.contentType === 'Movie' && (
                        <span>• {t('myLibrary.duration.minutes', { minutes: content.duration })}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </section>

        {episodeGroups.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{t('myLibrary.episodes.eyebrow')}</p>
                <h2 className={styles.sectionTitle}>{t('myLibrary.episodes.title')}</h2>
              </div>
              <p className={styles.sectionHint}>
                {t('myLibrary.episodes.totalUnlocked', {
                  count: episodeGroups.reduce((count, group) => count + group.episodes.length, 0)
                })}
              </p>
            </div>

            <div className={styles.partialGrid}>
              {episodeGroups.map((group) => (
                <div key={group.contentId} className={styles.partialCard}>
                  <div className={styles.partialHeader}>
                    <div className={styles.partialPoster}>
                      <img
                        src={group.content?.posterImageUrl}
                        alt={group.content?.title || t('myLibrary.fallbacks.series')}
                      />
                    </div>
                    <div>
                      <p className={styles.sectionEyebrow}>{t('myLibrary.contentType.series')}</p>
                      <h3 className={styles.partialTitle}>{group.content?.title || t('myLibrary.fallbacks.series')}</h3>
                      <p className={styles.partialHint}>
                        {t('myLibrary.episodes.unlockedCount', { count: group.episodes.length })}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.partialDetails}
                      onClick={() => navigate(`/content/${group.contentId}`)}
                    >
                      {t('myLibrary.episodes.viewSeries')}
                    </button>
                  </div>

                  <div className={styles.partialEpisodes}>
                    {group.episodes.map((episode) => (
                      <div key={`${group.contentId}-${episode.episodeId}`} className={styles.partialEpisode}>
                        <div>
                          <p className={styles.partialEpisodeMeta}>
                            S{episode.seasonNumber ?? '?'} · E{episode.episodeNumber ?? '?'}
                          </p>
                          <h4>{episode.title}</h4>
                          <p className={styles.partialEpisodeDesc}>{episode.description}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.partialWatch}
                          onClick={() =>
                            navigate(
                              `/watch/${group.contentId}?season=${episode.seasonNumber || 1}&episode=${episode.episodeNumber || 1}`
                            )
                          }
                        >
                          <FiPlay size={16} />
                          {t('myLibrary.actions.watch')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default MyLibrary;
