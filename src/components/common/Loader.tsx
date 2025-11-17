import React from 'react'
import styles from './Loader.module.css'

interface LoaderProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
  text?: string
}

const Loader: React.FC<LoaderProps> = ({ size = 'medium', fullScreen = false, text }) => {
  const containerClass = fullScreen 
    ? `${styles['loader-container']} ${styles['loader-full-screen']}`
    : styles['loader-container']

  const spinnerClass = size !== 'medium' 
    ? `${styles.spinner} ${styles[`spinner-${size}`]}`
    : styles.spinner

  return (
    <div className={containerClass}>
      <div>
        <div className={spinnerClass} />
        {text && <div className={styles['loader-text']}>{text}</div>}
      </div>
    </div>
  )
}

export default Loader
