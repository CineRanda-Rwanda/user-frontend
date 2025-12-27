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
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [hasMovies, setHasMovies] = useState(true)
  const [hasSeries, setHasSeries] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLanguageOpen) return
    const firstItem = languageRef.current?.querySelector<HTMLButtonElement>('[role="menu"] button')
    window.setTimeout(() => firstItem?.focus(), 0)
  }, [isLanguageOpen])

  useEffect(() => {
    if (!isProfileOpen) return
    const firstItem = dropdownRef.current?.querySelector<HTMLButtonElement>('[role="menu"] button')
    window.setTimeout(() => firstItem?.focus(), 0)
  }, [isProfileOpen])

  useEffect(() => {
    if (!isNotificationsOpen) return
    const panel = notificationRef.current?.querySelector<HTMLElement>('[data-notification-overlay]')
    window.setTimeout(() => panel?.focus(), 0)
  }, [isNotificationsOpen])

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isLanguageOpen) return
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!isLanguageOpen) return
      setIsLanguageOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isLanguageOpen])

  

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const handleProfileNavigation = (path: string) => {
    navigate(path)
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const currentLanguage = (i18n.language || 'en') as SupportedLanguage
  const changeLanguage = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng)
  }

  const selectedLanguage = supportedLanguages.includes(currentLanguage) ? currentLanguage : 'en'

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
        <div style={{ position: 'relative' }} ref={languageRef}>
          <button
            type="button"
            className={styles.languageSelect}
            aria-label={t('language.label')}
            aria-haspopup="menu"
            aria-expanded={isLanguageOpen}
            aria-controls="language-menu"
            onClick={() => {
              setIsLanguageOpen((prev) => !prev)
              setIsProfileOpen(false)
              setIsNotificationsOpen(false)
            }}
          >
            {selectedLanguage}
          </button>

          {isLanguageOpen && (
            <div
              id="language-menu"
              className={`${styles.dropdown} ${styles.simpleDropdown}`}
              role="menu"
              aria-label={t('language.label')}
            >
              <button
                type="button"
                role="menuitem"
                className={styles.dropdownItem}
                onClick={() => {
                  changeLanguage('en')
                  setIsLanguageOpen(false)
                }}
              >
                <span>{t('language.english')}</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.dropdownItem}
                onClick={() => {
                  changeLanguage('rw')
                  setIsLanguageOpen(false)
                }}
              >
                <span>{t('language.kinyarwanda')}</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className={styles.dropdownItem}
                onClick={() => {
                  changeLanguage('fr')
                  setIsLanguageOpen(false)
                }}
              >
                <span>{t('language.french')}</span>
              </button>
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <>
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                type="button"
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
                aria-label={t('nav.notifications')}
                aria-haspopup="dialog"
                aria-expanded={isNotificationsOpen}
                aria-controls="notifications-panel"
              >
                <FiBell aria-hidden="true" />
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
                type="button"
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label={t('nav.profile.openMenuAria')}
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                aria-controls="profile-menu"
              >
                <div className={styles.avatar}>{getInitials(user?.username)}</div>
              </button>

              {isProfileOpen && (
                <div
                  id="profile-menu"
                  className={`${styles.dropdown} ${styles.simpleDropdown}`}
                  role="menu"
                  aria-label={t('nav.profile.menuLabel')}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile')}
                  >
                    <FiUser aria-hidden="true" />
                    <span>{t('nav.profile.myProfile')}</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/my-library')}
                  >
                    <FiBookOpen aria-hidden="true" />
                    <span>{t('nav.profile.myLibrary')}</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile#settings')}
                  >
                    <FiSettings aria-hidden="true" />
                    <span>{t('nav.profile.settings')}</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    <FiLogOut aria-hidden="true" />
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

            {!isAuthenticated && (
              <div className={styles.mobileAuthButtons}>
                <button
                  type="button"
                  className={styles.loginButton}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    navigate('/login')
                  }}
                >
                  {t('nav.auth.login')}
                </button>
                <button
                  type="button"
                  className={styles.signupButton}
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    navigate('/register')
                  }}
                >
                  {t('nav.auth.signUp')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </nav>
    </>
  )
}

export default Navbar
