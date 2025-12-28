import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiChevronDown, FiPlay } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import { extractCollection } from '@/utils/collection'
import { PLACEHOLDER_IMAGE } from '@/utils/constants'
import styles from './GlobalSearchBar.module.css'

interface GlobalSearchBarProps {
  placeholder?: string
  context?: string
  className?: string
  showHeading?: boolean
  variant?: 'default' | 'compact'
  showFilters?: boolean
  showSubmitButton?: boolean
  /**
   * Keeps the compact search UI in a single-row layout on small screens.
   * Useful when embedding the search bar in a tight header.
   */
  lockCompactLayout?: boolean
}

interface OptionItem {
  _id: string
  name: string
}

const resolvePosterUrl = (item: unknown): string => {
  if (!item || typeof item !== 'object') return ''
  const record = item as Record<string, unknown>
  const candidate =
    record.posterImageUrl ||
    record.posterUrl ||
    record.poster ||
    record.thumbnailUrl ||
    record.thumbnailImageUrl ||
    record.coverImageUrl ||
    record.imageUrl

  return typeof candidate === 'string' ? candidate : ''
}

const normalizeOptions = (source: unknown[]): OptionItem[] => {
  return source
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as Record<string, unknown>
      const id = record._id
      const name = record.name
      if (typeof id !== 'string' || typeof name !== 'string') return null
      return { _id: id, name }
    })
    .filter((item): item is OptionItem => Boolean(item))
}

const extractResults = (response: any): Content[] => {
  const payload = response?.data?.data || response?.data || {}
  const list = payload.results || payload.content || payload.items || payload
  return Array.isArray(list) ? list : []
}

