import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import SearchBar from '@/components/search/SearchBar'
import FilterPanel, { SearchFilters } from '@/components/search/FilterPanel'
import SortDropdown, { SortOption } from '@/components/search/SortDropdown'
import ContentCard from '@/components/content/ContentCard'
import EmptyState from '@/components/common/EmptyState'
import Skeleton from '@/components/ui/Skeleton'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import styles from './Search.module.css'

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'all',
    genres: [],
    categories: [],
    priceRange: 'all'
  })
  
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const [genres, setGenres] = useState<Array<{ _id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([])

  // Load genres and categories on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [genresRes, categoriesRes] = await Promise.all([
          contentAPI.getGenres(),
          contentAPI.getCategories()
        ])
        setGenres(genresRes.data.data.genres || [])
        setCategories(categoriesRes.data.data.categories || [])
      } catch (err) {
        console.error('Failed to load filters:', err)
      }
    }
    loadFilters()
  }, [])

  // Search function
  const performSearch = useCallback(async (
    query: string,
    currentFilters: SearchFilters,
    currentSort: SortOption,
    currentPage: number = 1
  ) => {
    if (!query.trim() && currentFilters.contentType === 'all' && 
        currentFilters.genres.length === 0 && currentFilters.categories.length === 0) {
      setResults([])
      setTotalResults(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let response

      // If there's a search query, use search endpoint
      if (query.trim()) {
        response = await contentAPI.searchMovies(query, currentPage, 20)
      } 
      // Otherwise, use filtering endpoints
      else if (currentFilters.contentType === 'Movie') {
        response = await contentAPI.getPublishedMovies(currentPage, 20)
      } else if (currentFilters.contentType === 'Series') {
        response = await contentAPI.getPublishedSeries(currentPage, 20)
      } else {
        // Get both movies and series
        const [moviesRes, seriesRes] = await Promise.all([
          contentAPI.getPublishedMovies(currentPage, 10),
          contentAPI.getPublishedSeries(currentPage, 10)
        ])
        const combinedResults = [
          ...(moviesRes.data.data.movies || []),
          ...(seriesRes.data.data.series || [])
        ]
        setResults(combinedResults)
        setTotalResults(combinedResults.length)
        setHasMore(false)
        setLoading(false)
        return
      }

      const data = response.data.data.movies || response.data.data.series || []
      const pagination = response.data.pagination
      
      // Apply client-side filters
      let filteredData = data

      // Filter by genres
      if (currentFilters.genres.length > 0) {
        filteredData = filteredData.filter((item: Content) => 
          item.genres?.some(g => currentFilters.genres.includes(g._id))
        )
      }

      // Filter by categories
      if (currentFilters.categories.length > 0) {
        filteredData = filteredData.filter((item: Content) => 
          item.categories?.some(c => currentFilters.categories.includes(c._id))
        )
      }

      // Filter by price
      if (currentFilters.priceRange === 'free') {
        filteredData = filteredData.filter((item: Content) => 
          item.priceInCoins === 0 && item.priceInRwf === 0
        )
      } else if (currentFilters.priceRange === 'paid') {
        filteredData = filteredData.filter((item: Content) => 
          item.priceInCoins > 0 || item.priceInRwf > 0
        )
      }

      // Filter by release year
      if (currentFilters.releaseYearFrom) {
        filteredData = filteredData.filter((item: Content) => 
          item.releaseYear >= currentFilters.releaseYearFrom!
        )
      }
      if (currentFilters.releaseYearTo) {
        filteredData = filteredData.filter((item: Content) => 
          item.releaseYear <= currentFilters.releaseYearTo!
        )
      }

      // Apply sorting
      const sortedData = [...filteredData].sort((a, b) => {
        switch (currentSort) {
          case 'newest':
            return b.releaseYear - a.releaseYear
          case 'oldest':
            return a.releaseYear - b.releaseYear
          case 'title-asc':
            return a.title.localeCompare(b.title)
          case 'title-desc':
            return b.title.localeCompare(a.title)
          case 'rating-high':
            return (b.averageRating || 0) - (a.averageRating || 0)
          case 'rating-low':
            return (a.averageRating || 0) - (b.averageRating || 0)
          case 'price-low':
            return (a.priceInCoins || 0) - (b.priceInCoins || 0)
          case 'price-high':
            return (b.priceInCoins || 0) - (a.priceInCoins || 0)
          default:
            return 0
        }
      })

      setResults(currentPage === 1 ? sortedData : [...results, ...sortedData])
      setTotalResults(pagination?.total || sortedData.length)
      setHasMore(pagination ? pagination.page < pagination.pages : false)
    } catch (err: any) {
      console.error('Search failed:', err)
      setError(err.response?.data?.message || 'Failed to search content')
      toast.error('Failed to search content')
    } finally {
      setLoading(false)
    }
  }, [results])

  // Trigger search when query, filters, or sort changes
  useEffect(() => {
    setPage(1)
    performSearch(searchQuery, filters, sortBy, 1)
  }, [searchQuery, filters, sortBy])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    performSearch(searchQuery, filters, sortBy, nextPage)
  }

  const handleResetSearch = () => {
    setSearchQuery('')
    setFilters({
      contentType: 'all',
      genres: [],
      categories: [],
      priceRange: 'all'
    })
    setSortBy('newest')
    setResults([])
    setTotalResults(0)
  }

  const showEmptyState = !loading && results.length === 0 && (searchQuery || 
    filters.contentType !== 'all' || filters.genres.length > 0 || 
    filters.categories.length > 0 || filters.priceRange !== 'all')

  return (
    <div className={styles.searchPage}>
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className={styles.controls}>
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            genres={genres}
            categories={categories}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
          <SortDropdown value={sortBy} onChange={handleSortChange} />
        </div>

        {totalResults > 0 && (
          <div className={styles.resultsCount}>
            Found {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {loading && results.length === 0 ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} height="400px" />
            ))}
          </div>
        ) : showEmptyState ? (
          <EmptyState
            type="search"
            title="No results found"
            message="Try adjusting your search query or filters to find what you're looking for."
            action={{
              label: 'Reset Search',
              onClick: handleResetSearch
            }}
          />
        ) : error ? (
          <EmptyState
            type="error"
            title="Something went wrong"
            message={error}
            action={{
              label: 'Try Again',
              onClick: () => performSearch(searchQuery, filters, sortBy, 1)
            }}
          />
        ) : results.length > 0 ? (
          <>
            <div className={styles.grid}>
              {results.map((content) => (
                <ContentCard key={content._id} content={content} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMore}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={styles.loadMoreButton}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            type="content"
            title="Start searching"
            message="Enter a search query or use filters to discover movies and series."
          />
        )}
      </div>
    </div>
  )
}

export default Search
