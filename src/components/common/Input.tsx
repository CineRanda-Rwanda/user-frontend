import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, useMemo, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
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
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles['input-wrapper']}>
        <input className={inputClasses} type={inputType} {...props} />
        {icon && (
          <span
            className={`${styles['input-icon']} ${onIconClick ? styles['input-icon-clickable'] : ''}`}
            onClick={onIconClick}
          >
            {icon}
          </span>
        )}
        {canTogglePassword && (
          <button
            type="button"
            className={styles['visibility-toggle']}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
          >
            {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
      </div>
      {error && <span className={styles['error-message']}>{error}</span>}
      {helperText && !error && <span className={styles['helper-text']}>{helperText}</span>}
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
  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        className={`${styles.input} ${styles.textarea} ${error ? styles['input-error'] : ''} ${className}`}
        {...props}
      />
      {error && <span className={styles['error-message']}>{error}</span>}
      {helperText && !error && <span className={styles['helper-text']}>{helperText}</span>}
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
  return (
    <div className={styles['input-group']}>
      {label && (
        <label className={styles.label} htmlFor={props.id || props.name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        className={`${styles.input} ${styles.select} ${error ? styles['input-error'] : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles['error-message']}>{error}</span>}
      {helperText && !error && <span className={styles['helper-text']}>{helperText}</span>}
    </div>
  )
}

export default Input
