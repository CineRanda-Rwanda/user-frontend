import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { contentAPI } from '@/api/content'
import { getContinueWatching } from '@/api/watchHistory'
import { Content } from '@/types/content'
import { WatchHistoryItem } from '@/api/watchHistory'
import Layout from '@/components/layout/Layout'
import FeaturedHero from '@/components/content/FeaturedHero'
import ContentRow from '@/components/content/ContentRow'
import ContinueWatching from '@/components/content/ContinueWatching'
import AnimatedCarousel from '@/components/content/AnimatedCarousel'
import SearchBar from '@/components/search/SearchBar'
import Loader from '@/components/common/Loader'
import { toast } from 'react-toastify'
import styles from './Browse.module.css'

const Browse: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<Content[]>([])
  const [newReleases, setNewReleases] = useState<Content[]>([])
  const [trending, setTrending] = useState<Content[]>([])
  const [movies, setMovies] = useState<Content[]>([])
  const [series, setSeries] = useState<Content[]>([])
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)

      // Load all content in parallel using the new API structure
      const promises = [
        contentAPI.getFeaturedMovies(),
        contentAPI.getPublishedMovies(1, 20),
        contentAPI.getPublishedSeries(1, 20),
      ]

      // Only load continue watching if user is authenticated
      if (isAuthenticated) {
        promises.push(getContinueWatching().catch(() => []))
      }

      const results = await Promise.all(promises)
      const [featuredRes, moviesRes, seriesRes, continueWatchingRes] = results

      // Extract data from responses (handle API response structure)
      const featuredData = featuredRes.data?.data?.movies || featuredRes.data?.movies || []
      const moviesData = moviesRes.data?.data?.movies || moviesRes.data?.movies || []
      const seriesData = seriesRes.data?.data?.series || seriesRes.data?.series || []

      // Ensure arrays
      const safeFeatured = Array.isArray(featuredData) ? featuredData : []
      const safeMovies = Array.isArray(moviesData) ? moviesData : []
      const safeSeries = Array.isArray(seriesData) ? seriesData : []

      // Set featured content
      setFeatured(safeFeatured)

      // Set trending (use featured as trending for now)
      setTrending(safeFeatured.slice(0, 10))

      // Set new releases (combine movies and series, sorted by creation date)
      const allContent = [...safeMovies, ...safeSeries]
      const sortedContent = allContent.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      setNewReleases(sortedContent.slice(0, 15))

      // Set movies and series
      setMovies(safeMovies)
      setSeries(safeSeries)
      
      // Set continue watching if authenticated
      if (isAuthenticated && continueWatchingRes) {
        setContinueWatching(continueWatchingRes)
      }
    } catch (error) {
      toast.error('Failed to load content')
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Implement search logic or navigate to search page
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
    }
  }

  if (loading) {
    return <Loader fullScreen text="Loading content..." />
  }

  return (
    <Layout>
      {/* Featured Hero */}
      <FeaturedHero content={featured} hidePrice />

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
