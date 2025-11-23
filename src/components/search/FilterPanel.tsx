import React from 'react'
import { FiFilter, FiX } from 'react-icons/fi'
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

  return (
    <>
      <button className={styles.toggleButton} onClick={onToggle}>
        <FiFilter />
        Filters
        {activeFilterCount > 0 && (
          <span className={styles.badge}>{activeFilterCount}</span>
        )}
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <div className={styles.headerActions}>
            {activeFilterCount > 0 && (
              <button className={styles.resetButton} onClick={resetFilters}>
                Reset All
              </button>
            )}
            <button className={styles.closeButton} onClick={onToggle}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {/* Genres */}
          {genres.length > 0 && (
            <div className={styles.filterSection}>
              <h4>Genres</h4>
              <div className={styles.checkboxGroup}>
                {genres.map(genre => (
                  <label key={genre._id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={filters.genres.includes(genre._id)}
                      onChange={() => handleGenreToggle(genre._id)}
                    />
                    <span>{genre.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className={styles.filterSection}>
              <h4>Categories</h4>
              <div className={styles.checkboxGroup}>
                {categories.map(category => (
                  <label key={category._id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category._id)}
                      onChange={() => handleCategoryToggle(category._id)}
                    />
                    <span>{category.name}</span>
                  </label>
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
