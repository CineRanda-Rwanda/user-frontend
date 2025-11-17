import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface BaseInputProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  icon?: React.ReactNode
  onIconClick?: () => void
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
      <div className={styles['input-wrapper']}>
        <input
          className={`${styles.input} ${error ? styles['input-error'] : ''} ${className}`}
          {...props}
        />
        {icon && (
          <span
            className={`${styles['input-icon']} ${onIconClick ? styles['input-icon-clickable'] : ''}`}
            onClick={onIconClick}
          >
            {icon}
          </span>
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
