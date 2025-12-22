import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSearch, FiChevronDown, FiPlay } from 'react-icons/fi'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import { extractCollection } from '@/utils/collection'
import styles from './GlobalSearchBar.module.css'

interface GlobalSearchBarProps {
  placeholder?: string
  context?: string
  className?: string
  showHeading?: boolean
  variant?: 'default' | 'compact'
  showFilters?: boolean
  showSubmitButton?: boolean
}

interface OptionItem {
  _id: string
  name: string
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
  placeholder = 'Search across movies and series...',
  context,
  className,
  showHeading = false,
  variant = 'default',
  showFilters = true,
  showSubmitButton = true
}) => {
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)

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
    if (!selectedGenres.length) return 'All genres'
    if (selectedGenres.length === 1) {
      return genres.find((g) => g._id === selectedGenres[0])?.name || '1 genre'
    }
    return `${selectedGenres.length} genres`
  }, [selectedGenres, genres])

  const selectedCategoryLabel = useMemo(() => {
    if (!selectedCategories.length) return 'All categories'
    if (selectedCategories.length === 1) {
      return categories.find((c) => c._id === selectedCategories[0])?.name || '1 category'
    }
    return `${selectedCategories.length} categories`
  }, [selectedCategories, categories])

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

  const renderSuggestion = (item: Content) => (
    <button
      type="button"
      key={item._id}
      className={styles.suggestionItem}
      onClick={() => handleSuggestionNavigate(item)}
    >
      <div>
        <p className={styles.suggestionTitle}>{item.title}</p>
        <p className={styles.suggestionMeta}>
          {item.contentType || 'Content'}
          {item.releaseYear ? ` • ${item.releaseYear}` : ''}
        </p>
      </div>
      <FiPlay size={16} />
    </button>
  )

  const wrapperClasses = [styles.wrapper, variant === 'compact' ? styles.compact : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses} ref={wrapperRef}>
      {showHeading && (
        <p className={styles.sectionLabel}>Find something to watch</p>
      )}
      <form className={styles.inputShell} onSubmit={handleSubmit}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (suggestions.length) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={styles.input}
        />
        {showSubmitButton && (
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        )}
      </form>

      {showSuggestions && (
        <div className={styles.suggestionsPanel}>
          {loadingSuggestions ? (
            <div className={styles.suggestionItem}>Searching…</div>
          ) : suggestions.length ? (
            suggestions.map(renderSuggestion)
          ) : (
            <div className={styles.suggestionItem}>No matches yet</div>
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
            >
              {selectedGenreLabel}
              <FiChevronDown />
            </button>
            {genreOpen && (
              <div className={styles.dropdownMenu}>
                <button type="button" onClick={() => setSelectedGenres([])}>
                  All genres
                </button>
                {genres.map((genre) => (
                  <button
                    type="button"
                    key={genre._id}
                    className={selectedGenres.includes(genre._id) ? styles.dropdownOptionActive : ''}
                    onClick={() => setSelectedGenres((prev) => toggleSelection(prev, genre._id))}
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
            >
              {selectedCategoryLabel}
              <FiChevronDown />
            </button>
            {categoryOpen && (
              <div className={styles.dropdownMenu}>
                <button type="button" onClick={() => setSelectedCategories([])}>
                  All categories
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category._id}
                    className={selectedCategories.includes(category._id) ? styles.dropdownOptionActive : ''}
                    onClick={() =>
                      setSelectedCategories((prev) => toggleSelection(prev, category._id))
                    }
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
