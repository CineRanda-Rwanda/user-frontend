import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import Layout from '@/components/layout/Layout'
import ContentCard from '@/components/content/ContentCard'
import SearchBar from '@/components/search/SearchBar'
import SortDropdown, { SortOption } from '@/components/search/SortDropdown'
import Loader from '@/components/common/Loader'
import { toast } from 'react-toastify'
import styles from './Series.module.css'

const Series: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [series, setSeries] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadSeries()
  }, [searchQuery, sortBy, currentPage])

  const loadSeries = async () => {
    try {
      setLoading(true)
      
      // For now, just load all series and filter locally if search query exists
      const result = await contentAPI.getPublishedSeries(currentPage, 20)

      const seriesData = result.data?.data?.series || result.data?.series || []
      let filteredSeries = Array.isArray(seriesData) ? seriesData : []

      // Apply search filter if query exists
      if (searchQuery) {
        filteredSeries = filteredSeries.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply sorting
      filteredSeries = applySorting(filteredSeries)

      setSeries(filteredSeries)
      setTotalPages(result.data?.data?.totalPages || 1)
    } catch (error) {
      toast.error('Failed to load series')
      console.error('Error loading series:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySorting = (data: Content[]) => {
    const sorted = [...data]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        )
      case 'title-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'title-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title))
      case 'rating-high':
        return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      case 'rating-low':
        return sorted.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))
      case 'price-low':
        return sorted.sort((a, b) => (a.priceInCoins || 0) - (b.priceInCoins || 0))
      case 'price-high':
        return sorted.sort((a, b) => (b.priceInCoins || 0) - (a.priceInCoins || 0))
      default:
        return sorted
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    if (query) {
      setSearchParams({ q: query })
    } else {
      setSearchParams({})
    }
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setSearchParams({ sort: newSort })
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Series</h1>
          <p className={styles.subtitle}>Explore captivating series and shows</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search series..."
            />
          </div>
          <SortDropdown value={sortBy} onChange={handleSortChange} />
        </div>

        <div className={styles.content}>
          <main className={styles.main}>
            {loading ? (
              <Loader text="Loading series..." />
            ) : series.length === 0 ? (
              <div className={styles.empty}>
                <p>No series found</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {series.map(item => (
                    <ContentCard key={item._id} content={item} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className={styles.paginationButton}
                    >
                      Previous
                    </button>
                    <span className={styles.pageInfo}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className={styles.paginationButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default Series
