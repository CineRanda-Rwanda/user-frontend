import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCalendar, FiMail, FiPhone, FiShield, FiUser, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import Loader from '../components/common/Loader'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../api/auth'
import styles from './Profile.module.css'

const Profile: React.FC = () => {
  const { t } = useTranslation()
  const { user, loading, refreshUser } = useAuth()
  const navigate = useNavigate()

  const panelRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const dialogTitleId = useId()
  const pinErrorId = useId()
  const passwordErrorId = useId()

  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' })
  const [pinError, setPinError] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading || !user) {
    return (
      <div className={styles.loadingShell}>
        <Loader fullScreen text={t('profilePage.loading')} />
      </div>
    )
  }

  const initials = user.username?.slice(0, 2).toUpperCase() || 'ME'
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || t('profilePage.fallbacks.member')
  const planLabel =
    user.location === 'international' ? t('profilePage.plan.global') : t('profilePage.plan.rwanda')
  const canChangePin = user.authProvider === 'phone' || (!user.authProvider && !user.email && Boolean(user.phoneNumber))
  const canChangePassword = user.authProvider === 'email'

  const infoRows = useMemo(
    () => [
      { label: t('profilePage.info.username'), value: user.username || t('profilePage.fallbacks.emptyValue'), icon: FiUser },
      { label: t('profilePage.info.email'), value: user.email || t('profilePage.fallbacks.notLinked'), icon: FiMail },
      { label: t('profilePage.info.phone'), value: user.phoneNumber || t('profilePage.fallbacks.notAdded'), icon: FiPhone },
      { label: t('profilePage.info.plan'), value: planLabel, icon: FiShield },
      { label: t('profilePage.info.joined'), value: formatDate(user.createdAt, t('profilePage.fallbacks.notSet')), icon: FiCalendar }
    ],
    [planLabel, t, user]
  )

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/browse')
    }
  }

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusInitial = window.setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab') return
      const container = panelRef.current
      if (!container) return

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((node) => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true')

      if (focusables.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusInitial)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [navigate])

  const handlePinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPinError(null)

    if (!canChangePin) {
      toast.error(t('profilePage.pin.errors.unavailable'))
      return
    }

    if (!pinForm.oldPin || pinForm.oldPin.length < 4) {
      setPinError(t('profilePage.pin.validation.currentRequired'))
      return
    }

    if (!pinForm.newPin || pinForm.newPin.length < 4) {
      setPinError(t('profilePage.pin.validation.newMin'))
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError(t('profilePage.pin.validation.mismatch'))
      return
    }

    try {
      setIsSubmitting(true)
      await authAPI.changePin(pinForm.oldPin, pinForm.newPin)
      toast.success(t('profilePage.pin.toasts.updated'))
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' })
      refreshUser()
    } catch (error: any) {
      const message = error?.response?.data?.message || t('profilePage.pin.errors.updateFailed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordError(null)

    if (!canChangePassword) {
      toast.info(t('profilePage.password.errors.managedByProvider'))
      return
    }

    if (!passwordForm.currentPassword || passwordForm.currentPassword.length < 6) {
      setPasswordError(t('profilePage.password.validation.currentRequired'))
      return
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError(t('profilePage.password.validation.newMin'))
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('profilePage.password.validation.mismatch'))
      return
    }

    try {
      setIsSubmitting(true)
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      toast.success(t('profilePage.password.toasts.updated'))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      refreshUser()
    } catch (error: any) {
      const message = error?.response?.data?.message || t('profilePage.password.errors.updateFailed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label={t('profilePage.closeAria')}
          ref={closeButtonRef}
        >
          <span aria-hidden="true">
            <FiX size={18} />
          </span>
        </button>

        <header className={styles.header}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.overline}>{planLabel}</p>
            <h1 className={styles.title} id={dialogTitleId}>
              {displayName}
            </h1>
            <p className={styles.subtitle}>@{user.username || t('profilePage.fallbacks.username')}</p>
          </div>
        </header>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('profilePage.sections.profileInfo')}</h2>
          <div className={styles.infoList}>
            {infoRows.map(({ label, value, icon: Icon }) => (
              <div className={styles.infoRow} key={label}>
                <span aria-hidden="true">
                  <Icon size={16} />
                </span>
                <div>
                  <p className={styles.infoLabel}>{label}</p>
                  <p className={styles.infoValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {canChangePin && (
          <section className={`${styles.card} ${styles.pinCard}`}>
            <div className={styles.pinHeader}>
              <div>
                <h2 className={styles.cardTitle}>{t('profilePage.sections.changePin.title')}</h2>
                <p className={styles.cardSubtitle}>{t('profilePage.sections.changePin.subtitle')}</p>
              </div>
            </div>
            <form className={styles.form} onSubmit={handlePinSubmit}>
              <label className={styles.field}>
                <span>{t('profilePage.pin.fields.current')}</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  value={pinForm.oldPin}
                  onChange={(event) => setPinForm({ ...pinForm, oldPin: event.target.value })}
                  aria-invalid={Boolean(pinError)}
                  aria-describedby={pinError ? pinErrorId : undefined}
                />
              </label>
              <label className={styles.field}>
                <span>{t('profilePage.pin.fields.new')}</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={pinForm.newPin}
                  onChange={(event) => setPinForm({ ...pinForm, newPin: event.target.value })}
                  aria-invalid={Boolean(pinError)}
                  aria-describedby={pinError ? pinErrorId : undefined}
                />
              </label>
              <label className={styles.field}>
                <span>{t('profilePage.pin.fields.confirm')}</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={pinForm.confirmPin}
                  onChange={(event) => setPinForm({ ...pinForm, confirmPin: event.target.value })}
                  aria-invalid={Boolean(pinError)}
                  aria-describedby={pinError ? pinErrorId : undefined}
                />
              </label>
              {pinError && (
                <p className={styles.errorText} id={pinErrorId} role="alert" aria-live="assertive">
                  {pinError}
                </p>
              )}
              <button type="submit" className={styles.primaryAction} disabled={isSubmitting}>
                {isSubmitting ? t('common.updating') : t('profilePage.pin.actions.save')}
              </button>
            </form>
          </section>
        )}

        {canChangePassword && (
          <section className={`${styles.card} ${styles.pinCard}`}>
            <div className={styles.pinHeader}>
              <div>
                <h2 className={styles.cardTitle}>{t('profilePage.sections.changePassword.title')}</h2>
                <p className={styles.cardSubtitle}>{t('profilePage.sections.changePassword.subtitle')}</p>
              </div>
            </div>
            <form className={styles.form} onSubmit={handlePasswordSubmit}>
              <label className={styles.field}>
                <span>{t('profilePage.password.fields.current')}</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
                  }
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? passwordErrorId : undefined}
                />
              </label>
              <label className={styles.field}>
                <span>{t('profilePage.password.fields.new')}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? passwordErrorId : undefined}
                />
              </label>
              <label className={styles.field}>
                <span>{t('profilePage.password.fields.confirm')}</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
                  }
                  aria-invalid={Boolean(passwordError)}
                  aria-describedby={passwordError ? passwordErrorId : undefined}
                />
              </label>
              {passwordError && (
                <p className={styles.errorText} id={passwordErrorId} role="alert" aria-live="assertive">
                  {passwordError}
                </p>
              )}
              <button type="submit" className={styles.primaryAction} disabled={isSubmitting}>
                {isSubmitting ? t('common.updating') : t('profilePage.password.actions.save')}
              </button>
            </form>
          </section>
        )}
      </section>
    </div>
  )
}

const formatDate = (input?: string, fallback = 'Not yet set') => {
  if (!input) return fallback
  try {
    return new Date(input).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return fallback
  }
}

export default Profile
