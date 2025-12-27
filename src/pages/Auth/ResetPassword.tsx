import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { authAPI } from '@/api/auth'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import randaPlusLogo from '@/assets/logo.png'
import styles from './Auth.module.css'

const ResetPassword: React.FC = () => {
  const { t } = useTranslation()
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
      setErrors({ password: t('auth.validation.passwordMin8') })
      return false
    }
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: t('auth.validation.passwordMismatch') })
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
      setGeneralError(t('auth.resetPassword.errors.tokenMissing'))
      return
    }

    setLoading(true)
    try {
      await authAPI.resetPassword({
        token: token.trim(),
        newPassword: form.password
      })
      toast.success(t('auth.resetPassword.toastSuccess'))
      setCompleted(true)
    } catch (error: any) {
      const message = error.response?.data?.message || t('auth.resetPassword.errors.resetFailed')
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

        <h2 className={styles.title}>{t('auth.resetPassword.title')}</h2>
        <p className={styles.subtitle}>{t('auth.resetPassword.subtitle')}</p>

        {generalError && <div className={styles['error-box']}>{generalError}</div>}

        {completed ? (
          <div className={styles.form}>
            <div className={styles['success-box']}>
              <strong>{t('auth.resetPassword.completed.title')}</strong>
              <p>{t('auth.resetPassword.completed.message')}</p>
            </div>

            <Button type="button" variant="primary" fullWidth onClick={goToLogin}>
              {t('auth.resetPassword.completed.goToLogin')}
            </Button>

            <button type="button" className={styles['ghost-button']} onClick={() => navigate('/') }>
              {t('auth.register.backToHome')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              type="password"
              name="password"
              placeholder={t('auth.resetPassword.form.passwordPlaceholder')}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              autoComplete="new-password"
              helperText={t('auth.register.passwordHelper')}
              togglePasswordVisibility
            />

            <Input
              type="password"
              name="confirmPassword"
              placeholder={t('auth.resetPassword.form.confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              togglePasswordVisibility
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              {t('auth.resetPassword.actions.update')}
            </Button>

            <p className={styles['helper-note']}>
              {t('auth.resetPassword.helper.notRequested')}{' '}
              <Link to="/login" className={styles.link}>
                {t('auth.resetPassword.helper.returnToSignIn')}
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