const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  placeholder,
  context,
  className,
  showHeading = false,
  variant = 'default',
  showFilters = true,
  showSubmitButton = true,
  lockCompactLayout = false
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestionsPanelId = useId()
  const genreMenuId = useId()
  const categoryMenuId = useId()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [genres, setGenres] = useState<OptionItem[]>([])
  const [categories, setCategories] = useState<OptionItem[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Content[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [genreOpen, setGenreOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!showFilters) return

    const loadMeta = async () => {
      try {
        const [genreRes, categoryRes] = await Promise.all([
          contentAPI.getGenres().catch(() => ({ data: { data: [] } })),
          contentAPI.getCategories().catch(() => ({ data: { data: [] } })),
        ])
        const genreOptions = normalizeOptions(extractCollection(genreRes, ['genres']))
        const categoryOptions = normalizeOptions(extractCollection(categoryRes, ['categories']))
        setGenres(genreOptions)
        setCategories(categoryOptions)
      } catch (error) {
        console.warn('Failed to load metadata for search filters', error)
      }
    }
    loadMeta()
  }, [showFilters])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    let cancelled = false
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true)
      try {
        const response = await contentAPI.searchContent(debouncedQuery, 1, 6)
        if (!cancelled) {
          setSuggestions(extractResults(response))
          setShowSuggestions(true)
        }
      } catch (error) {
        console.warn('Unable to fetch search suggestions', error)
        if (!cancelled) {
          setSuggestions([])
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false)
        }
      }
    }

    fetchSuggestions()
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setGenreOpen(false)
        setCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleSelection = useCallback((collection: string[], value: string): string[] => {
    return collection.includes(value)
      ? collection.filter((item) => item !== value)
      : [...collection, value]
  }, [])

  const selectedGenreLabel = useMemo(() => {
    if (!selectedGenres.length) return t('globalSearch.filters.genres.all')
    if (selectedGenres.length === 1) {
      return genres.find((g) => g._id === selectedGenres[0])?.name || t('globalSearch.filters.genres.count', { count: 1 })
    }
    return t('globalSearch.filters.genres.count', { count: selectedGenres.length })
  }, [selectedGenres, genres, t])

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategories.length) return t('globalSearch.filters.categories.all')
    if (selectedCategories.length === 1) {
      return categories.find((c) => c._id === selectedCategories[0])?.name || t('globalSearch.filters.categories.count', { count: 1 })
    }
    return t('globalSearch.filters.categories.count', { count: selectedCategories.length })
  }, [selectedCategories, categories, t])

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault()
    const params = new URLSearchParams()
    const trimmedQuery = query.trim()
    if (trimmedQuery) params.set('q', trimmedQuery)
    if (selectedGenres.length) params.set('genres', selectedGenres.join(','))
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (context) params.set('ctx', context)

    const target = params.toString() ? `/search?${params.toString()}` : '/search'
    navigate(target)
    setShowSuggestions(false)
  }

  const handleSuggestionNavigate = (content: Content) => {
    if (!content?._id) return
    navigate(`/content/${content._id}`)
    setShowSuggestions(false)
  }

  const renderSuggestion = (item: Content, index: number) => (
    <button
      type="button"
      key={item._id}
      className={styles.suggestionItem}
      onClick={() => handleSuggestionNavigate(item)}
      aria-label={t('globalSearch.suggestions.openAria', { title: item.title })}
      ref={(node) => {
        suggestionRefs.current[index] = node
      }}
      role="option"
    >
      <div className={styles.suggestionLeft}>
        <img
          className={styles.suggestionPoster}
          src={resolvePosterUrl(item) || PLACEHOLDER_IMAGE}
          alt=""
          decoding="async"
          onError={(event) => {
            const target = event.currentTarget
            if (target.src !== PLACEHOLDER_IMAGE) {
              target.src = PLACEHOLDER_IMAGE
            }
          }}
        />
        <div>
          <p className={styles.suggestionTitle}>{item.title}</p>
          <p className={styles.suggestionMeta}>
            {item.contentType || t('common.content')}
            {item.releaseYear ? ` • ${item.releaseYear}` : ''}
          </p>
        </div>
      </div>
      <FiPlay size={16} aria-hidden="true" focusable="false" />
    </button>
  )

  const wrapperClasses = [
    styles.wrapper,
    variant === 'compact' ? styles.compact : '',
    lockCompactLayout ? styles.lockCompactLayout : '',
    className
  ]
    .filter(Boolean)
    .join(' ')

  const resolvedPlaceholder = placeholder ?? t('globalSearch.placeholder')

  return (
    <div className={wrapperClasses} ref={wrapperRef}>
      {showHeading && (
        <p className={styles.sectionLabel}>{t('globalSearch.heading')}</p>
      )}
      <form className={styles.inputShell} onSubmit={handleSubmit}>
        <FiSearch className={styles.searchIcon} aria-hidden="true" focusable="false" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setShowSuggestions(false)
              setGenreOpen(false)
              setCategoryOpen(false)
              return
            }

            if (event.key === 'ArrowDown') {
              if (suggestions.length) {
                event.preventDefault()
                setShowSuggestions(true)
                requestAnimationFrame(() => suggestionRefs.current[0]?.focus())
              }
            }
          }}
          onFocus={() => {
            if (suggestions.length) {
              setShowSuggestions(true)
            }
          }}
          placeholder={resolvedPlaceholder}
          className={styles.input}
          aria-label={t('globalSearch.inputAria')}
          aria-controls={showSuggestions ? suggestionsPanelId : undefined}
          aria-expanded={showSuggestions}
        />
        {showSubmitButton && (
          <button type="submit" className={styles.searchButton}>
            {t('globalSearch.actions.search')}
          </button>
        )}
      </form>

      {showSuggestions && (
        <div
          className={styles.suggestionsPanel}
          id={suggestionsPanelId}
          role="listbox"
          aria-label={t('globalSearch.suggestions.listAria')}
        >
          {loadingSuggestions ? (
            <div className={styles.suggestionItem} role="status" aria-live="polite">
              {t('globalSearch.status.searching')}
            </div>
          ) : suggestions.length ? (
            suggestions.map((item, index) => renderSuggestion(item, index))
          ) : (
            <div className={styles.suggestionItem} role="status" aria-live="polite">
              {t('globalSearch.status.noMatches')}
            </div>
          )}
        </div>
      )}

      {showFilters && (
        <div className={styles.filtersRow}>
          <div className={styles.dropdownCluster}>
            <div className={styles.dropdownWrapper}>
            <button
              type="button"
              className={`${styles.dropdownTrigger} ${genreOpen ? styles.dropdownActive : ''}`}
              onClick={() => {
                setGenreOpen((prev) => !prev)
                setCategoryOpen(false)
              }}
              aria-haspopup="listbox"
              aria-expanded={genreOpen}
              aria-controls={genreMenuId}
            >
              {selectedGenreLabel}
              <FiChevronDown aria-hidden="true" focusable="false" />
            </button>
            {genreOpen && (
              <div className={styles.dropdownMenu} id={genreMenuId} role="listbox" aria-multiselectable="true">
                <button
                  type="button"
                  onClick={() => setSelectedGenres([])}
                  role="option"
                  aria-selected={!selectedGenres.length}
                >
                  {t('globalSearch.filters.genres.all')}
                </button>
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre._id}
                    className={selectedGenres.includes(genre._id) ? styles.dropdownOptionActive : ''}
                    onClick={() => setSelectedGenres((prev) => toggleSelection(prev, genre._id))}
                    role="option"
                    aria-selected={selectedGenres.includes(genre._id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>

            <div className={styles.dropdownWrapper}>
            <button
              type="button"
              className={`${styles.dropdownTrigger} ${categoryOpen ? styles.dropdownActive : ''}`}
              onClick={() => {
                setCategoryOpen((prev) => !prev)
                setGenreOpen(false)
              }}
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
              aria-controls={categoryMenuId}
            >
              {selectedCategoryLabel}
              <FiChevronDown aria-hidden="true" focusable="false" />
            </button>
            {categoryOpen && (
              <div className={styles.dropdownMenu} id={categoryMenuId} role="listbox" aria-multiselectable="true">
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  role="option"
                  aria-selected={!selectedCategories.length}
                >
                  {t('globalSearch.filters.categories.all')}
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category._id}
                    className={selectedCategories.includes(category._id) ? styles.dropdownOptionActive : ''}
                    onClick={() =>
                      setSelectedCategories((prev) => toggleSelection(prev, category._id))
                    }
                    role="option"
                    aria-selected={selectedCategories.includes(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GlobalSearchBar
