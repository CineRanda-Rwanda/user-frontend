import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  FiBell,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiDollarSign,
  FiBookOpen,
  FiChevronRight
} from 'react-icons/fi'
import { getInitials, formatCurrency } from '@/utils/formatters'
import { getWalletBalance } from '@/api/wallet'
import GlobalSearchBar from '@/components/search/GlobalSearchBar'
import styles from './Navbar.module.css'

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [walletBalance, setWalletBalance] = useState<{ balance: number; bonusBalance?: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    if (isAuthenticated) {
      loadWalletBalance()
    }
  }, [isAuthenticated])

  const loadWalletBalance = async () => {
    try {
      const balance = await getWalletBalance()
      setWalletBalance(balance)
    } catch (error) {
      console.error('Failed to load wallet balance:', error)
    }
  }

  const handleLogout = () => {
    logout()
    setIsProfileOpen(false)
  }

  const handleProfileNavigation = (path: string) => {
    navigate(path)
    setIsProfileOpen(false)
    setIsMobileMenuOpen(false)
  }

  const purchasedCount = user?.purchasedContent?.length || 0

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>🎬</span>
        <span className={styles.logoText}>Cineranda</span>
      </Link>

      {/* Desktop Navigation */}
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

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <GlobalSearchBar
          variant="compact"
          className={styles.navbarSearch}
          showHeading={false}
          showFilters={false}
        />
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {isAuthenticated ? (
          <>
            {walletBalance && (
              <button
                className={styles.walletButton}
                onClick={() => navigate('/wallet')}
                title="Wallet"
              >
                <FiDollarSign />
                <span className={styles.walletBalance}>
                  {formatCurrency(walletBalance.balance)}
                </span>
              </button>
            )}

            <button className={styles.actionButton}>
              <FiBell />
              <span className={styles.badge}>3</span>
            </button>

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.avatar}>{getInitials(user?.username)}</div>
              </button>

              {isProfileOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div>
                      <div className={styles.dropdownName}>{user?.username}</div>
                      <div className={styles.dropdownEmail}>{user?.email || 'No email added'}</div>
                    </div>
                    <div className={styles.dropdownMeta}>
                      <span>{user?.location === 'international' ? 'International' : 'Rwanda'} member</span>
                      {user?.createdAt && (
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.dropdownStats}>
                    <div className={styles.dropdownStat}>
                      <p>Library</p>
                      <strong>{purchasedCount}</strong>
                    </div>
                    <div className={styles.dropdownStat}>
                      <p>Wallet</p>
                      <strong>{walletBalance ? formatCurrency(walletBalance.balance) : '—'}</strong>
                    </div>
                  </div>
                  <div className={styles.dropdownSection}>
                    <p className={styles.dropdownLabel}>Library & Profile</p>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => handleProfileNavigation('/my-library')}
                    >
                      <FiBookOpen />
                      <div className={styles.dropdownItemText}>
                        <span>My Library</span>
                        <small>Continue watching & purchases</small>
                      </div>
                      <FiChevronRight className={styles.dropdownCaret} />
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => handleProfileNavigation('/profile')}
                    >
                      <FiUser />
                      <div className={styles.dropdownItemText}>
                        <span>Profile Overview</span>
                        <small>Identity & account info</small>
                      </div>
                      <FiChevronRight className={styles.dropdownCaret} />
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => handleProfileNavigation('/profile#settings')}
                    >
                      <FiSettings />
                      <div className={styles.dropdownItemText}>
                        <span>Account Settings</span>
                        <small>Preferences & security</small>
                      </div>
                      <FiChevronRight className={styles.dropdownCaret} />
                    </button>
                  </div>
                  <div className={styles.dropdownSection}>
                    <p className={styles.dropdownLabel}>Billing & Session</p>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => handleProfileNavigation('/wallet')}
                    >
                      <FiDollarSign />
                      <div className={styles.dropdownItemText}>
                        <span>Wallet Dashboard</span>
                        <small>Top up & transactions</small>
                      </div>
                      <FiChevronRight className={styles.dropdownCaret} />
                    </button>
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={handleLogout}
                    >
                      <FiLogOut />
                      <div className={styles.dropdownItemText}>
                        <span>Logout</span>
                        <small>Return to guest view</small>
                      </div>
                    </button>
                  </div>
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

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavHeader}>
            <Link to="/" className={styles.logo} onClick={() => setIsMobileMenuOpen(false)}>
              <span className={styles.logoIcon}>🎬</span>
              <span className={styles.logoText}>Cineranda</span>
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
