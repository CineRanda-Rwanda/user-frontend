import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import {
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiX,
  FiBookOpen
} from 'react-icons/fi'
import { getInitials } from '@/utils/formatters'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import NotificationOverlay from '@/components/notifications/NotificationOverlay'
import randaPlusLogo from '@/assets/randa-plus-logo.svg'
import styles from './Navbar.module.css'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

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
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const handleProfileNavigation = (path: string) => {
    navigate(path)
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const primaryLinks = [
    { path: '/', label: 'Home' },
    { path: '/movies', label: 'Movies' },
    { path: '/series', label: 'Series' },
    { path: '/my-library', label: 'My Library' }
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
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
        aria-pressed={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <FiX />
        ) : (
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
      </button>

      <Link to="/" className={styles.logo} aria-label="Randa Plus home">
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
          placeholder="Search catalog"
        />
      </div>

      <div className={styles.actions}>
        {isAuthenticated ? (
          <>
            <div className={styles.notificationWrapper} ref={notificationRef}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev)
                  setIsProfileOpen(false)
                }}
                title="Notifications"
              >
                <FiBell />
                {unreadCount > 0 && (
                  <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationOverlay
                  onViewAll={() => {
                    setIsNotificationsOpen(false)
                    navigate('/notifications')
                  }}
                  onClose={() => setIsNotificationsOpen(false)}
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
                    <span>My Profile</span>
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/my-library')}
                  >
                    <FiBookOpen />
                    <span>My Library</span>
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile#settings')}
                  >
                    <FiSettings />
                    <span>Settings</span>
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                    onClick={handleLogout}
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.authButtons}>
            <button className={styles.loginButton} onClick={() => navigate('/login')}>
              Login
            </button>
            <button className={styles.signupButton} onClick={() => navigate('/register')}>
              Sign Up
            </button>
          </div>
        )}

      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavHeader}>
            <Link
              to="/"
              className={styles.logo}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Randa Plus home"
            >
              <img src={randaPlusLogo} alt="Randa Plus" className={styles.logoImage} />
            </Link>
            <button
              className={`${styles.mobileMenuButton} ${styles.menuButtonActive}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.mobileNavLinks}>
            {primaryLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      </nav>
      <div className={styles.mobileSearchBar}>
        <GlobalSearchBar
          variant="compact"
          className={styles.navbarSearch}
          showHeading={false}
          showFilters={false}
          placeholder="Search catalog"
          showSubmitButton={false}
        />
      </div>
    </>
  )
}

export default Navbar
