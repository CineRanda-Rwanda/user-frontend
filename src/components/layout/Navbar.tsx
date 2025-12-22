import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationsContext'
import {
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
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

  return (
    <nav className={styles.navbar}>
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      <Link to="/" className={styles.logo} aria-label="Randa Plus home">
        <img src={randaPlusLogo} alt="Randa Plus" className={styles.logoImage} />
      </Link>

      <div className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/movies"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Movies
        </NavLink>
        <NavLink
          to="/series"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Series
        </NavLink>
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
              className={styles.mobileMenuButton}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.mobileNavLinks}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/movies" onClick={() => setIsMobileMenuOpen(false)}>
              Movies
            </Link>
            <Link to="/series" onClick={() => setIsMobileMenuOpen(false)}>
              Series
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/notifications" onClick={() => setIsMobileMenuOpen(false)}>
                  Notifications
                </Link>
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
  )
}

export default Navbar
