import React, { useState, useRef, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import styles from './FilterDropdown.module.css'

export interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  value?: string | null
  placeholder?: string
  onChange: (value: string | null) => void
  disabled?: boolean
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  value = null,
  placeholder = 'All',
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find(option => option.value === value)

  const handleSelect = (next: string | null) => {
    onChange(next)
    setIsOpen(false)
  }

  return (
    <div className={`${styles.dropdown} ${disabled ? styles.disabled : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <div className={styles.inlineLabel}>
          <span className={styles.labelText}>{label}:</span>
          <span className={styles.valueText}>{selected?.label || placeholder}</span>
        </div>
        <FiChevronDown className={`${styles.icon} ${isOpen ? styles.open : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className={styles.menu}>
          <button
            type="button"
            className={`${styles.option} ${!value ? styles.active : ''}`}
            onClick={() => handleSelect(null)}
          >
            All {label}
          </button>
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              className={`${styles.option} ${value === option.value ? styles.active : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default FilterDropdown
