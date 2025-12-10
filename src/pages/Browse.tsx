import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { contentAPI } from '@/api/content'
import { getContinueWatching } from '@/api/watchHistory'
import { Content } from '@/types/content'
import { WatchHistoryItem } from '@/api/watchHistory'
import Layout from '@/components/layout/Layout'
import ContentRow from '@/components/content/ContentRow'
import ContinueWatching from '@/components/content/ContinueWatching'
import AnimatedCarousel from '@/components/content/AnimatedCarousel'
import FeaturedHero from '@/components/content/FeaturedHero'
import Loader from '@/components/common/Loader'
import Button from '@/components/common/Button'
import { toast } from 'react-toastify'
import styles from './Browse.module.css'

const Browse: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [newReleases, setNewReleases] = useState<Content[]>([])
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

      // First few items become trending/new releases
      setTrending(sortedContent.slice(0, 10))

      // Set new releases from combined and sorted content
      setNewReleases(sortedContent.slice(0, 15))

      // Set movies and series
      setMovies(safeMovies)
      setSeries(safeSeries)
      
      // Set continue watching if authenticated
      setContinueWatching(isAuthenticated ? continueWatchingRes : [])
    } catch (error) {
      console.error('Error in loadContent:', error)
      toast.error('Failed to load content')
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader fullScreen text="Loading content..." />
  }

  const heroPool = trending.length > 0
    ? trending
    : newReleases.length > 0
      ? newReleases
      : [...movies, ...series]

  const heroItems = heroPool.slice(0, 5)
  const hasAnyRows = trending.length > 0 || movies.length > 0 || series.length > 0
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

        {newReleases.length > 0 && (
          <section className={styles.section} aria-labelledby="new-releases-heading">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Latest drop</p>
                <h2 id="new-releases-heading">New Releases</h2>
              </div>
            </div>
            <AnimatedCarousel items={newReleases} title="" />
          </section>
        )}

        <div className={styles.sectionStack}>
          <ContentRow title="Trending Now" content={trending} hidePrice />
          <ContentRow title="Popular Movies" content={movies} viewAllLink="/movies" hidePrice />
          <ContentRow title="Top Series" content={series} viewAllLink="/series" hidePrice />
        </div>

        {showEmptyState && (
          <div className={styles.emptyState}>
            <h3>Catalog is warming up</h3>
            <p>We are curating fresh premieres. Check back soon or refresh to pull the latest titles.</p>
            <Button variant="primary" onClick={() => loadContent()}>
              Reload content
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Browse
