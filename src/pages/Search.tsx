import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import Layout from '@/components/layout/Layout'
import { SearchFilters } from '@/types/filters'
import SortDropdown, { SortOption } from '@/components/search/SortDropdown'
import FilterDropdown from '@/components/search/FilterDropdown'
import ContentCard from '@/components/content/ContentCard'
import EmptyState from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import { extractCollection } from '@/utils/collection'
import { useTranslation } from 'react-i18next'
import { normalizeSupportedLanguage, translateTextCached } from '@/utils/translate'
import styles from './Search.module.css'

const parseCommaParam = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, index) => item === b[index])

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    genres: parseCommaParam(searchParams.get('genres')),
    categories: parseCommaParam(searchParams.get('categories'))
  }))
  
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  
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
        
        // Extract genres and categories from response
        const genresData = extractCollection<{ _id: string; name: string }>(genresRes, ['genres'])
        const categoriesData = extractCollection<{ _id: string; name: string }>(categoriesRes, ['categories'])
        
        const targetLanguage = normalizeSupportedLanguage(i18n.language)
        if (targetLanguage === 'fr') {
          const [translatedGenres, translatedCategories] = await Promise.all([
            Promise.all(
              genresData.map(async (genre) => ({
                ...genre,
                name: (await translateTextCached(genre.name, 'fr', { source: 'en' }).catch(() => genre.name)) || genre.name,
              }))
            ),
            Promise.all(
              categoriesData.map(async (category) => ({
                ...category,
                name:
                  (await translateTextCached(category.name, 'fr', { source: 'en' }).catch(() => category.name)) ||
                  category.name,
              }))
            ),
          ])
          setGenres(translatedGenres)
          setCategories(translatedCategories)
        } else {
          setGenres(genresData)
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Failed to load genres/categories:', error)
        // Set empty arrays on error
        setGenres([])
        setCategories([])
      }
    }
    
    loadFilters()
  }, [i18n.language])

  useEffect(() => {
    const nextQuery = searchParams.get('q') || ''
    if (nextQuery !== searchQuery) {
      setSearchQuery(nextQuery)
    }

    const nextGenres = parseCommaParam(searchParams.get('genres'))
    const nextCategories = parseCommaParam(searchParams.get('categories'))

    setFilters((prev) => {
      const sameGenres = arraysEqual(prev.genres, nextGenres)
      const sameCategories = arraysEqual(prev.categories, nextCategories)
      if (sameGenres && sameCategories) {
        return prev
      }
      return {
        ...prev,
        genres: nextGenres,
        categories: nextCategories
      }
    })
  }, [searchParams])

  // Search function
  const performSearch = useCallback(async (
    query: string,
    currentFilters: SearchFilters,
    currentSort: SortOption,
    currentPage: number = 1
  ) => {
    if (!query.trim() && currentFilters.genres.length === 0 && currentFilters.categories.length === 0) {
      setResults([])
      setTotalResults(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let response
      let data: Content[] = []
      let pagination: any = {}

      // If there's a search query, use search endpoint
      if (query.trim()) {
        response = await contentAPI.searchContent(query, currentPage, 20)
        // Handle search response structure: { status, results, data: { content: [] } }
        data = response.data?.data?.results || response.data?.data?.content || []
        pagination = response.data?.data?.pagination || response.data?.pagination || {}
      } else {
        // No search term: pull latest movies and series so filters still work
        const [moviesRes, seriesRes] = await Promise.all([
          contentAPI.getContentByType('Movie', currentPage, 10),
          contentAPI.getContentByType('Series', currentPage, 10)
        ])
        const movies = moviesRes.data?.data?.content || []
        const series = seriesRes.data?.data?.content || []
        data = [...movies, ...series]
        const moviesPagination = moviesRes.data?.data?.pagination || moviesRes.data?.pagination || {}
        const seriesPagination = seriesRes.data?.data?.pagination || seriesRes.data?.pagination || {}
        pagination = {
          total: (moviesPagination.total || moviesPagination.totalResults || 0) + (seriesPagination.total || seriesPagination.totalResults || 0),
          page: currentPage,
          pages: Math.max(moviesPagination.pages || moviesPagination.totalPages || 1, seriesPagination.pages || seriesPagination.totalPages || 1)
        }
      }
      
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

      // Apply sorting
      const sortedData = [...filteredData].sort((a, b) => {
        switch (currentSort) {
          case 'newest':
            return (b.releaseYear || 0) - (a.releaseYear || 0)
          case 'oldest':
            return (a.releaseYear || 0) - (b.releaseYear || 0)
          case 'title-asc':
            return (a.title || '').localeCompare(b.title || '')
          case 'title-desc':
            return (b.title || '').localeCompare(a.title || '')
          case 'price-low':
            return (a.priceInRwf || 0) - (b.priceInRwf || 0)
          case 'price-high':
            return (b.priceInRwf || 0) - (a.priceInRwf || 0)
          default:
            return 0
        }
      })

      setResults(currentPage === 1 ? sortedData : [...results, ...sortedData])
      
      // Handle different pagination structures
      const total = pagination.total || pagination.totalResults || sortedData.length
      const totalPages = pagination.pages || pagination.totalPages || 1
      
      setTotalResults(total)
      setHasMore(currentPage < totalPages)
    } catch (err: any) {
      console.error('Search failed:', err)
      const fallbackMessage = t('search.errors.searchFailed')
      setError(err.response?.data?.message || fallbackMessage)
      toast.error(fallbackMessage)
    } finally {
      setLoading(false)
    }
  }, [results])

  // Trigger search when query, filters, or sort changes
  useEffect(() => {
    setPage(1)
    performSearch(searchQuery, filters, sortBy, 1)
  }, [searchQuery, filters, sortBy])

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    const params = new URLSearchParams(searchParams)
    if (newFilters.genres.length) {
      params.set('genres', newFilters.genres.join(','))
    } else {
      params.delete('genres')
    }

    if (newFilters.categories.length) {
      params.set('categories', newFilters.categories.join(','))
    } else {
      params.delete('categories')
    }

    setSearchParams(params)
  }

  const handleFilterSelect = (key: 'genres' | 'categories', value: string | null) => {
    const nextFilters = {
      ...filters,
      [key]: value ? [value] : []
    }
    handleFiltersChange(nextFilters)
  }

  const clearAllFilters = () => handleFiltersChange({ genres: [], categories: [] })

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    setSearchParams(params)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    performSearch(searchQuery, filters, sortBy, nextPage)
  }

  const handleResetSearch = () => {
    setSearchQuery('')
    setFilters({
      genres: [],
      categories: []
    })
    setSortBy('newest')
    setResults([])
    setTotalResults(0)
    setSearchParams(new URLSearchParams())
  }

  const showEmptyState = !loading && results.length === 0 && (searchQuery || 
    filters.genres.length > 0 || filters.categories.length > 0)

  return (
    <Layout>
    <div className={styles.searchPage}>
      <div className={styles.header}>
        <div className={styles.searchSection}>
          <h1 className={styles.searchTitle}>{t('search.title')}</h1>
          <p className={styles.searchHint}>
            {searchQuery
              ? t('search.hint.showingResultsFor', { query: searchQuery })
              : t('search.hint.useNavSearch')}
          </p>
        </div>

        <div className={styles.controls}>
          <SortDropdown value={sortBy} onChange={handleSortChange} />
          <FilterDropdown
            label={t('search.filters.genre')}
            options={genres.map((genre) => ({ value: genre._id, label: genre.name }))}
            value={filters.genres[0] || null}
            placeholder={t('search.filters.allGenres')}
            onChange={(value) => handleFilterSelect('genres', value)}
          />
          <FilterDropdown
            label={t('search.filters.category')}
            options={categories.map((category) => ({ value: category._id, label: category.name }))}
            value={filters.categories[0] || null}
            placeholder={t('search.filters.allCategories')}
            onChange={(value) => handleFilterSelect('categories', value)}
          />
          {(filters.genres.length > 0 || filters.categories.length > 0) && (
            <button type="button" className={styles.clearAllButton} onClick={clearAllFilters}>
              {t('search.filters.reset')}
            </button>
          )}
        </div>

        {totalResults > 0 && (
          <div className={styles.resultsCount}>
            {t('search.resultsCount', { count: totalResults })}
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
            title={t('search.empty.noResultsTitle')}
            message={t('search.empty.noResultsMessage')}
            action={{
              label: t('search.actions.resetSearch'),
              onClick: handleResetSearch
            }}
          />
        ) : error ? (
          <EmptyState
            type="error"
            title={t('search.empty.errorTitle')}
            message={error}
            action={{
              label: t('search.actions.tryAgain'),
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
                  {loading ? t('common.loading') : t('search.actions.loadMore')}
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            type="content"
            title={t('search.empty.startTitle')}
            message={t('search.empty.startMessage')}
          />
        )}
      </div>
    </div>
    </Layout>
  )
}

export default Search
