import React, { useCallback, useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import { useTranslation } from 'react-i18next'
import {
  FiBell,
  FiMenu,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiBookOpen
} from 'react-icons/fi'
import { getInitials } from '@/utils/formatters'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import NotificationOverlay from '@/components/notifications/NotificationOverlay'
import randaPlusLogo from '@/assets/logo.png'
import { contentAPI } from '@/api/content'
import { supportedLanguages, type SupportedLanguage } from '@/i18n'
import styles from './Navbar.module.css'

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount, markUnreadAsReadOnExit } = useNotifications()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [hasMovies, setHasMovies] = useState(true)
  const [hasSeries, setHasSeries] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const closeNotifications = useCallback(() => {
    setIsNotificationsOpen(false)
    void markUnreadAsReadOnExit().catch(() => undefined)
  }, [markUnreadAsReadOnExit])

  useEffect(() => {
    let isCancelled = false

    const readContentCount = (raw: any) => {
      const list = raw?.data?.data?.content || raw?.data?.content || []
      return Array.isArray(list) ? list.length : 0
    }

    const loadAvailability = async () => {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          contentAPI.getContentByType('Movie', 1, 1),
          contentAPI.getContentByType('Series', 1, 1),
        ])

        if (isCancelled) return
        setHasMovies(readContentCount(moviesRes) > 0)
        setHasSeries(readContentCount(seriesRes) > 0)
      } catch {
        // If the check fails (network/backend down), keep links visible.
      }
    }

    loadAvailability()
    return () => {
      isCancelled = true
    }
  }, [])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isNotificationsOpen) return
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        closeNotifications()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!isNotificationsOpen) return
      closeNotifications()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [closeNotifications, isNotificationsOpen])

  

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const handleProfileNavigation = (path: string) => {
    navigate(path)
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || 'en') as SupportedLanguage
  const changeLanguage = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng)
  }

  const primaryLinks = [
    { path: '/', label: t('nav.home') },
    ...(hasMovies ? [{ path: '/movies', label: t('nav.movies') }] : []),
    ...(hasSeries ? [{ path: '/series', label: t('nav.series') }] : []),
    { path: '/my-library', label: t('nav.myLibrary') }
  ]

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className={styles.menuBackdrop}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav className={styles.navbar}>
      <button
        className={`${styles.mobileMenuButton} ${
          isMobileMenuOpen ? styles.menuButtonActive : ''
        }`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={t('nav.toggleNavigation')}
        aria-expanded={isMobileMenuOpen}
        aria-pressed={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <FiX />
        ) : (
          <FiMenu />
        )}
      </button>

      <Link to="/" className={styles.logo} aria-label={t('nav.logoAria')}>
        <img src={randaPlusLogo} alt="Randa Plus" className={styles.logoImage} />
      </Link>

      <div className={styles.nav}>
        {primaryLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className={styles.searchContainer}>
        <GlobalSearchBar
          variant="compact"
          className={styles.navbarSearch}
          showHeading={false}
          showFilters={false}
          placeholder={t('nav.searchPlaceholder')}
          showSubmitButton={false}
          lockCompactLayout
        />
      </div>

      <div className={styles.actions}>
        <select
          className={styles.languageSelect}
          aria-label={t('language.label')}
          value={supportedLanguages.includes(currentLanguage) ? currentLanguage : 'en'}
          onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
        >
          <option value="en">{t('language.english')}</option>
          <option value="rw">{t('language.kinyarwanda')}</option>
          <option value="fr">{t('language.french')}</option>
        </select>

        {isAuthenticated ? (
          <>
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  setIsNotificationsOpen((prev) => {
                    if (prev) {
                      closeNotifications()
                      return false
                    }
                    return true
                  })
                  setIsProfileOpen(false)
                }}
                title={t('nav.notifications')}
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationOverlay
                  onClose={closeNotifications}
                />
              )}
            </div>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.avatar}>{getInitials(user?.username)}</div>
              </button>

              {isProfileOpen && (
                <div className={`${styles.dropdown} ${styles.simpleDropdown}`}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile')}
                  >
                    <FiUser />
                    <span>{t('nav.profile.myProfile')}</span>
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/my-library')}
                  >
                    <FiBookOpen />
                    <span>{t('nav.profile.myLibrary')}</span>
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile#settings')}
                  >
                    <FiSettings />
                    <span>{t('nav.profile.settings')}</span>
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    <span>{t('nav.profile.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.authButtons}>
            <button className={styles.loginButton} onClick={() => navigate('/login')}>
              {t('nav.auth.login')}
            </button>
            <button className={styles.signupButton} onClick={() => navigate('/register')}>
              {t('nav.auth.signUp')}
            </button>
          </div>
        )}

      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavLinks}>
            {primaryLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/help"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                isActive ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink
              }
            >
              {t('nav.help')}
            </NavLink>
            {isAuthenticated ? (
              null
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink
                  }
                >
                  {t('nav.auth.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}` : styles.mobileNavLink
                  }
                >
                  {t('nav.auth.signUp')}
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
      </nav>
    </>
  )
}

export default Navbar
