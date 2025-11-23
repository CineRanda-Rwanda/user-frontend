import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/user';
import { getContinueWatching, WatchHistoryItem } from '../api/watchHistory';
import { Content } from '../types/content';
import { toast } from 'react-toastify';
import { FiStar, FiPlay, FiClock, FiFilm, FiTv, FiLayers } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Loader from '../components/common/Loader';
import styles from './MyLibrary.module.css';

const MyLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [purchasedContent, setPurchasedContent] = useState<Content[]>([]);
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'Movie' | 'Series'>('all');

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const [libraryResponse, continueWatchingData] = await Promise.all([
        userAPI.getLibrary().catch(err => {
          console.error('Library load error:', err);
          return { data: { data: { content: [] } } };
        }),
        getContinueWatching().catch(err => {
          console.error('Continue watching error:', err);
          return [];
        }),
      ]);
      
      // Handle different response structures with safe navigation
      const libraryData = libraryResponse?.data?.data?.content || 
                         libraryResponse?.data?.content || 
                         [];
      setPurchasedContent(Array.isArray(libraryData) ? libraryData : []);
      setContinueWatching(Array.isArray(continueWatchingData) ? continueWatchingData : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent =
    filter === 'all'
      ? purchasedContent
      : purchasedContent.filter((c) => c.contentType === filter);

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
        <Loader fullScreen={false} text="Loading your library..." />
      </div>
    );
  }

  return (
    <Layout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Your Collection</p>
            <h1 className={styles.heroTitle}>All of your stories in one cinematic shelf.</h1>
            <p className={styles.heroSubtitle}>
              Revisit what you love, resume where you left off, and explore every title you own with a
              streamlined, premium experience.
            </p>
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Total Titles</p>
              <p className={styles.statValue}>{purchasedContent.length || '0'}</p>
              <p className={styles.statHint}>
                {movieCount} movies · {seriesCount} series
              </p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>In Progress</p>
              <p className={styles.statValue}>{continueWatching.length || '0'}</p>
              <p className={styles.statHint}>Average completion {averageCompletion}%</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>Hours Watched</p>
              <p className={styles.statValue}>{progressHours >= 1 ? progressHours.toFixed(1) : progressHours.toFixed(2)}</p>
              <p className={styles.statHint}>Tracked across your devices</p>
            </div>
          </div>
        </section>

        {continueWatching.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Resume</p>
                <h2 className={styles.sectionTitle}>Continue Watching</h2>
              </div>
              <p className={styles.sectionHint}>
                {continueWatching.length} {continueWatching.length === 1 ? 'title' : 'titles'} waiting · Keep the momentum
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
                      <span>{getProgressPercentage(item)}% watched</span>
                      <span>{formatDuration(item.totalDuration - item.watchedDuration)} left</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.filterBar}>
          {[
            { key: 'all', label: `All (${purchasedContent.length})`, icon: <FiLayers /> },
            { key: 'Movie', label: `Movies (${movieCount})`, icon: <FiFilm /> },
            { key: 'Series', label: `Series (${seriesCount})`, icon: <FiTv /> },
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
              <p className={styles.sectionEyebrow}>Collection</p>
              <h2 className={styles.sectionTitle}>
                {filter === 'all' ? 'All Titles' : `${filter === 'Movie' ? 'Movies' : 'Series'}`}
              </h2>
            </div>
            <p className={styles.sectionHint}>
              {filteredContent.length} {filteredContent.length === 1 ? 'title' : 'titles'} curated just for you
            </p>
          </div>

          {filteredContent.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyEmoji}>📚</div>
              <h3>Nothing here yet</h3>
              <p>Browse our catalog and start building your premium collection.</p>
              <button type="button" className={styles.emptyAction} onClick={() => navigate('/browse')}>
                Go to Browse
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredContent.map((content) => (
                <div
                  key={content._id}
                  className={styles.card}
                  onClick={() => navigate(`/content/${content._id}`)}
                >
                  <div className={styles.cardPoster}>
                    <img src={content.posterImageUrl} alt={content.title} />
                    <div className={styles.cardOverlay}>
                      <span className={styles.ownedBadge}>OWNED</span>
                      <div className={styles.overlayMeta}>
                        <FiStar color="#f5c518" />
                        <span>{content.averageRating?.toFixed(1) || 'N/A'}</span>
                        <span>•</span>
                        <span>{content.releaseYear}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.primaryAction}
                          onClick={(event) => handleQuickPlay(event, content)}
                        >
                          <FiPlay /> Watch
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryAction}
                          onClick={(event) => handleOpenDetails(event, content._id)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{content.title}</h3>
                    <div className={styles.cardMeta}>
                      <span>{content.contentType}</span>
                      {content.duration && content.contentType === 'Movie' && <span>• {content.duration}m</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default MyLibrary;
