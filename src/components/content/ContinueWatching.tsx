import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WatchHistoryItem } from '@/api/watchHistory';
import { ProgressBar } from '@/components/ui';
import styles from './ContinueWatching.module.css';

interface ContinueWatchingProps {
  items: WatchHistoryItem[];
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const handleWatch = (item: WatchHistoryItem) => {
    // Navigate to watch page for the content
    if (item.contentType === 'Movie') {
      navigate(`/watch/movie/${item.movieId}`);
    } else {
      navigate(`/watch/series/${item.movieId}`);
    }
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
        <h2 className={styles.title}>Continue Watching</h2>
        <button 
          className={styles.viewAll}
          onClick={() => navigate('/my-library?filter=in-progress')}
        >
          View All
        </button>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div
            key={item._id}
            className={styles.card}
            onClick={() => handleWatch(item)}
          >
            <div className={styles.thumbnail}>
              <img
                src={item.content?.posterImageUrl || '/placeholder-poster.jpg'}
                alt={item.content?.title || 'Content'}
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
                {item.content?.title || 'Untitled'}
              </h3>
              <div className={styles.meta}>
                <span className={styles.progressText}>
                  {Math.round(item.progress)}% watched
                </span>
                <span className={styles.dot}>•</span>
                <span className={styles.remaining}>
                  {getTimeRemaining(item.watchedDuration, item.totalDuration)} left
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatching;
