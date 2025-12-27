import React, { useMemo } from 'react'
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
      <button className={styles.toggleButton} onClick={onToggle}>
        <div className={styles.toggleIcon}>
          <FiFilter />
        </div>
        <div className={styles.toggleCopy}>
          <span className={styles.toggleLabel}>{t('filterPanel.toggle.label')}</span>
          <span className={styles.toggleTitle}>{t('filterPanel.toggle.title')}</span>
        </div>
        {activeFilterCount > 0 && (
          <span className={styles.badge}>{activeFilterCount}</span>
        )}
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>{t('filterPanel.header.title')}</h3>
          <div className={styles.headerActions}>
            {activeFilterCount > 0 && (
              <button className={styles.resetButton} onClick={resetFilters}>
                <FiRefreshCw />
                {t('filterPanel.actions.reset')}
              </button>
            )}
            <button className={styles.closeButton} onClick={onToggle}>
              <FiX />
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

      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  )
}

export default FilterPanel
