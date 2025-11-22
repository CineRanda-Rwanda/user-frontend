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
import Loader from '@/components/common/Loader'
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
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      console.log('Starting to load content...')
      console.log('Is Authenticated:', isAuthenticated)

      // Load all content in parallel using the new API structure
      const promises = [
        contentAPI.getContentByType('Movie', 1, 20),
        contentAPI.getContentByType('Series', 1, 20),
      ]

      // Only load continue watching if user is authenticated
      if (isAuthenticated) {
        promises.push(getContinueWatching().catch(() => []))
      }

      const results = await Promise.all(promises)
      const [moviesRes, seriesRes, continueWatchingRes] = results

      // Debug: Log the responses
      console.log('Movies Response:', moviesRes)
      console.log('Series Response:', seriesRes)

      // Extract data from responses
      // API Response format: { status, results, pagination, data: { content: [] } }
      const moviesData = moviesRes.data?.data?.content || moviesRes.data?.content || []
      const seriesData = seriesRes.data?.data?.content || seriesRes.data?.content || []

      console.log('Extracted Movies:', moviesData)
      console.log('Extracted Series:', seriesData)

      // Ensure arrays
      const safeMovies = Array.isArray(moviesData) ? moviesData : []
      const safeSeries = Array.isArray(seriesData) ? seriesData : []

      console.log('Final Movies Count:', safeMovies.length)
      console.log('Final Series Count:', safeSeries.length)

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
      
      console.log('State updated - Featured:', sortedContent.slice(0, 10).length, 'Movies:', safeMovies.length, 'Series:', safeSeries.length)
      
      // Set continue watching if authenticated
      if (isAuthenticated && continueWatchingRes) {
        setContinueWatching(continueWatchingRes)
      }
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

  console.log('Rendering Browse - Movies:', movies.length, 'Series:', series.length, 'Trending:', trending.length)

  return (
    <Layout>
      {/* Animated Carousel for New Releases */}
      {newReleases.length > 0 && (
        <AnimatedCarousel 
          items={newReleases}
          title="New Releases"
        />
      )}

      {/* Continue Watching - Only for authenticated users */}
      {isAuthenticated && continueWatching.length > 0 && (
        <ContinueWatching items={continueWatching} />
      )}

      {/* Content Rows */}
      <ContentRow title="Trending Now" content={trending} hidePrice />
      <ContentRow title="Popular Movies" content={movies} viewAllLink="/movies" hidePrice />
      <ContentRow title="Top Series" content={series} viewAllLink="/series" hidePrice />
    </Layout>
  )
}

export default Browse
