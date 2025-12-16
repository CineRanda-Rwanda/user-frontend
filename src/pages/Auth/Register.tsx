import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import styles from './Auth.module.css'

const Register: React.FC = () => {
  const { register, verifyRegistration } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    pin: '',
    confirmPin: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
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
    if (!formData.username.trim() || formData.username.length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' })
      return
    }
    if (!formData.phoneNumber.trim()) {
      setErrors({ ...errors, phoneNumber: 'Phone number is required' })
      return
    }
    if (!formData.pin || formData.pin.length < 4) {
      setErrors({ ...errors, pin: 'PIN must be at least 4 digits' })
      return
    }
    if (formData.pin !== formData.confirmPin) {
      setErrors({ ...errors, confirmPin: 'PINs do not match' })
      return
    }

    setLoading(true)
    try {
      const { confirmPin, ...registerData } = formData
      await register(registerData)
      setStep('verify')
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    if (!verificationCode.trim()) {
      setErrors({ verificationCode: 'Verification code is required' })
      return
    }

    if (!formData.username || !formData.pin || !formData.phoneNumber) {
      setGeneralError('Registration details missing. Please restart the process.')
      setStep('register')
      return
    }

    setLoading(true)
    try {
      await verifyRegistration({
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        pin: formData.pin,
        verificationCode
      })
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <div className={styles.logo}>
          <span className={styles['logo-icon']}>🎬</span>
          <h1 className={styles['logo-text']}>CinéRanda</h1>
        </div>

        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join us and start streaming</p>

        {generalError && (
          <div className={styles['error-box']}>{generalError}</div>
        )}

        {step === 'register' ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
              autoComplete="username"
              helperText="3-20 characters, letters, numbers, underscore"
            />

            <Input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              required
              autoComplete="tel"
              helperText="Format: +250XXXXXXXXX"
            />

            <Input
              type="password"
              name="pin"
              placeholder="PIN"
              value={formData.pin}
              onChange={handleChange}
              error={errors.pin}
              required
              autoComplete="new-password"
              helperText="Create a 4-digit PIN"
            />

            <Input
              type="password"
              name="confirmPin"
              placeholder="Confirm PIN"
              value={formData.confirmPin}
              onChange={handleChange}
              error={errors.confirmPin}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Create Account
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className={styles.form}>
            <p className={styles.subtitle}>
              Enter the verification code sent to {formData.phoneNumber}
            </p>

            <Input
              type="text"
              name="verificationCode"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              error={errors.verificationCode}
              required
              helperText="Enter the 6-digit code"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Verify & Complete Registration
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep('register')}
              disabled={loading}
            >
              Back
            </Button>
          </form>
        )}

        <button
          type="button"
          className={styles['ghost-button']}
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>

        <p className={styles['link-text']}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
