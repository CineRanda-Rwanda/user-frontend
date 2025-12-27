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
import { useTranslation } from 'react-i18next'
import { normalizeSupportedLanguage, translateTextCached } from '@/utils/translate'
import styles from './Series.module.css'

const Series: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const [series, setSeries] = useState<Content[]>([])
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

        const extractedGenres = extractCollection<{ _id: string; name: string }>(genresRes, ['genres'])
        const extractedCategories = extractCollection<{ _id: string; name: string }>(categoriesRes, ['categories'])

        const targetLanguage = normalizeSupportedLanguage(i18n.language)

        if (targetLanguage === 'fr') {
          const [translatedGenres, translatedCategories] = await Promise.all([
            Promise.all(
              extractedGenres.map(async (genre) => ({
                ...genre,
                name: (await translateTextCached(genre.name, 'fr', { source: 'en' }).catch(() => genre.name)) || genre.name,
              }))
            ),
            Promise.all(
              extractedCategories.map(async (category) => ({
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
          setGenres(extractedGenres)
          setCategories(extractedCategories)
        }
      } catch (error) {
        console.error('Failed to load genres/categories:', error)
      }
    }
    loadFilters()
  }, [i18n.language])

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

      // Apply sorting
      filteredSeries = applySorting(filteredSeries)

      setSeries(filteredSeries)
      const pagination = result.data?.data?.pagination || result.data?.pagination || {}
      setTotalPages(pagination.totalPages || pagination.pages || 1)
    } catch (error) {
      toast.error(t('series.errors.loadFailed'))
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
      {(series.length > 0 || selectedContent) && (
        <FeaturedHero
          content={selectedContent ? [selectedContent, ...series.filter(s => s._id !== selectedContent._id)] : series}
          selectedId={selectedId}
        />
      )}

      <div className={styles.container}>
        <div className={styles.controls}>
          <SortDropdown value={sortBy} onChange={handleSortChange} />
          <FilterDropdown
            label={t('series.filters.genre')}
            options={genres.map((genre) => ({ value: genre._id, label: genre.name }))}
            value={filters.genres[0] || null}
            placeholder={t('series.filters.allGenres')}
            onChange={(value) => handleFilterSelect('genres', value)}
          />
          <FilterDropdown
            label={t('series.filters.category')}
            options={categories.map((category) => ({ value: category._id, label: category.name }))}
            value={filters.categories[0] || null}
            placeholder={t('series.filters.allCategories')}
            onChange={(value) => handleFilterSelect('categories', value)}
          />
          {hasFilters && (
            <button type="button" className={styles.clearAllButton} onClick={clearAllFilters}>
              {t('series.filters.reset')}
            </button>
          )}
        </div>

        <div className={styles.content}>
          <main className={styles.main}>
            {loading ? (
              <Loader text={t('series.loading')} />
            ) : series.length === 0 ? (
              <div className={styles.empty}>
                <p>{t('series.empty')}</p>
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
                      {t('common.previous')}
                    </button>
                    <span className={styles.pageInfo}>
                      {t('series.pagination.pageOf', { current: currentPage, total: totalPages })}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className={styles.paginationButton}
                    >
                      {t('common.next')}
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
