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
import styles from './Series.module.css'

const Series: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [series, setSeries] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const selectedId = searchParams.get('selected')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [genres, setGenres] = useState<Array<{ _id: string; name: string }>>([])
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([])
  const [filters, setFilters] = useState<SearchFilters>({
    contentType: 'Series',
    genres: [],
    categories: [],
    priceRange: 'all'
  })
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  useEffect(() => {
    loadSeries()
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
      const found = series.find(s => s._id === selectedId)
      if (found) {
        setSelectedContent(found)
        return
      }

      // If not found, fetch it
      try {
        const response = await contentAPI.getSeriesById(selectedId)
        const seriesData = response.data?.data?.series || response.data?.data || response.data
        if (seriesData) {
          setSelectedContent(seriesData)
        }
      } catch (error) {
        console.error('Failed to load selected series:', error)
      }
    }

    loadSelectedContent()
  }, [selectedId, series])

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

  const loadSeries = async () => {
    try {
      setLoading(true)
      
      const result = await contentAPI.getContentByType('Series', currentPage, 20)

      // API returns: { status, data: { content: [] } }
      const contentData = result.data?.data?.content || result.data?.content || []
      let filteredSeries = Array.isArray(contentData) ? contentData.filter((c: Content) => c.contentType === 'Series') : []

      // Apply client-side filters for genres
      if (filters.genres.length > 0) {
        filteredSeries = filteredSeries.filter((item: Content) =>
          item.genres?.some(g => filters.genres.includes(g._id))
        )
      }
      
      // Apply client-side filters for categories
      if (filters.categories.length > 0) {
        filteredSeries = filteredSeries.filter((item: Content) =>
          item.categories?.some(c => filters.categories.includes(c._id))
        )
      }

      // Apply price filter
      if (filters.priceRange === 'free') {
        filteredSeries = filteredSeries.filter((item: Content) => (item.priceInRwf || 0) === 0)
      } else if (filters.priceRange === 'paid') {
        filteredSeries = filteredSeries.filter((item: Content) => (item.priceInRwf || 0) > 0)
      }

      // Apply sorting
      filteredSeries = applySorting(filteredSeries)

      setSeries(filteredSeries)
      const pagination = result.data?.data?.pagination || result.data?.pagination || {}
      setTotalPages(pagination.totalPages || pagination.pages || 1)
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
      {(series.length > 0 || selectedContent) && (
        <FeaturedHero
          content={selectedContent ? [selectedContent, ...series.filter(s => s._id !== selectedContent._id)] : series}
          selectedId={selectedId}
        />
      )}

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Series</h1>
          <p className={styles.subtitle}>Explore captivating series and shows</p>
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
