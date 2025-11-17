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
import styles from './Movies.module.css'

const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadMovies()
  }, [searchQuery, sortBy, currentPage])

  const loadMovies = async () => {
    try {
      setLoading(true)
      
      let result
      if (searchQuery) {
        result = await contentAPI.searchMovies(searchQuery, currentPage, 20)
      } else {
        result = await contentAPI.getPublishedMovies(currentPage, 20)
      }

      const moviesData = result.data?.data?.movies || result.data?.movies || []
      let filteredMovies = Array.isArray(moviesData) ? moviesData : []

      // Apply sorting
      filteredMovies = applySorting(filteredMovies)

      setMovies(filteredMovies)
      setTotalPages(result.data?.data?.totalPages || 1)
    } catch (error) {
      toast.error('Failed to load movies')
      console.error('Error loading movies:', error)
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
          <h1 className={styles.title}>Movies</h1>
          <p className={styles.subtitle}>Discover amazing movies from our collection</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <SearchBar 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search movies..."
            />
          </div>
          <SortDropdown value={sortBy} onChange={handleSortChange} />
        </div>

        <div className={styles.content}>
          <main className={styles.main}>
            {loading ? (
              <Loader text="Loading movies..." />
            ) : movies.length === 0 ? (
              <div className={styles.empty}>
                <p>No movies found</p>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {movies.map(movie => (
                    <ContentCard key={movie._id} content={movie} />
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

export default Movies
