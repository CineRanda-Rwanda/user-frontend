import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, useId, useMemo, useState } from 'react'
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

export default Input
