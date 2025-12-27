import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/logo.png'
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
  const { t } = useTranslation()
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
  const generalErrorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!generalError) return
    generalErrorRef.current?.focus()
  }, [generalError])

  useEffect(() => {
    const firstErrorField = Object.keys(errors).find((key) => errors[key])
    if (!firstErrorField) return
    const fieldEl = document.querySelector<HTMLInputElement>(`[name="${firstErrorField}"]`)
    fieldEl?.focus()
  }, [errors, method, step])

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
      setErrors({ username: t('auth.validation.usernameMin') })
      return false
    }
    if (!phoneForm.phoneNumber.trim()) {
      setErrors({ phoneNumber: t('auth.validation.phoneRequired') })
      return false
    }
    if (!phoneForm.pin || phoneForm.pin.trim().length < 4) {
      setErrors({ pin: t('auth.validation.pinMin') })
      return false
    }
    if (phoneForm.pin !== phoneForm.confirmPin) {
      setErrors({ confirmPin: t('auth.validation.pinMismatch') })
      return false
    }
    return true
  }

  const validateEmailForm = () => {
    if (!emailForm.username.trim() || emailForm.username.trim().length < 3) {
      setErrors({ username: t('auth.validation.usernameMin') })
      return false
    }
    if (!emailForm.email.trim() || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(emailForm.email.trim())) {
      setErrors({ email: t('auth.validation.emailInvalid') })
      return false
    }
    if (!emailForm.password || emailForm.password.length < 8) {
      setErrors({ password: t('auth.validation.passwordMin8') })
      return false
    }
    if (emailForm.password !== emailForm.confirmPassword) {
      setErrors({ confirmPassword: t('auth.validation.passwordMismatch') })
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
      setGeneralError(error.response?.data?.message || t('errors.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    resetErrors()

    if (!phoneVerificationCode.trim()) {
      setErrors({ verificationCode: t('auth.validation.verificationCodeRequired') })
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
      setGeneralError(error.response?.data?.message || t('errors.verificationFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async (event: React.FormEvent) => {
    event.preventDefault()
    resetErrors()

    if (!emailVerificationCode.trim()) {
      setErrors({ emailVerificationCode: t('auth.validation.verificationCodeRequired') })
      return
    }

    if (!emailForm.email.trim() || !emailForm.password) {
      setGeneralError(t('auth.register.emailReenterPrompt'))
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
      setGeneralError(error.response?.data?.message || t('errors.verificationFailed'))
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

        <h2 className={styles.title}>{t('auth.register.title')}</h2>

        {generalError && (
          <div
            ref={generalErrorRef}
            className={styles['error-box']}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
          >
            {generalError}
          </div>
        )}

        <div className={styles['method-toggle']}>
          {['phone', 'email'].map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles['method-tab']} ${method === option ? styles['method-tab-active'] : ''}`}
              onClick={() => handleMethodChange(option as RegisterMethod)}
              aria-pressed={method === option}
            >
              {option === 'phone' ? t('auth.register.methodPhone') : t('auth.register.methodEmail')}
            </button>
          ))}
        </div>

        {showPhoneVerification ? (
          <form onSubmit={handleVerify} className={styles.form}>
            <Input
              type="text"
              name="verificationCode"
              label={t('auth.register.verificationCodePlaceholder')}
              placeholder={t('auth.register.verificationCodePlaceholder')}
              value={phoneVerificationCode}
              onChange={(event) => setPhoneVerificationCode(event.target.value)}
              error={errors.verificationCode}
              required
              autoComplete="one-time-code"
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {t('auth.register.verifyPhoneCta')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep('register')}
              disabled={loading}
            >
              {t('auth.register.backToDetails')}
            </Button>
          </form>
        ) : showEmailVerification ? (
          <form onSubmit={handleEmailVerification} className={styles.form}>
            <Input
              type="text"
              name="emailVerificationCode"
              label={t('auth.register.emailVerificationPlaceholder')}
              placeholder={t('auth.register.emailVerificationPlaceholder')}
              value={emailVerificationCode}
              onChange={(event) => setEmailVerificationCode(event.target.value)}
              error={errors.emailVerificationCode}
              required
              autoComplete="one-time-code"
              helperText={t('auth.register.sentToEmail', { email: emailForm.email || t('auth.register.yourInbox') })}
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {t('auth.register.verifyEmailCta')}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep('register')}
              disabled={loading}
            >
              {t('auth.register.backToDetails')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {method === 'phone' ? (
              <>
                <Input
                  type="text"
                  name="username"
                  label={t('auth.register.username')}
                  placeholder={t('auth.register.username')}
                  value={phoneForm.username}
                  onChange={handlePhoneChange}
                  error={errors.username}
                  required
                  autoComplete="username"
                  helperText={t('auth.register.usernameHelper')}
                />

                <Input
                  type="tel"
                  name="phoneNumber"
                  label={t('auth.register.phonePlaceholder')}
                  placeholder={t('auth.register.phonePlaceholder')}
                  value={phoneForm.phoneNumber}
                  onChange={handlePhoneChange}
                  error={errors.phoneNumber}
                  required
                  autoComplete="tel"
                />

                <Input
                  type="password"
                  name="pin"
                  label={t('auth.register.pin')}
                  placeholder={t('auth.register.pin')}
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
                  label={t('auth.register.confirmPin')}
                  placeholder={t('auth.register.confirmPin')}
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
                  label={t('auth.register.username')}
                  placeholder={t('auth.register.username')}
                  value={emailForm.username}
                  onChange={handleEmailChange}
                  error={errors.username}
                  required
                  autoComplete="username"
                />

                <Input
                  type="email"
                  name="email"
                  label={t('auth.register.emailPlaceholder')}
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={emailForm.email}
                  onChange={handleEmailChange}
                  error={errors.email}
                  required
                  autoComplete="email"
                />

                <Input
                  type="password"
                  name="password"
                  label={t('auth.register.password')}
                  placeholder={t('auth.register.password')}
                  value={emailForm.password}
                  onChange={handleEmailChange}
                  error={errors.password}
                  required
                  autoComplete="new-password"
                  helperText={t('auth.register.passwordHelper')}
                  togglePasswordVisibility
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  label={t('auth.register.confirmPassword')}
                  placeholder={t('auth.register.confirmPassword')}
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
              {method === 'phone' ? t('auth.register.sendVerificationCode') : t('auth.register.submit')}
            </Button>

            <div className={styles['section-divider']}>{t('auth.register.orContinueWith')}</div>

            <button type="button" className={styles['google-button']} onClick={handleGoogleSignIn}>
              <span className={styles['oauth-icon']}>
                <FcGoogle />
              </span>
              {t('auth.login.google')}
            </button>
          </form>
        )}

        <button type="button" className={styles['ghost-button']} onClick={() => navigate('/')}>
          {t('auth.register.backToHome')}
        </button>

        <p className={styles['link-text']}>
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className={styles.link}>
            {t('auth.register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
