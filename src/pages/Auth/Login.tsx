import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FcGoogle } from 'react-icons/fc'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/api/auth'
import { LoginRequest } from '@/types/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/logo.png'
import styles from './Auth.module.css'

type LoginMethod = 'phone' | 'email'

const Login: React.FC = () => {
  const { t } = useTranslation()
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
        setErrors({ phoneNumber: t('auth.validation.phoneRequired') })
        return
      }
      if (!phoneForm.pin || phoneForm.pin.trim().length < 4) {
        setErrors({ pin: t('auth.validation.pinMin') })
        return
      }
      payload = {
        method: 'phone',
        phoneNumber: phoneForm.phoneNumber.trim(),
        pin: phoneForm.pin.trim()
      }
    } else {
      if (!emailForm.email.trim() || !/^[\w.+-]+@[\w-]+\.[\w.-]+$/i.test(emailForm.email.trim())) {
        setErrors({ email: t('auth.validation.emailInvalid') })
        return
      }
      if (!emailForm.password || emailForm.password.length < 6) {
        setErrors({ password: t('auth.validation.passwordMin6') })
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
      setGeneralError(error.response?.data?.message || t('errors.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const openPinModal = () => {
    setPinModalOpen(true)
    setPinStep('request')
    setPinForm({ phoneNumber: '', code: '', newPin: '', confirmPin: '' })
    setPinError('')
    setPinInfo(t('auth.forgotPin.infoRequest'))
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
        setPinError(t('auth.forgotPin.errors.phoneRequired'))
        return
      }

      setPinLoading(true)
      try {
        await authAPI.forgotPin(pinForm.phoneNumber.trim())
        toast.success(t('auth.forgotPin.toasts.codeSent'))
        setPinStep('reset')
        setPinInfo(t('auth.forgotPin.infoReset'))
      } catch (error: any) {
        const message = error?.response?.data?.message || t('auth.forgotPin.errors.sendFailed')
        setPinError(message)
      } finally {
        setPinLoading(false)
      }
      return
    }

    if (!pinForm.code.trim()) {
      setPinError(t('auth.forgotPin.errors.codeRequired'))
      return
    }
    if (!pinForm.newPin || pinForm.newPin.length < 4) {
      setPinError(t('auth.forgotPin.errors.newPinMin'))
      return
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError(t('auth.forgotPin.errors.pinMismatch'))
      return
    }

    setPinLoading(true)
    try {
      await authAPI.resetPin(pinForm.code.trim(), pinForm.newPin)
      toast.success(t('auth.forgotPin.toasts.resetSuccess'))
      closePinModal()
    } catch (error: any) {
      const message = error?.response?.data?.message || t('auth.forgotPin.errors.resetFailed')
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
        setPasswordError(t('auth.validation.emailInvalid'))
        return
      }

      setPasswordLoading(true)
      try {
        await authAPI.requestPasswordReset({ email: passwordForm.email.trim() })
        toast.success(t('auth.forgotPassword.toasts.linkSent'))
        setPasswordStep('reset')
      } catch (error: any) {
        const message = error?.response?.data?.message || t('auth.forgotPassword.errors.sendFailed')
        setPasswordError(message)
      } finally {
        setPasswordLoading(false)
      }
      return
    }

    if (!passwordForm.token.trim()) {
      setPasswordError(t('auth.forgotPassword.errors.tokenRequired'))
      return
    }
    if (!passwordForm.password || passwordForm.password.length < 8) {
      setPasswordError(t('auth.validation.passwordMin8'))
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError(t('auth.validation.passwordMismatch'))
      return
    }

    setPasswordLoading(true)
    try {
      await authAPI.resetPassword({
        token: passwordForm.token.trim(),
        newPassword: passwordForm.password
      })
      toast.success(t('auth.forgotPassword.toasts.updatedSuccess'))
      closePasswordModal()
    } catch (error: any) {
      const message = error?.response?.data?.message || t('auth.forgotPassword.errors.resetFailed')
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

        <h2 className={styles.title}>{t('auth.login.title')}</h2>

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
              {option === 'phone' ? t('auth.login.methodPhone') : t('auth.login.methodEmail')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {method === 'phone' ? (
            <>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder={t('auth.register.phonePlaceholder')}
                value={phoneForm.phoneNumber}
                onChange={handlePhoneChange}
                error={errors.phoneNumber}
                required
                autoComplete="tel"
                helperText={t('auth.login.phoneHelper')}
              />

              <Input
                type="password"
                name="pin"
                placeholder={t('auth.login.pinPlaceholder')}
                value={phoneForm.pin}
                onChange={handlePhoneChange}
                error={errors.pin}
                required
                autoComplete="current-password"
                helperText={t('auth.login.pinHelper')}
                togglePasswordVisibility
              />
            </>
          ) : (
            <>
              <Input
                type="email"
                name="email"
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
                placeholder={t('auth.login.passwordPlaceholder')}
                value={emailForm.password}
                onChange={handleEmailChange}
                error={errors.password}
                required
                autoComplete="current-password"
                helperText={t('auth.login.passwordHelperMin6')}
                togglePasswordVisibility
              />
            </>
          )}

          <div className={styles['form-link-row']}>
            {method === 'phone' ? (
              <button type="button" className={styles['inline-link']} onClick={openPinModal}>
                {t('auth.login.forgotPin')}
              </button>
            ) : (
              <button type="button" className={styles['inline-link']} onClick={openPasswordModal}>
                {t('auth.login.forgotPassword')}
              </button>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            {method === 'phone' ? t('auth.login.submitPhone') : t('auth.login.submitEmail')}
          </Button>

          <div className={styles['section-divider']}>{t('auth.register.orContinueWith')}</div>

          <button type="button" className={styles['google-button']} onClick={handleGoogleSignIn}>
            <span className={styles['oauth-icon']}>
              <FcGoogle />
            </span>
            {t('auth.login.google')}
          </button>

          <button
            type="button"
            className={styles['ghost-button']}
            onClick={() => navigate('/')}
          >
            {t('auth.register.backToHome')}
          </button>
        </form>

        <p className={styles['link-text']}>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className={styles.link}>
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </div>

      {pinModalOpen && (
        <div className={styles['modal-backdrop']} role="dialog" aria-modal="true">
          <div className={styles['modal-card']}>
            <div className={styles['modal-header']}>
              <div>
                <h3 className={styles['modal-title']}>{t('auth.forgotPin.title')}</h3>
                <p className={styles['modal-subtitle']}>
                  {pinStep === 'request' ? t('auth.forgotPin.subtitleRequest') : t('auth.forgotPin.subtitleReset')}
                </p>
              </div>
              <button
                type="button"
                className={styles['modal-close']}
                onClick={closePinModal}
                aria-label={t('auth.forgotPin.closeAria')}
              >
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
                  placeholder={t('auth.forgotPin.form.phonePlaceholder')}
                  value={pinForm.phoneNumber}
                  onChange={handlePinInputChange}
                  required
                  autoComplete="tel"
                  helperText={t('auth.forgotPin.form.phoneHelper')}
                />
              ) : (
                <>
                  <Input
                    type="text"
                    name="code"
                    placeholder={t('auth.forgotPin.form.codePlaceholder')}
                    value={pinForm.code}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="one-time-code"
                    helperText={t('auth.forgotPin.form.codeHelper')}
                  />
                  <Input
                    type="password"
                    name="newPin"
                    placeholder={t('auth.forgotPin.form.newPinPlaceholder')}
                    value={pinForm.newPin}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="new-password"
                    helperText={t('auth.forgotPin.form.newPinHelper')}
                    togglePasswordVisibility
                  />
                  <Input
                    type="password"
                    name="confirmPin"
                    placeholder={t('auth.forgotPin.form.confirmPinPlaceholder')}
                    value={pinForm.confirmPin}
                    onChange={handlePinInputChange}
                    required
                    autoComplete="new-password"
                    togglePasswordVisibility
                  />
                </>
              )}

              <Button type="submit" variant="primary" fullWidth loading={pinLoading}>
                {pinStep === 'request' ? t('auth.forgotPin.actions.sendCode') : t('auth.forgotPin.actions.savePin')}
              </Button>
              <button type="button" className={styles['ghost-button']} onClick={closePinModal} disabled={pinLoading}>
                {t('auth.forgotPin.actions.cancel')}
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
                <h3 className={styles['modal-title']}>{t('auth.forgotPassword.title')}</h3>
                <p className={styles['modal-subtitle']}>
                  {passwordStep === 'request'
                    ? t('auth.forgotPassword.subtitleRequest')
                    : t('auth.forgotPassword.subtitleReset')}
                </p>
              </div>
              <button
                type="button"
                className={styles['modal-close']}
                onClick={closePasswordModal}
                aria-label={t('auth.forgotPassword.closeAria')}
              >
                x
              </button>
            </div>

            {passwordError && <div className={styles['error-box']}>{passwordError}</div>}

            <form className={styles['modal-form']} onSubmit={handlePasswordSubmit}>
              {passwordStep === 'request' ? (
                <Input
                  type="email"
                  name="email"
                  placeholder={t('auth.forgotPassword.form.emailPlaceholder')}
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
                    placeholder={t('auth.forgotPassword.form.tokenPlaceholder')}
                    value={passwordForm.token}
                    onChange={handlePasswordInputChange}
                    required
                  />
                  <Input
                    type="password"
                    name="password"
                    placeholder={t('auth.forgotPassword.form.passwordPlaceholder')}
                    value={passwordForm.password}
                    onChange={handlePasswordInputChange}
                    required
                    autoComplete="new-password"
                    helperText={t('auth.forgotPassword.form.passwordHelper')}
                    togglePasswordVisibility
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder={t('auth.forgotPassword.form.confirmPasswordPlaceholder')}
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    autoComplete="new-password"
                    togglePasswordVisibility
                  />
                </>
              )}

              <Button type="submit" variant="primary" fullWidth loading={passwordLoading}>
                {passwordStep === 'request'
                  ? t('auth.forgotPassword.actions.sendLink')
                  : t('auth.forgotPassword.actions.updatePassword')}
              </Button>
              <button type="button" className={styles['ghost-button']} onClick={closePasswordModal} disabled={passwordLoading}>
                {t('auth.forgotPassword.actions.cancel')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
