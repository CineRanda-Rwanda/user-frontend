import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiCalendar, FiMail, FiPhone, FiShield, FiUser, FiX } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../api/auth'
import styles from './Profile.module.css'

const Profile: React.FC = () => {
  const { user, loading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' })
  const [pinError, setPinError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (loading || !user) {
    return (
      <div className={styles.loadingShell}>
        <Loader fullScreen text="Loading profile" />
      </div>
    )
  }

  const initials = user.username?.slice(0, 2).toUpperCase() || 'ME'
  const displayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || 'Member'
  const planLabel = user.location === 'international' ? 'Global plan' : 'Rwanda plan'

  const infoRows = useMemo(
    () => [
      { label: 'Username', value: user.username || '--', icon: FiUser },
      { label: 'Email', value: user.email || 'Not linked', icon: FiMail },
      { label: 'Phone', value: user.phoneNumber || 'Not added', icon: FiPhone },
      { label: 'Plan', value: planLabel, icon: FiShield },
      { label: 'Joined', value: formatDate(user.createdAt), icon: FiCalendar }
    ],
    [planLabel, user]
  )

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/browse')
    }
  }

  const handlePinSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPinError(null)

    if (!pinForm.oldPin || pinForm.oldPin.length < 4) {
      setPinError('Enter your current 4-digit PIN')
      return
    }

    if (!pinForm.newPin || pinForm.newPin.length < 4) {
      setPinError('Choose a new PIN with at least 4 digits')
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinError('PIN confirmation does not match')
      return
    }

    try {
      setIsSubmitting(true)
      await authAPI.changePin(pinForm.oldPin, pinForm.newPin)
      toast.success('PIN updated successfully')
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' })
      refreshUser()
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Unable to update PIN right now'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <section className={styles.panel}>
        <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Close profile overlay">
          <FiX size={18} />
        </button>

        <header className={styles.header}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p className={styles.overline}>{planLabel}</p>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>@{user.username || 'member'}</p>
          </div>
        </header>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Profile info</h2>
          <div className={styles.infoList}>
            {infoRows.map(({ label, value, icon: Icon }) => (
              <div className={styles.infoRow} key={label}>
                <Icon size={16} />
                <div>
                  <p className={styles.infoLabel}>{label}</p>
                  <p className={styles.infoValue}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.card} ${styles.pinCard}`}>
          <div className={styles.pinHeader}>
            <div>
              <h2 className={styles.cardTitle}>Change PIN</h2>
              <p className={styles.cardSubtitle}>Secure instant-checkout purchases with your streaming PIN.</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={handlePinSubmit}>
            <label className={styles.field}>
              <span>Current PIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={6}
                value={pinForm.oldPin}
                onChange={(event) => setPinForm({ ...pinForm, oldPin: event.target.value })}
              />
            </label>
            <label className={styles.field}>
              <span>New PIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                value={pinForm.newPin}
                onChange={(event) => setPinForm({ ...pinForm, newPin: event.target.value })}
              />
            </label>
            <label className={styles.field}>
              <span>Confirm PIN</span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                maxLength={6}
                value={pinForm.confirmPin}
                onChange={(event) => setPinForm({ ...pinForm, confirmPin: event.target.value })}
              />
            </label>
            {pinError && <p className={styles.errorText}>{pinError}</p>}
            <button type="submit" className={styles.primaryAction} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save new PIN'}
            </button>
          </form>
        </section>
      </section>
    </div>
  )
}

const formatDate = (input?: string) => {
  if (!input) return 'Not yet set'
  try {
    return new Date(input).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Not yet set'
  }
}

export default Profile
