import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
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
  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request')
  const [forgotForm, setForgotForm] = useState({ phoneNumber: '', code: '', newPin: '', confirmPin: '' })
  const [forgotError, setForgotError] = useState('')
  const [forgotInfo, setForgotInfo] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

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

  const openForgotModal = () => {
    setForgotModalOpen(true)
    setForgotStep('request')
    setForgotForm({ phoneNumber: '', code: '', newPin: '', confirmPin: '' })
    setForgotError('')
    setForgotInfo('Enter the phone number on your account and we will send you a reset code via SMS.')
  }

  const closeForgotModal = () => {
    setForgotModalOpen(false)
    setForgotLoading(false)
    setForgotError('')
    setForgotInfo('')
    setForgotStep('request')
  }

  const handleForgotInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForgotForm((prev) => ({ ...prev, [name]: value }))
    setForgotError('')
  }

  const handleForgotSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setForgotError('')

    if (forgotStep === 'request') {
      if (!forgotForm.phoneNumber.trim()) {
        setForgotError('Phone number is required to send a reset code.')
        return
      }

      setForgotLoading(true)
      try {
        await authAPI.forgotPin(forgotForm.phoneNumber.trim())
        toast.success('Reset code sent via SMS')
        setForgotStep('reset')
        setForgotInfo('Enter the code you received and choose a new 4-digit PIN.')
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Could not send reset code right now.'
        setForgotError(message)
      } finally {
        setForgotLoading(false)
      }
      return
    }

    if (!forgotForm.code.trim()) {
      setForgotError('Enter the verification code that was sent to you.')
      return
    }
    if (!forgotForm.newPin || forgotForm.newPin.length < 4) {
      setForgotError('New PIN must be at least 4 digits.')
      return
    }
    if (forgotForm.newPin !== forgotForm.confirmPin) {
      setForgotError('PIN confirmation does not match.')
      return
    }

    setForgotLoading(true)
    try {
      await authAPI.resetPin(forgotForm.code.trim(), forgotForm.newPin)
      toast.success('PIN reset successfully. Please sign in with your new PIN.')
      closeForgotModal()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not reset PIN right now.'
      setForgotError(message)
    } finally {
      setForgotLoading(false)
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

          <div className={styles['form-link-row']}>
            <button type="button" className={styles['inline-link']} onClick={openForgotModal}>
              Forgot PIN?
            </button>
          </div>

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

      {forgotModalOpen && (
        <div className={styles['modal-backdrop']} role="dialog" aria-modal="true">
          <div className={styles['modal-card']}>
            <div className={styles['modal-header']}>
              <div>
                <h3 className={styles['modal-title']}>Reset PIN</h3>
                <p className={styles['modal-subtitle']}>
                  {forgotStep === 'request' ? 'Verify your phone to receive a code.' : 'Enter the code and a new PIN.'}
                </p>
              </div>
              <button type="button" className={styles['modal-close']} onClick={closeForgotModal} aria-label="Close reset PIN dialog">
                x
              </button>
            </div>

            {forgotError && <div className={styles['error-box']}>{forgotError}</div>}
            {forgotInfo && <p className={styles['modal-info']}>{forgotInfo}</p>}

            <form className={styles['modal-form']} onSubmit={handleForgotSubmit}>
              {forgotStep === 'request' ? (
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone number"
                  value={forgotForm.phoneNumber}
                  onChange={handleForgotInputChange}
                  required
                  autoComplete="tel"
                  helperText="Use the number you registered with."
                />
              ) : (
                <>
                  <Input
                    type="text"
                    name="code"
                    placeholder="Verification code"
                    value={forgotForm.code}
                    onChange={handleForgotInputChange}
                    required
                    autoComplete="one-time-code"
                    helperText="6-digit code sent to your phone."
                  />
                  <Input
                    type="password"
                    name="newPin"
                    placeholder="New PIN"
                    value={forgotForm.newPin}
                    onChange={handleForgotInputChange}
                    required
                    autoComplete="new-password"
                    helperText="Minimum 4 digits"
                  />
                  <Input
                    type="password"
                    name="confirmPin"
                    placeholder="Confirm PIN"
                    value={forgotForm.confirmPin}
                    onChange={handleForgotInputChange}
                    required
                    autoComplete="new-password"
                  />
                </>
              )}

              <Button type="submit" variant="primary" fullWidth loading={forgotLoading}>
                {forgotStep === 'request' ? 'Send reset code' : 'Save new PIN'}
              </Button>
              <button type="button" className={styles['ghost-button']} onClick={closeForgotModal} disabled={forgotLoading}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
