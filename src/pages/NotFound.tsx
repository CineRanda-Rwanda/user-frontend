import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import styles from './Auth.module.css'

const NotFound: React.FC = () => {
  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']} style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '120px', margin: 0 }}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/browse">
          <Button variant="primary">Go to Browse</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
