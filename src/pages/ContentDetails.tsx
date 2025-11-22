import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentAPI } from '../api/content';
import { Content, Episode } from '../types/content';
import { FiPlay, FiPlus, FiArrowLeft, FiInfo } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import ContentCard from '../components/content/ContentCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
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

  useEffect(() => {
    if (id) {
      loadContentDetails();
      loadRelatedContent();
    }
  }, [id]);

  const loadContentDetails = async () => {
    try {
      setLoading(true);
      const contentResponse = await contentAPI.getContentById(id!);
      const contentData =
        contentResponse?.data?.data?.movie ||
        contentResponse?.data?.data?.series ||
        contentResponse?.data?.data ||
        contentResponse?.data;

      if (!contentData) throw new Error('Content not found');
      setContent(contentData);

      if (contentData.contentType === 'Series' && contentData.seasons?.length > 0) {
        const firstSeason = contentData.seasons[0];
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
  };

  const loadRelatedContent = async () => {
    try {
      const response = await contentAPI.getPublishedMovies(1, 10);
      const movies = response?.data?.data?.movies || response?.data?.data || [];
      setRelatedContent(Array.isArray(movies) ? movies.slice(0, 5) : []);
    } catch (error) {
      console.error('Error loading related content:', error);
    }
  };

  const handlePlayFullVideo = () => {
    if (!content) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/watch/${content._id}` } });
      return;
    }

    if (content.contentType === 'Series' && activeEpisode) {
      navigate(`/watch/${content._id}?season=${activeSeason}&episode=${activeEpisode.episodeNumber}`);
    } else {
      navigate(`/watch/${content._id}`);
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader fullScreen={false} text="Loading title..." />
      </div>
    );
  }

  if (!content) return null;

  const isSeries = content.contentType === 'Series';
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
  const primaryCreator = content.director || content.cast?.[0] || 'Cineranda Studio';
  const primaryLanguage = content.language || content.countryOfOrigin || 'Kinyarwanda';

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
                  <button onClick={handlePlayFullVideo} className={styles.primaryCta}>
                    <FiPlay size={22} />
                    Watch Now
                  </button>
                  <button onClick={handleTrailer} className={styles.secondaryCta}>
                    <FiInfo size={22} />
                    Trailer
                  </button>
                  <button className={styles.circleCta}>
                    <FiPlus size={22} />
                  </button>
                </div>

                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <p className={styles.statLabel}>Creator</p>
                    <p className={styles.statValue}>{primaryCreator}</p>
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
                  <span>Cineranda Originals</span>
                </div>
                <h3 className={styles.sectionTitle}>Seasons & Episodes</h3>
              </div>
              <p className={styles.sectionSubtitle}>
                {totalSeasons} Seasons · {totalEpisodes} Episodes
              </p>
            </div>

            {content.seasons.map((season) => (
              <div key={season._id} id={`season-${season.seasonNumber}`} className={styles.seasonPanel}>
                <div className={styles.seasonHeader}>
                  <div className={styles.seasonChip}>Season {season.seasonNumber}</div>
                  <p className={styles.sectionSubtitle}>{season.episodes?.length || 0} Episodes</p>
                </div>

                <div className={styles.episodesList}>
                  {season.episodes?.map((episode) => {
                    const isActive = activeEpisode?._id === episode._id;
                    const episodeClassName = `${styles.episodeCard} ${isActive ? styles.episodeCardActive : ''}`;
                    return (
                      <button
                        type="button"
                        key={episode._id}
                        onClick={() => handleEpisodeClick(episode, season.seasonNumber)}
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
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
            <span className={styles.relatedSubtitle}>Hand-picked from the Cineranda vault</span>
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
