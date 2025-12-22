import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import Layout from '@/components/layout/Layout'
import ContentCard from '@/components/content/ContentCard'
import FeaturedHero from '@/components/content/FeaturedHero'
import { SearchFilters } from '@/types/filters'
import SortDropdown, { SortOption } from '@/components/search/SortDropdown'
import FilterDropdown from '@/components/search/FilterDropdown'
import Loader from '@/components/common/Loader'
import { toast } from 'react-toastify'
import { extractCollection } from '@/utils/collection'
import styles from './Movies.module.css'

const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const selectedId = searchParams.get('selected')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [genres, setGenres] = useState<Array<{ _id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([])
  const [filters, setFilters] = useState<SearchFilters>({
    genres: [],
    categories: []
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

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
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

        const extractedGenres = extractCollection<{ _id: string; name: string }>(genresRes, ['genres'])
        const extractedCategories = extractCollection<{ _id: string; name: string }>(categoriesRes, ['categories'])

        setGenres(extractedGenres)
        setCategories(extractedCategories)
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
      case 'price-low':
        return sorted.sort((a, b) => (a.priceInRwf || 0) - (b.priceInRwf || 0))
      case 'price-high':
        return sorted.sort((a, b) => (b.priceInRwf || 0) - (a.priceInRwf || 0))
      default:
        return sorted
    }
  }

  const clearAllFilters = () => setFilters({ genres: [], categories: [] })

  const handleFilterSelect = (key: 'genres' | 'categories', value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value ? [value] : []
    }))
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setSearchParams({ sort: newSort })
  }
  const hasFilters = filters.genres.length > 0 || filters.categories.length > 0

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
        <div className={styles.controls}>
          <SortDropdown value={sortBy} onChange={handleSortChange} />
          <FilterDropdown
            label="Genre"
            options={genres.map((genre) => ({ value: genre._id, label: genre.name }))}
            value={filters.genres[0] || null}
            placeholder="All genres"
            onChange={(value) => handleFilterSelect('genres', value)}
          />
          <FilterDropdown
            label="Category"
            options={categories.map((category) => ({ value: category._id, label: category.name }))}
            value={filters.categories[0] || null}
            placeholder="All categories"
            onChange={(value) => handleFilterSelect('categories', value)}
          />
          {hasFilters && (
            <button type="button" className={styles.clearAllButton} onClick={clearAllFilters}>
              Reset filters
            </button>
          )}
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
