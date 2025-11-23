import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiDollarSign } from 'react-icons/fi'
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

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>🎬</span>
        <span className={styles.logoText}>Cineranda</span>
      </Link>

      {/* Desktop Navigation */}
      <div className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
        <NavLink to="/movies" className={({ isActive }) => isActive ? styles.active : ''}>Movies</NavLink>
        <NavLink to="/series" className={({ isActive }) => isActive ? styles.active : ''}>Series</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/my-library" className={({ isActive }) => isActive ? styles.active : ''}>My Library</NavLink>
            <NavLink to="/wallet" className={({ isActive }) => isActive ? styles.active : ''}>Wallet</NavLink>
          </>
        )}
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
            {/* Wallet Balance */}
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

            {/* Notifications */}
            <button className={styles.actionButton}>
              <FiBell />
              <span className={styles.badge}>3</span>
            </button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className={styles.avatar}>
                  {getInitials(user?.username)}
                </div>
              </button>

              {isProfileOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user?.username}</div>
                    <div className={styles.dropdownEmail}>{user?.email}</div>
                  </div>
                  <div className={styles.dropdownMenu}>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        navigate('/profile')
                        setIsProfileOpen(false)
                      }}
                    >
                      <FiUser />
                      <span>Profile</span>
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        navigate('/profile')
                        setIsProfileOpen(false)
                      }}
                    >
                      <FiSettings />
                      <span>Settings</span>
                    </button>
                    <button className={styles.dropdownItem} onClick={handleLogout}>
                      <FiLogOut />
                      <span>Logout</span>
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
                <Link to="/my-library" onClick={() => setIsMobileMenuOpen(false)}>
                  My Library
                </Link>
                <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)}>
                  Wallet
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
