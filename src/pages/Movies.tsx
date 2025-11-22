import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import Layout from '@/components/layout/Layout'
import ContentCard from '@/components/content/ContentCard'
import FeaturedHero from '@/components/content/FeaturedHero'
import FilterPanel, { SearchFilters } from '@/components/search/FilterPanel'
import SortDropdown, { SortOption } from '@/components/search/SortDropdown'
import Loader from '@/components/common/Loader'
import { toast } from 'react-toastify'
import styles from './Movies.module.css'

const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const selectedId = searchParams.get('selected')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [genres, setGenres] = useState<Array<{ _id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([])
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'Movie',
    genres: [],
    categories: [],
    priceRange: 'all'
  })
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  useEffect(() => {
    loadMovies()
  }, [sortBy, currentPage, filters])

  // Effect to handle selected content
  useEffect(() => {
    const loadSelectedContent = async () => {
      if (!selectedId) {
        setSelectedContent(null)
        return
      }

      // Check if it's already in the list
      const found = movies.find(m => m._id === selectedId)
      if (found) {
        setSelectedContent(found)
        return
      }

      // If not found, fetch it
      try {
        const response = await contentAPI.getMovieById(selectedId)
        const movieData = response.data?.data?.movie || response.data?.data || response.data
        if (movieData) {
          setSelectedContent(movieData)
        }
      } catch (error) {
        console.error('Failed to load selected movie:', error)
      }
    }

    loadSelectedContent()
  }, [selectedId, movies])

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [genresRes, categoriesRes] = await Promise.all([
          contentAPI.getGenres(),
          contentAPI.getCategories()
        ])
        
        const genresData = genresRes.data?.data || genresRes.data || []
        const categoriesData = categoriesRes.data?.data || categoriesRes.data || []
        
        setGenres(Array.isArray(genresData) ? genresData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      } catch (error) {
        console.error('Failed to load genres/categories:', error)
      }
    }
    loadFilters()
  }, [])

  const loadMovies = async () => {
    try {
      setLoading(true)
      
      let result
      
      // If genre filter is applied, use genre endpoint
      if (filters.genres.length === 1) {
        result = await contentAPI.getMoviesByGenre(filters.genres[0], currentPage, 20)
      }
      // If category filter is applied, use category endpoint
      else if (filters.categories.length === 1) {
        result = await contentAPI.getMoviesByCategory(filters.categories[0], currentPage, 20)
      }
      // Default: get all movies
      else {
        result = await contentAPI.getContentByType('Movie', currentPage, 20)
      }

      // API returns: { status, data: { content: [] } }
      const contentData = result.data?.data?.content || result.data?.content || []
      let filteredMovies = Array.isArray(contentData) ? contentData.filter((c: Content) => c.contentType === 'Movie') : []

      // Apply client-side filters for multiple genres/categories
      if (filters.genres.length > 1) {
        filteredMovies = filteredMovies.filter((movie: Content) =>
          movie.genres?.some(g => filters.genres.includes(g._id))
        )
      }
      
      if (filters.categories.length > 1) {
        filteredMovies = filteredMovies.filter((movie: Content) =>
          movie.categories?.some(c => filters.categories.includes(c._id))
        )
      }

      // Apply price filter
      if (filters.priceRange === 'free') {
        filteredMovies = filteredMovies.filter((movie: Content) => (movie.priceInRwf || 0) === 0)
      } else if (filters.priceRange === 'paid') {
        filteredMovies = filteredMovies.filter((movie: Content) => (movie.priceInRwf || 0) > 0)
      }

      // Apply sorting
      filteredMovies = applySorting(filteredMovies)

      setMovies(filteredMovies)
      const pagination = result.data?.data?.pagination || result.data?.pagination || {}
      setTotalPages(pagination.totalPages || pagination.pages || 1)
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
        return sorted.sort((a, b) => (a.priceInRwf || 0) - (b.priceInRwf || 0))
      case 'price-high':
        return sorted.sort((a, b) => (b.priceInRwf || 0) - (a.priceInRwf || 0))
      default:
        return sorted
    }
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setSearchParams({ sort: newSort })
  }

  return (
    <Layout>
      {/* Hero Section */}
      {(movies.length > 0 || selectedContent) && (
        <FeaturedHero
          content={selectedContent ? [selectedContent, ...movies.filter(m => m._id !== selectedContent._id)] : movies}
          selectedId={selectedId}
        />
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Movies</h1>
          <p className={styles.subtitle}>Discover amazing movies from our collection</p>
        </div>

        <div className={styles.controls}>
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            genres={genres}
            categories={categories}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
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
