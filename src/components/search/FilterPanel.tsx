import React from 'react'
import { FiFilter, FiX } from 'react-icons/fi'
import styles from './FilterPanel.module.css'

export interface SearchFilters {
  contentType: 'all' | 'Movie' | 'Series'
  genres: string[]
  categories: string[]
  releaseYearFrom?: number
  releaseYearTo?: number
  priceRange: 'all' | 'free' | 'paid'
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
  const currentYear = new Date().getFullYear()

  const handleContentTypeChange = (type: 'all' | 'Movie' | 'Series') => {
    onFiltersChange({ ...filters, contentType: type })
  }

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

  const handlePriceRangeChange = (range: 'all' | 'free' | 'paid') => {
    onFiltersChange({ ...filters, priceRange: range })
  }

  const handleYearFromChange = (year: string) => {
    onFiltersChange({ ...filters, releaseYearFrom: year ? parseInt(year) : undefined })
  }

  const handleYearToChange = (year: string) => {
    onFiltersChange({ ...filters, releaseYearTo: year ? parseInt(year) : undefined })
  }

  const resetFilters = () => {
    onFiltersChange({
      contentType: 'all',
      genres: [],
      categories: [],
      priceRange: 'all'
    })
  }

  const activeFilterCount = 
    (filters.contentType !== 'all' ? 1 : 0) +
    filters.genres.length +
    filters.categories.length +
    (filters.releaseYearFrom ? 1 : 0) +
    (filters.releaseYearTo ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0)

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
          {/* Content Type */}
          <div className={styles.filterSection}>
            <h4>Content Type</h4>
            <div className={styles.buttonGroup}>
              <button
                className={filters.contentType === 'all' ? styles.active : ''}
                onClick={() => handleContentTypeChange('all')}
              >
                All
              </button>
              <button
                className={filters.contentType === 'Movie' ? styles.active : ''}
                onClick={() => handleContentTypeChange('Movie')}
              >
                Movies
              </button>
              <button
                className={filters.contentType === 'Series' ? styles.active : ''}
                onClick={() => handleContentTypeChange('Series')}
              >
                Series
              </button>
            </div>
          </div>

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

          {/* Release Year */}
          <div className={styles.filterSection}>
            <h4>Release Year</h4>
            <div className={styles.yearRange}>
              <input
                type="number"
                placeholder="From"
                min="1900"
                max={currentYear}
                value={filters.releaseYearFrom || ''}
                onChange={(e) => handleYearFromChange(e.target.value)}
                className={styles.yearInput}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="To"
                min="1900"
                max={currentYear}
                value={filters.releaseYearTo || ''}
                onChange={(e) => handleYearToChange(e.target.value)}
                className={styles.yearInput}
              />
            </div>
          </div>

          {/* Price Range */}
          <div className={styles.filterSection}>
            <h4>Price</h4>
            <div className={styles.buttonGroup}>
              <button
                className={filters.priceRange === 'all' ? styles.active : ''}
                onClick={() => handlePriceRangeChange('all')}
              >
                All
              </button>
              <button
                className={filters.priceRange === 'free' ? styles.active : ''}
                onClick={() => handlePriceRangeChange('free')}
              >
                Free
              </button>
              <button
                className={filters.priceRange === 'paid' ? styles.active : ''}
                onClick={() => handlePriceRangeChange('paid')}
              >
                Paid
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className={styles.overlay} onClick={onToggle} />}
    </>
  )
}

export default FilterPanel
