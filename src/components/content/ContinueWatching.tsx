import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WatchHistoryItem } from '@/api/watchHistory';
import { ProgressBar } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import styles from './ContinueWatching.module.css';

interface ContinueWatchingProps {
  items: WatchHistoryItem[];
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ items }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (items.length === 0) return null;

  const handleWatch = (item: WatchHistoryItem) => {
    // Watch route is unified: /watch/:id handles both movies & series
    navigate(`/watch/${item.movieId}`);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeRemaining = (watched: number, total: number): string => {
    const remaining = total - watched;
    return formatDuration(remaining);
  };

  return (
    <section className={styles.continueWatching}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('myLibrary.resume.title')}</h2>
        <button 
          className={styles.viewAll}
          onClick={() => navigate('/my-library?filter=in-progress')}
        >
          {t('common.viewAll')}
        </button>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <button
            key={item._id}
            className={styles.card}
            type="button"
            onClick={() => handleWatch(item)}
            aria-label={t('content.card.openAria', { title: item.content?.title || t('common.untitled') })}
          >
            <div className={styles.thumbnail}>
              <img
                src={item.content?.posterImageUrl || '/placeholder-poster.jpg'}
                alt={item.content?.title || t('common.content')}
                className={styles.poster}
              />
              
              {/* Play Overlay */}
              <div className={styles.playOverlay}>
                <div className={styles.playButton}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Progress Bar */}
              <div className={styles.progressWrapper}>
                <ProgressBar 
                  value={item.progress} 
                  size="sm" 
                  color="yellow"
                  className={styles.progress}
                />
              </div>
            </div>

            <div className={styles.info}>
              <h3 className={styles.contentTitle}>
                {item.content?.title || t('common.untitled')}
              </h3>
              <div className={styles.meta}>
                <span className={styles.progressText}>
                  {t('myLibrary.resume.watched', { percent: Math.round(item.progress) })}
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.remaining}>
                  {t('myLibrary.resume.left', { duration: getTimeRemaining(item.watchedDuration, item.totalDuration) })}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatching;
