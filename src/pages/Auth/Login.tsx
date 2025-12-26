import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { LoginRequest } from '@/types/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/logo.png'
import styles from './Auth.module.css'

type LoginMethod = 'phone' | 'email'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [method, setMethod] = useState<LoginMethod>('phone')
  const [phoneForm, setPhoneForm] = useState({ phoneNumber: '', pin: '' })
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [pinStep, setPinStep] = useState<'request' | 'reset'>('request')
  const [pinForm, setPinForm] = useState({ phoneNumber: '', code: '', newPin: '', confirmPin: '' })
  const [pinError, setPinError] = useState('')
  const [pinInfo, setPinInfo] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ email: '', token: '', password: '', confirmPassword: '' })
  const [passwordStep, setPasswordStep] = useState<'request' | 'reset'>('request')
  const [passwordError, setPasswordError] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const resetErrors = () => {
    setErrors({})
    setGeneralError('')
  }

  const handleMethodChange = (nextMethod: LoginMethod) => {
    setMethod(nextMethod)
    resetErrors()
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPhoneForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setEmailForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    let payload: LoginRequest | null = null

    if (method === 'phone') {
      if (!phoneForm.phoneNumber.trim()) {
        setErrors({ phoneNumber: 'Phone number is required' })
        return
      }
      if (!phoneForm.pin || phoneForm.pin.trim().length < 4) {
        setErrors({ pin: 'PIN must be at least 4 digits' })
        return
      }
      payload = {
        method: 'phone',
        phoneNumber: phoneForm.phoneNumber.trim(),
        pin: phoneForm.pin.trim()
      }
    } else {
      if (!emailForm.email.trim() || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(emailForm.email.trim())) {
        setErrors({ email: 'Enter a valid email address' })
        return
      }
      if (!emailForm.password || emailForm.password.length < 6) {
        setErrors({ password: 'Password must be at least 6 characters' })
        return
      }
      payload = {
        method: 'email',
        email: emailForm.email.trim(),
        password: emailForm.password
      }
    }

    setLoading(true)
    try {
      if (payload) {
        await login(payload)
      }
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openPinModal = () => {
    setPinModalOpen(true)
    setPinStep('request')
    setPinForm({ phoneNumber: '', code: '', newPin: '', confirmPin: '' })
    setPinError('')
    setPinInfo('Enter the phone number linked to your account to receive a PIN reset code via SMS.')
  }

  const closePinModal = () => {
    setPinModalOpen(false)
    setPinLoading(false)
    setPinError('')
    setPinInfo('')
    setPinStep('request')
  }

  const handlePinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPinForm((prev) => ({ ...prev, [name]: value }))
    setPinError('')
  }

  const handlePinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPinError('')

    if (pinStep === 'request') {
      if (!pinForm.phoneNumber.trim()) {
        setPinError('Phone number is required to send a reset code.')
        return
      }

      setPinLoading(true)
      try {
        await authAPI.forgotPin(pinForm.phoneNumber.trim())
        toast.success('Reset code sent via SMS')
        setPinStep('reset')
        setPinInfo('Enter the code you received and choose a new 4-digit PIN.')
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Could not send reset code right now.'
        setPinError(message)
      } finally {
        setPinLoading(false)
      }
      return
    }

    if (!pinForm.code.trim()) {
      setPinError('Enter the verification code that was sent to you.')
      return
    }
    if (!pinForm.newPin || pinForm.newPin.length < 4) {
      setPinError('New PIN must be at least 4 digits.')
      return
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError('PIN confirmation does not match.')
      return
    }

    setPinLoading(true)
    try {
      await authAPI.resetPin(pinForm.code.trim(), pinForm.newPin)
      toast.success('PIN reset successfully. Please sign in with your new PIN.')
      closePinModal()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not reset PIN right now.'
      setPinError(message)
    } finally {
      setPinLoading(false)
    }
  }

  const openPasswordModal = () => {
    setPasswordModalOpen(true)
    setPasswordStep('request')
    setPasswordForm({ email: '', token: '', password: '', confirmPassword: '' })
    setPasswordError('')
  }

  const closePasswordModal = () => {
    setPasswordModalOpen(false)
    setPasswordLoading(false)
    setPasswordError('')
    setPasswordStep('request')
  }

  const handlePasswordInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
    setPasswordError('')
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError('')

    if (passwordStep === 'request') {
      if (!passwordForm.email.trim() || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(passwordForm.email.trim())) {
        setPasswordError('Enter a valid email address to continue.')
        return
      }

      setPasswordLoading(true)
      try {
        await authAPI.requestPasswordReset({ email: passwordForm.email.trim() })
        toast.success('Password reset link sent to your email')
        setPasswordStep('reset')
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Could not send reset link right now.'
        setPasswordError(message)
      } finally {
        setPasswordLoading(false)
      }
      return
    }

    if (!passwordForm.token.trim()) {
      setPasswordError('Enter the reset token from your email.')
      return
    }
    if (!passwordForm.password || passwordForm.password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError('Password confirmation does not match.')
      return
    }

    setPasswordLoading(true)
    try {
      await authAPI.resetPassword({
        token: passwordForm.token.trim(),
        newPassword: passwordForm.password
      })
      toast.success('Password updated successfully. You can now log in.')
      closePasswordModal()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Could not reset password right now.'
      setPasswordError(message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    const url = authAPI.getGoogleOAuthUrl()
    window.location.href = url
  }

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <div className={styles.logo}>
          <img src={randaPlusLogo} alt="Randa Plus" className={styles['logo-image']} />
        </div>

        <h2 className={styles.title}>Sign in to Randa Plus</h2>

        {generalError && (
          <div className={styles['error-box']}>{generalError}</div>
        )}

        <div className={styles['method-toggle']}>
          {['phone', 'email'].map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles['method-tab']} ${method === option ? styles['method-tab-active'] : ''}`}
              onClick={() => handleMethodChange(option as LoginMethod)}
            >
              {option === 'phone' ? 'Phone number' : 'Email address'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {method === 'phone' ? (
            <>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="e.g. +250783000111"
                value={phoneForm.phoneNumber}
                onChange={handlePhoneChange}
                error={errors.phoneNumber}
                required
                autoComplete="tel"
                helperText="Use the number linked to your Randa Plus account"
              />

              <Input
                type="password"
                name="pin"
                placeholder="4-digit PIN"
                value={phoneForm.pin}
                onChange={handlePhoneChange}
                error={errors.pin}
                required
                autoComplete="current-password"
                helperText="PIN is required for phone login"
                togglePasswordVisibility
              />
            </>
          ) : (
            <>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={emailForm.email}
                onChange={handleEmailChange}
                error={errors.email}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={emailForm.password}
                onChange={handleEmailChange}
                error={errors.password}
                required
                autoComplete="current-password"
                helperText="Minimum 6 characters"
                togglePasswordVisibility
              />
            </>
          )}

          <div className={styles['form-link-row']}>
            {method === 'phone' ? (
              <button type="button" className={styles['inline-link']} onClick={openPinModal}>
                Forgot PIN?
              </button>
            ) : (
              <button type="button" className={styles['inline-link']} onClick={openPasswordModal}>
                Forgot password?
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            {method === 'phone' ? 'Sign in with phone' : 'Sign in with email'}
          </Button>

          <div className={styles['section-divider']}>or continue with</div>

          <button type="button" className={styles['google-button']} onClick={handleGoogleSignIn}>
            <span className={styles['oauth-icon']}>
              <FcGoogle />
            </span>
            Continue with Google
          </button>

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

      {pinModalOpen && (
        <div className={styles['modal-backdrop']} role="dialog" aria-modal="true">
          <div className={styles['modal-card']}>
            <div className={styles['modal-header']}>
              <div>
                <h3 className={styles['modal-title']}>Reset Randa PIN</h3>
                <p className={styles['modal-subtitle']}>
                  {pinStep === 'request' ? 'Verify your phone to receive a code.' : 'Enter the code and a new PIN.'}
                </p>
              </div>
              <button type="button" className={styles['modal-close']} onClick={closePinModal} aria-label="Close reset PIN dialog">
                x
              </button>
            </div>

            {pinError && <div className={styles['error-box']}>{pinError}</div>}
            {pinInfo && <p className={styles['modal-info']}>{pinInfo}</p>}

            <form className={styles['modal-form']} onSubmit={handlePinSubmit}>
              {pinStep === 'request' ? (
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone number"
                  value={pinForm.phoneNumber}
                  onChange={handlePinInputChange}
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
                    value={pinForm.code}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="one-time-code"
                    helperText="6-digit code sent to your phone."
                  />
                  <Input
                    type="password"
                    name="newPin"
                    placeholder="New PIN"
                    value={pinForm.newPin}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="new-password"
                    helperText="Minimum 4 digits"
                    togglePasswordVisibility
                  />
                  <Input
                    type="password"
                    name="confirmPin"
                    placeholder="Confirm PIN"
                    value={pinForm.confirmPin}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="new-password"
                    togglePasswordVisibility
                  />
                </>
              )}

              <Button type="submit" variant="primary" fullWidth loading={pinLoading}>
                {pinStep === 'request' ? 'Send reset code' : 'Save new PIN'}
              </Button>
              <button type="button" className={styles['ghost-button']} onClick={closePinModal} disabled={pinLoading}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className={styles['modal-backdrop']} role="dialog" aria-modal="true">
          <div className={styles['modal-card']}>
            <div className={styles['modal-header']}>
              <div>
                <h3 className={styles['modal-title']}>Reset Password</h3>
                <p className={styles['modal-subtitle']}>
                  {passwordStep === 'request'
                    ? 'We will email you a reset link.'
                    : 'Enter the token from your email and set a new password.'}
                </p>
              </div>
              <button type="button" className={styles['modal-close']} onClick={closePasswordModal} aria-label="Close reset password dialog">
                x
              </button>
            </div>

            {passwordError && <div className={styles['error-box']}>{passwordError}</div>}

            <form className={styles['modal-form']} onSubmit={handlePasswordSubmit}>
              {passwordStep === 'request' ? (
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={passwordForm.email}
                  onChange={handlePasswordInputChange}
                  required
                  autoComplete="email"
                />
              ) : (
                <>
                  <Input
                    type="text"
                    name="token"
                    placeholder="Reset token"
                    value={passwordForm.token}
                    onChange={handlePasswordInputChange}
                    required
                  />
                  <Input
                    type="password"
                    name="password"
                    placeholder="New password"
                    value={passwordForm.password}
                    onChange={handlePasswordInputChange}
                    required
                    autoComplete="new-password"
                    helperText="Minimum 8 characters"
                    togglePasswordVisibility
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    autoComplete="new-password"
                    togglePasswordVisibility
                  />
                </>
              )}

              <Button type="submit" variant="primary" fullWidth loading={passwordLoading}>
                {passwordStep === 'request' ? 'Send reset link' : 'Update password'}
              </Button>
              <button type="button" className={styles['ghost-button']} onClick={closePasswordModal} disabled={passwordLoading}>
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
