import React, { useState, useRef, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styles from './SortDropdown.module.css'

export type SortOption = 
  | 'newest' 
  | 'oldest' 
  | 'title-asc' 
  | 'title-desc' 
  | 'price-low'
  | 'price-high'

interface SortDropdownProps {
  value: SortOption
  onChange: (option: SortOption) => void
}

const sortOptions: Array<{ value: SortOption; labelKey: string }> = [
  { value: 'newest', labelKey: 'sort.options.newestFirst' },
  { value: 'oldest', labelKey: 'sort.options.oldestFirst' },
  { value: 'title-asc', labelKey: 'sort.options.titleAsc' },
  { value: 'title-desc', labelKey: 'sort.options.titleDesc' },
  { value: 'price-low', labelKey: 'sort.options.priceLow' },
  { value: 'price-high', labelKey: 'sort.options.priceHigh' },
]

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = sortOptions.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SortOption) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.inlineLabel}>
          <span className={styles.labelText}>{t('sort.label')}:</span>
          <span className={styles.valueText}>{selectedOption ? t(selectedOption.labelKey) : ''}</span>
        </div>
        <FiChevronDown className={`${styles.icon} ${isOpen ? styles.open : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {sortOptions.map(option => (
            <button
              key={option.value}
              className={`${styles.option} ${value === option.value ? styles.active : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SortDropdown
