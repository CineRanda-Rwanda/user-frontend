import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { FiFilter, FiX, FiRefreshCw } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styles from './FilterPanel.module.css'

export interface SearchFilters {
  genres: string[]
  categories: string[]
}

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  genres?: Array<{ _id: string; name: string }>
  categories?: Array<{ _id: string; name: string }>
  isOpen: boolean
  onToggle: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  genres = [],
  categories = [],
  isOpen,
  onToggle
}) => {
  const { t } = useTranslation()
  const panelId = useId()
  const titleId = `${panelId}-title`
  const panelRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  // Mount/unmount the panel so closed content isn't tabbable.
  const [isMounted, setIsMounted] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      openerRef.current = document.activeElement as HTMLElement | null
      setIsMounted(true)
      requestAnimationFrame(() => setIsVisible(true))
      requestAnimationFrame(() => closeButtonRef.current?.focus())
      return
    }

    // Closing: let the CSS transition complete, then unmount.
    setIsVisible(false)
    const timeout = window.setTimeout(() => {
      setIsMounted(false)
      requestAnimationFrame(() => openerRef.current?.focus())
    }, 320)
    return () => window.clearTimeout(timeout)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const panelEl = panelRef.current
    if (!panelEl) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onToggle()
        return
      }

      if (event.key !== 'Tab') return

      const focusables = Array.from(
        panelEl.querySelectorAll<HTMLElement>('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true')

      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (!active || active === first || !panelEl.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onToggle])
  const handleGenreToggle = (genreId: string) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(id => id !== genreId)
      : [...filters.genres, genreId]
    onFiltersChange({ ...filters, genres: newGenres })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    onFiltersChange({ ...filters, categories: newCategories })
  }

  const resetFilters = () => {
    onFiltersChange({
      genres: [],
      categories: []
    })
  }

  const activeFilterCount = filters.genres.length + filters.categories.length

  const selectedGenreLabels = useMemo(
    () =>
      filters.genres
        .map((id) => genres.find((genre) => genre._id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [filters.genres, genres]
  )

  const selectedCategoryLabels = useMemo(
    () =>
      filters.categories
        .map((id) => categories.find((category) => category._id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [filters.categories, categories]
  )

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={onToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className={styles.toggleIcon}>
          <FiFilter aria-hidden="true" />
        </div>
        <div className={styles.toggleCopy}>
          <span className={styles.toggleLabel}>{t('filterPanel.toggle.label')}</span>
          <span className={styles.toggleTitle}>{t('filterPanel.toggle.title')}</span>
        </div>
        {activeFilterCount > 0 && (
          <span className={styles.badge}>{activeFilterCount}</span>
        )}
      </button>

      {isMounted && (
        <>
          <div
            ref={panelRef}
            id={panelId}
            className={`${styles.panel} ${isVisible ? styles.open : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <div className={styles.header}>
              <h3 id={titleId}>{t('filterPanel.header.title')}</h3>
              <div className={styles.headerActions}>
                {activeFilterCount > 0 && (
                  <button className={styles.resetButton} onClick={resetFilters} type="button">
                    <FiRefreshCw aria-hidden="true" />
                    {t('filterPanel.actions.reset')}
                  </button>
                )}
                <button
                  ref={closeButtonRef}
                  className={styles.closeButton}
                  onClick={onToggle}
                  type="button"
                  aria-label={t('filterPanel.actions.closeAria')}
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            </div>

        <div className={styles.summaryBox}>
          {activeFilterCount > 0 ? (
            <>
              <p className={styles.summaryTitle}>{t('filterPanel.summary.activeFilters', { count: activeFilterCount })}</p>
              <div className={styles.summaryChips}>
                {[...selectedGenreLabels, ...selectedCategoryLabels].map((label) => (
                  <span key={label} className={styles.summaryChip}>
                    {label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className={styles.summaryTitle}>{t('filterPanel.summary.noneTitle')}</p>
              <p className={styles.summaryHint}>{t('filterPanel.summary.noneHint')}</p>
            </>
          )}
        </div>

        <div className={styles.content}>
          {/* Genres */}
          {genres.length > 0 && (
            <div className={styles.filterSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.filterEyebrow}>{t('filterPanel.sections.genres.eyebrow')}</p>
                  <h4>{t('filterPanel.sections.genres.title')}</h4>
                </div>
                <span className={styles.sectionCount}>{filters.genres.length}/{genres.length}</span>
              </div>
              <div className={styles.pillGrid}>
                {genres.map((genre) => (
                  <button
                    key={genre._id}
                    type="button"
                    className={`${styles.pill} ${filters.genres.includes(genre._id) ? styles.pillActive : ''}`}
                    onClick={() => handleGenreToggle(genre._id)}
                    aria-pressed={filters.genres.includes(genre._id)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className={styles.filterSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.filterEyebrow}>{t('filterPanel.sections.categories.eyebrow')}</p>
                  <h4>{t('filterPanel.sections.categories.title')}</h4>
                </div>
                <span className={styles.sectionCount}>{filters.categories.length}/{categories.length}</span>
              </div>
              <div className={styles.pillGrid}>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    className={`${styles.pill} ${filters.categories.includes(category._id) ? styles.pillActive : ''}`}
                    onClick={() => handleCategoryToggle(category._id)}
                    aria-pressed={filters.categories.includes(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
          </div>

          <div className={styles.overlay} onClick={onToggle} aria-hidden="true" />
        </>
      )}
    </>
  )
}

export default FilterPanel
