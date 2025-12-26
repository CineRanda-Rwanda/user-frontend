import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '@/api/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/logo.png'
import styles from './Auth.module.css'

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tokenFromLink = searchParams.get('token') || ''
  const [token, setToken] = useState(tokenFromLink)

  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setToken(tokenFromLink)
  }, [tokenFromLink])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  const validate = () => {
    if (!form.password || form.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' })
      return false
    }
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Password confirmation does not match' })
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setGeneralError('')

    if (!validate()) {
      return
    }

    if (!token.trim()) {
      setGeneralError('Reset link is missing or expired. Please request a fresh password reset email.')
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPassword({
        token: token.trim(),
        newPassword: form.password
      })
      toast.success('Password updated successfully!')
      setCompleted(true)
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not reset password right now.'
      setGeneralError(message)
    } finally {
      setLoading(false)
    }
  }

  const goToLogin = () => navigate('/login', { replace: true })

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <div className={styles.logo}>
          <img src={randaPlusLogo} alt="Randa Plus" className={styles['logo-image']} />
        </div>

        <h2 className={styles.title}>Reset your password</h2>
        <p className={styles.subtitle}>Paste the token we emailed you, set a new password, and you are back in.</p>

        {generalError && <div className={styles['error-box']}>{generalError}</div>}

        {completed ? (
          <div className={styles.form}>
            <div className={styles['success-box']}>
              <strong>Your password has been updated.</strong>
              <p>Sign in with your new password to continue watching.</p>
            </div>

            <Button type="button" variant="primary" fullWidth onClick={goToLogin}>
              Go to Sign in
            </Button>

            <button type="button" className={styles['ghost-button']} onClick={() => navigate('/') }>
              ← Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              type="password"
              name="password"
              placeholder="New password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              helperText="Minimum 8 characters"
              togglePasswordVisibility
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              togglePasswordVisibility
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Update password
            </Button>

            <p className={styles['helper-note']}>
              Didn’t request this change? <Link to="/login" className={styles.link}>Return to sign in</Link>.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
