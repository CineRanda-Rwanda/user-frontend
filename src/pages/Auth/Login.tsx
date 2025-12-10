import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import styles from './Auth.module.css'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or phone number
    pin: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    // Basic validation
    if (!formData.identifier.trim()) {
      setErrors({ identifier: 'Username or phone number is required' })
      return
    }
    if (!formData.pin || formData.pin.length < 4) {
      setErrors({ ...errors, pin: 'PIN must be at least 4 digits' })
      return
    }

    setLoading(true)
    try {
      await login(formData)
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <div className={styles.logo}>
          <span className={styles['logo-icon']}>🎬</span>
          <h1 className={styles['logo-text']}>Cineranda</h1>
        </div>

        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to continue streaming</p>

        {generalError && (
          <div className={styles['error-box']}>{generalError}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            name="identifier"
            placeholder="Username or Phone Number"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
            required
            autoComplete="username"
          />

          <Input
            type="password"
            name="pin"
            placeholder="PIN"
            value={formData.pin}
            onChange={handleChange}
            error={errors.pin}
            required
            autoComplete="current-password"
            helperText="Enter your 4-digit PIN"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>

          <button
            type="button"
            className={styles['ghost-button']}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </form>

        <p className={styles['link-text']}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
