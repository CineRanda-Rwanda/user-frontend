import React, { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  value?: string
  onChange?: (query: string) => void
  onSearch?: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value: externalValue,
  onChange,
  onSearch, 
  placeholder = 'Search movies and series...', 
  debounceMs = 300 
}) => {
  const [query, setQuery] = useState(externalValue || '')
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (externalValue !== undefined) {
      setQuery(externalValue)
    }
  }, [externalValue])

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(query)
      }
      if (onChange) {
        onChange(query)
      }
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, debounceMs, onSearch])

  const handleClear = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
    if (onChange) {
      onChange('')
    }
  }

  return (
    <div className={styles.searchBar}>
      <FiSearch className={styles.searchIcon} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        autoFocus
      />
      {query && (
        <button
          onClick={handleClear}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          <FiX />
        </button>
      )}
    </div>
  )
}

export default SearchBar
