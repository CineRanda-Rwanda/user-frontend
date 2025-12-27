import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { contentAPI } from '@/api/content'
import { getContinueWatching } from '@/api/watchHistory'
import { Content } from '@/types/content'
import { WatchHistoryItem } from '@/api/watchHistory'
import Layout from '@/components/layout/Layout'
import ContentRow from '@/components/content/ContentRow'
import ContinueWatching from '@/components/content/ContinueWatching'
import FeaturedHero from '@/components/content/FeaturedHero'
import Loader from '@/components/common/Loader'
import Button from '@/components/common/Button'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import styles from './Browse.module.css'

const Browse: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [trending, setTrending] = useState<Content[]>([])
  const [movies, setMovies] = useState<Content[]>([])
  const [series, setSeries] = useState<Content[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([])

  useEffect(() => {
    loadContent()
  }, [isAuthenticated])

  const loadContent = async () => {
    try {
      setLoading(true)
      // Load all content in parallel using the new API structure
      const [moviesRes, seriesRes] = await Promise.all([
        contentAPI.getContentByType('Movie', 1, 20),
        contentAPI.getContentByType('Series', 1, 20),
      ])

      let continueWatchingRes: WatchHistoryItem[] = []
      if (isAuthenticated) {
        try {
          continueWatchingRes = await getContinueWatching()
        } catch (error) {
          console.error('Error loading continue watching:', error)
          continueWatchingRes = []
        }
      }

      // Extract data from responses
      // API Response format: { status, results, pagination, data: { content: [] } }
      const moviesData = moviesRes.data?.data?.content || moviesRes.data?.content || []
      const seriesData = seriesRes.data?.data?.content || seriesRes.data?.content || []

      // Ensure arrays
      const safeMovies = Array.isArray(moviesData) ? moviesData : []
      const safeSeries = Array.isArray(seriesData) ? seriesData : []

      // Build a simple "featured" set from newest content
      const allContent = [...safeMovies, ...safeSeries]
      const sortedContent = allContent.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )

      // First few items become trending selections
      setTrending(sortedContent.slice(0, 10))

      // Set movies and series
      setMovies(safeMovies)
      setSeries(safeSeries)
      
      // Set continue watching if authenticated
      setContinueWatching(isAuthenticated ? continueWatchingRes : [])
    } catch (error) {
      console.error('Error in loadContent:', error)
      toast.error(t('browse.errors.loadFailed'))
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader fullScreen text={t('browse.loading')} />
  }

  const heroPool = trending.length > 0
    ? trending
    : movies.length > 0
      ? movies
      : series

  const heroItems = heroPool.slice(0, 5)

  const dedupeById = (items: Content[]) => {
    const seen = new Set<string>()
    const out: Content[] = []
    for (const item of items) {
      if (!item?._id) continue
      if (seen.has(item._id)) continue
      seen.add(item._id)
      out.push(item)
    }
    return out
  }

  const allUnique = dedupeById([...(movies || []), ...(series || [])])
  const catalogSize = allUnique.length
  const heroPrimaryId = heroItems[0]?._id

  const hasMovies = movies.length > 0
  const hasSeries = series.length > 0

  const smallCatalogPicks = allUnique.filter((c) => c._id !== heroPrimaryId)
  // Only show the extra "Explore" row when we have at least 3 titles.
  // With 2 titles (e.g., 1 movie + 1 series), the hero rotation already gives both visibility and a single-item row looks awkward.
  const showSmallCatalogRow = catalogSize >= 3 && catalogSize <= 6 && smallCatalogPicks.length > 0

  const smallCatalogTitle = hasSeries && !hasMovies
    ? t('browse.smallCatalog.exploreSeries')
    : hasMovies && !hasSeries
      ? t('browse.smallCatalog.exploreMovies')
      : t('browse.smallCatalog.exploreTitles')
  const smallCatalogViewAllLink = hasSeries && !hasMovies ? '/series' : hasMovies && !hasSeries ? '/movies' : undefined

  const showFullRows = catalogSize > 6
  const hasAnyRows = catalogSize > 0
  const showEmptyState = !loading && !hasAnyRows

  return (
    <Layout>
      {heroItems.length > 0 && (
        <FeaturedHero content={heroItems} hidePrice />
      )}

      <div className={styles.page}>
        {/* Continue Watching - Only for authenticated users */}
        {isAuthenticated && continueWatching.length > 0 && (
          <ContinueWatching items={continueWatching} />
        )}

        <div className={styles.sectionStack}>
          {showSmallCatalogRow && (
            <ContentRow
              title={smallCatalogTitle}
              content={smallCatalogPicks}
              viewAllLink={smallCatalogViewAllLink}
              hidePrice
            />
          )}

          {showFullRows && (
            <>
              <ContentRow title={t('browse.rows.trendingNow')} content={trending} hidePrice autoAdvance />
              <ContentRow title={t('browse.rows.popularMovies')} content={movies} viewAllLink="/movies" hidePrice />
              <ContentRow title={t('browse.rows.topSeries')} content={series} viewAllLink="/series" hidePrice />
            </>
          )}
        </div>

        {showEmptyState && (
          <div className={styles.emptyState}>
            <h3>{t('browse.empty.title')}</h3>
            <p>{t('browse.empty.message')}</p>
            <Button variant="primary" onClick={() => loadContent()}>
              {t('browse.empty.reload')}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Browse
