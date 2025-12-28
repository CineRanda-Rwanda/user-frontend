import React, {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styles from './Input.module.css'

interface BaseInputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  icon?: React.ReactNode
  onIconClick?: () => void
  togglePasswordVisibility?: boolean
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement>
type TextareaProps = BaseInputProps & TextareaHTMLAttributes<HTMLTextAreaElement>
type SelectProps = BaseInputProps & SelectHTMLAttributes<HTMLSelectElement>

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  required,
  icon,
  onIconClick,
  togglePasswordVisibility = false,
  className = '',
  type = 'text',
  ...props
}) => {
  const { t } = useTranslation()
  const reactId = useId()
  const inputId = props.id || props.name || `input-${reactId}`
  const helperId = helperText ? `${inputId}-help` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const canTogglePassword = togglePasswordVisibility && type === 'password'
  const inputType = canTogglePassword ? (isPasswordVisible ? 'text' : 'password') : type

  const inputClasses = useMemo(() => {
    const classes = [styles.input, className]
    if (error) classes.push(styles['input-error'])
    if (icon || canTogglePassword) classes.push(styles['input-with-suffix'])
    return classes.join(' ').trim()
  }, [className, error, icon, canTogglePassword])

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles['input-wrapper']}>
        <input
          {...props}
          id={inputId}
          className={inputClasses}
          type={inputType}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
        />
        {icon && (
          <span
            className={`${styles['input-icon']} ${onIconClick ? styles['input-icon-clickable'] : ''}`}
            onClick={onIconClick}
            role={onIconClick ? 'button' : undefined}
            tabIndex={onIconClick ? 0 : undefined}
            onKeyDown={(event) => {
              if (!onIconClick) return
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onIconClick()
            }}
          >
            {icon}
          </span>
        )}
        {canTogglePassword && (
          <button
            type="button"
            className={styles['visibility-toggle']}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? t('common.hidePassword') : t('common.showPassword')}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className={styles['error-message']} role="alert" aria-live="polite">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className={styles['helper-text']}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  ...props
}) => {
  const reactId = useId()
  const textareaId = props.id || props.name || `textarea-${reactId}`
  const helperId = helperText ? `${textareaId}-help` : undefined
  const errorId = error ? `${textareaId}-error` : undefined

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        id={textareaId}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperId}
        className={`${styles.input} ${styles.textarea} ${error ? styles['input-error'] : ''} ${className}`}
      />
      {error && (
        <span id={errorId} className={styles['error-message']} role="alert" aria-live="polite">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className={styles['helper-text']}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  required,
  children,
  className = '',
  ...props
}) => {
  const reactId = useId()
  const selectId = props.id || props.name || `select-${reactId}`
  const helperId = helperText ? `${selectId}-help` : undefined
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        {...props}
        id={selectId}
        required={required}
        aria-required={required ? 'true' : undefined}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : helperId}
        className={`${styles.input} ${styles.select} ${error ? styles['input-error'] : ''} ${className}`}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} className={styles['error-message']} role="alert" aria-live="polite">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className={styles['helper-text']}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export type CountryCodeOption = {
  country: string
  code: string
}

type CountryCodeSelectProps = BaseInputProps & {
  name?: string
  value: string
  options: CountryCodeOption[]
  onChange: (nextValue: string) => void
  disabled?: boolean
}

export const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({
  label,
  error,
  helperText,
  required,
  name,
  value,
  options,
  onChange,
  disabled
}) => {
  const { t } = useTranslation()
  const reactId = useId()
  const selectId = name || `country-code-${reactId}`
  const helperId = helperText ? `${selectId}-help` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const listboxId = `${selectId}-listbox`

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => {
      const haystack = `${opt.country} ${opt.code}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [options, query])

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const nextIndex = filteredOptions.findIndex((opt) => opt.code === value)
    setActiveIndex(nextIndex >= 0 ? nextIndex : 0)
  }, [filteredOptions, value])

  useEffect(() => {
    const closeIfOutside = (target: EventTarget | null) => {
      if (!isOpen) return
      if (!target) return
      if (!wrapperRef.current?.contains(target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    const handleMouseDown = (event: MouseEvent) => closeIfOutside(event.target)
    const handleTouchStart = (event: TouchEvent) => closeIfOutside(event.target)
    const touchOptions: AddEventListenerOptions = { passive: true }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('touchstart', handleTouchStart, touchOptions)
    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('touchstart', handleTouchStart, touchOptions)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    searchRef.current?.focus()
  }, [activeIndex, isOpen])

  const selected = useMemo(() => {
    return options.find((opt) => opt.code === value) ?? options[0]
  }, [options, value])

  const commitSelection = (nextIndex: number) => {
    const option = filteredOptions[nextIndex]
    if (!option) return
    onChange(option.code)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className={styles['input-group']} ref={wrapperRef}>
      {label && (
        <label className={styles.label} htmlFor={`${selectId}-button`}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles['country-select-wrapper']}>
        <button
          id={`${selectId}-button`}
          type="button"
          name={name}
          disabled={disabled}
          className={`${styles.input} ${styles.select} ${styles['country-select-button']} ${
            error ? styles['input-error'] : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperId}
          onClick={() => setIsOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (disabled) return

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setIsOpen(true)
              return
            }
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setIsOpen((prev) => !prev)
              return
            }
            if (event.key === 'Escape') {
              setIsOpen(false)
              setQuery('')
            }
          }}
        >
          <span className={styles['country-select-value']}>{selected?.code}</span>
        </button>

        {isOpen && (
          <div className={styles['country-select-list']}>
            <input
              ref={searchRef}
              type="text"
              className={`${styles.input} ${styles['country-select-search']}`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              placeholder={t('common.search')}
              aria-label={t('common.search')}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setIsOpen(false)
                  setQuery('')
                  return
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  const first = listRef.current?.querySelector<HTMLElement>('[data-index="0"]')
                  first?.focus()
                }
              }}
            />

            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-label={label}
              className={styles['country-select-options']}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setIsOpen(false)
                  setQuery('')
                  return
                }
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1))
                  return
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((prev) => Math.max(prev - 1, 0))
                  return
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitSelection(activeIndex)
                }
              }}
            >
              {filteredOptions.map((opt, index) => {
                const isSelected = opt.code === selected?.code
                const isActive = index === activeIndex
                return (
                  <li key={`${opt.country}-${opt.code}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles['country-select-option']} ${
                        isActive ? styles['country-select-option-active'] : ''
                      }`}
                      data-index={index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onClick={() => commitSelection(index)}
                    >
                      {opt.country} ({opt.code})
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <span id={errorId} className={styles['error-message']} role="alert" aria-live="polite">
          {error}
        </span>
      )}
      {helperText && !error && (
        <span id={helperId} className={styles['helper-text']}>
          {helperText}
        </span>
      )}
    </div>
  )
}

export default Input
