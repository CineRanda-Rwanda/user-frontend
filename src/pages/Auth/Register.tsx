import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/randa-plus-logo.svg'
import styles from './Auth.module.css'

type RegisterMethod = 'phone' | 'email'
type PhoneRegisterForm = {
  username: string
  phoneNumber: string
  pin: string
  confirmPin: string
  preferredChannel: 'sms'
}

type EmailRegisterForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const Register: React.FC = () => {
  const { register, verifyRegistration, verifyEmail } = useAuth()
  const navigate = useNavigate()
  const [method, setMethod] = useState<RegisterMethod>('phone')
  const [step, setStep] = useState<'register' | 'verifyPhone' | 'verifyEmail'>('register')
  const [phoneForm, setPhoneForm] = useState<PhoneRegisterForm>({
    username: '',
    phoneNumber: '',
    pin: '',
    confirmPin: '',
    preferredChannel: 'sms'
  })
  const [emailForm, setEmailForm] = useState<EmailRegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('')
  const [emailVerificationCode, setEmailVerificationCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const resetErrors = () => {
    setErrors({})
    setGeneralError('')
  }

  const handleMethodChange = (next: RegisterMethod) => {
    setMethod(next)
    resetErrors()
    setStep('register')
    setPhoneVerificationCode('')
    setEmailVerificationCode('')
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

  const validatePhoneForm = () => {
    if (!phoneForm.username.trim() || phoneForm.username.trim().length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' })
      return false
    }
    if (!phoneForm.phoneNumber.trim()) {
      setErrors({ phoneNumber: 'Phone number is required' })
      return false
    }
    if (!phoneForm.pin || phoneForm.pin.trim().length < 4) {
      setErrors({ pin: 'PIN must be at least 4 digits' })
      return false
    }
    if (phoneForm.pin !== phoneForm.confirmPin) {
      setErrors({ confirmPin: 'PIN confirmation does not match' })
      return false
    }
    return true
  }

  const validateEmailForm = () => {
    if (!emailForm.username.trim() || emailForm.username.trim().length < 3) {
      setErrors({ username: 'Username must be at least 3 characters' })
      return false
    }
    if (!emailForm.email.trim() || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(emailForm.email.trim())) {
      setErrors({ email: 'Enter a valid email address' })
      return false
    }
    if (!emailForm.password || emailForm.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' })
      return false
    }
    if (emailForm.password !== emailForm.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    resetErrors()

    if (method === 'phone' && !validatePhoneForm()) {
      return
    }

    if (method === 'email' && !validateEmailForm()) {
      return
    }

    setLoading(true)
    try {
      if (method === 'phone') {
        await register({
          method: 'phone',
          username: phoneForm.username.trim(),
          phoneNumber: phoneForm.phoneNumber.trim(),
          pin: phoneForm.pin.trim(),
          preferredChannel: phoneForm.preferredChannel
        })
        setStep('verifyPhone')
      } else {
        const response = await register({
          method: 'email',
          username: emailForm.username.trim(),
          email: emailForm.email.trim(),
          password: emailForm.password
        })
        const verificationPayload: any = response?.data ?? response
        if (verificationPayload?.verificationRequired) {
          setStep('verifyEmail')
        }
      }
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    resetErrors()

    if (!phoneVerificationCode.trim()) {
      setErrors({ verificationCode: 'Verification code is required' })
      return
    }

    setLoading(true)
    try {
      await verifyRegistration({
        username: phoneForm.username,
        phoneNumber: phoneForm.phoneNumber,
        pin: phoneForm.pin,
        verificationCode: phoneVerificationCode
      })
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async (event: React.FormEvent) => {
    event.preventDefault()
    resetErrors()

    if (!emailVerificationCode.trim()) {
      setErrors({ emailVerificationCode: 'Verification code is required' })
      return
    }

    if (!emailForm.email.trim() || !emailForm.password) {
      setGeneralError('Please provide your email and password again to continue.')
      return
    }

    setLoading(true)
    try {
      await verifyEmail({
        email: emailForm.email.trim(),
        verificationCode: emailVerificationCode.trim(),
        password: emailForm.password
      })
    } catch (error: any) {
      setGeneralError(error.response?.data?.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    const url = authAPI.getGoogleOAuthUrl()
    window.location.href = url
  }

  const renderChannelSelector = () => null

  const showPhoneVerification = method === 'phone' && step === 'verifyPhone'
  const showEmailVerification = method === 'email' && step === 'verifyEmail'

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-box']}>
        <div className={styles.logo}>
          <img src={randaPlusLogo} alt="Randa Plus" className={styles['logo-image']} />
        </div>

        <h2 className={styles.title}>Create your account</h2>

        {generalError && <div className={styles['error-box']}>{generalError}</div>}

        <div className={styles['method-toggle']}>
          {['phone', 'email'].map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles['method-tab']} ${method === option ? styles['method-tab-active'] : ''}`}
              onClick={() => handleMethodChange(option as RegisterMethod)}
            >
              {option === 'phone' ? 'Phone number' : 'Email address'}
            </button>
          ))}
        </div>

        {showPhoneVerification ? (
          <form onSubmit={handleVerify} className={styles.form}>
            <Input
              type="text"
              name="verificationCode"
              placeholder="6-digit verification code"
              value={phoneVerificationCode}
              onChange={(event) => setPhoneVerificationCode(event.target.value)}
              error={errors.verificationCode}
              required
              autoComplete="one-time-code"
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Verify & Complete Registration
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep('register')}
              disabled={loading}
            >
              Back to details
            </Button>
          </form>
        ) : showEmailVerification ? (
          <form onSubmit={handleEmailVerification} className={styles.form}>
            <Input
              type="text"
              name="emailVerificationCode"
              placeholder="Enter the code from your email"
              value={emailVerificationCode}
              onChange={(event) => setEmailVerificationCode(event.target.value)}
              error={errors.emailVerificationCode}
              required
              autoComplete="one-time-code"
              helperText={`Sent to ${emailForm.email || 'your inbox'}`}
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Verify & Activate Account
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep('register')}
              disabled={loading}
            >
              Back to details
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {method === 'phone' ? (
              <>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={phoneForm.username}
                  onChange={handlePhoneChange}
                  error={errors.username}
                  required
                  autoComplete="username"
                  helperText="3-20 characters, letters, numbers, underscore"
                />

                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="e.g. +250783000111"
                  value={phoneForm.phoneNumber}
                  onChange={handlePhoneChange}
                  error={errors.phoneNumber}
                  required
                  autoComplete="tel"
                />

                <Input
                  type="password"
                  name="pin"
                  placeholder="4-digit PIN"
                  value={phoneForm.pin}
                  onChange={handlePhoneChange}
                  error={errors.pin}
                  required
                  autoComplete="new-password"
                  togglePasswordVisibility
                />

                <Input
                  type="password"
                  name="confirmPin"
                  placeholder="Confirm PIN"
                  value={phoneForm.confirmPin}
                  onChange={handlePhoneChange}
                  error={errors.confirmPin}
                  required
                  autoComplete="new-password"
                  togglePasswordVisibility
                />

                {renderChannelSelector()}
              </>
            ) : (
              <>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={emailForm.username}
                  onChange={handleEmailChange}
                  error={errors.username}
                  required
                  autoComplete="username"
                />

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
                  autoComplete="new-password"
                  helperText="Minimum 8 characters"
                  togglePasswordVisibility
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={emailForm.confirmPassword}
                  onChange={handleEmailChange}
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                  togglePasswordVisibility
                />

              </>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {method === 'phone' ? 'Send verification code' : 'Create account'}
            </Button>

            <div className={styles['section-divider']}>or continue with</div>

            <button type="button" className={styles['google-button']} onClick={handleGoogleSignIn}>
              <span className={styles['oauth-icon']}>
                <FcGoogle />
              </span>
              Continue with Google
            </button>
          </form>
        )}

        <button type="button" className={styles['ghost-button']} onClick={() => navigate('/')}>
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
