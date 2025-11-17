import React from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'
import styles from './Footer.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Cineranda</h3>
          <p style={{ color: 'var(--text-gray)', marginTop: 'var(--spacing-sm)' }}>
            Your premier destination for streaming movies and TV series in Rwanda.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://facebook.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              <FiFacebook />
            </a>
            <a href="https://twitter.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              <FiTwitter />
            </a>
            <a href="https://instagram.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              <FiInstagram />
            </a>
            <a href="https://youtube.com" className={styles.socialLink} target="_blank" rel="noopener noreferrer">
              <FiYoutube />
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <div className={styles.footerLinks}>
            <Link to="/browse">Browse</Link>
            <Link to="/browse?type=Movie">Movies</Link>
            <Link to="/browse?type=Series">TV Series</Link>
            <Link to="/my-library">My Library</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Support</h3>
          <div className={styles.footerLinks}>
            <Link to="/help">Help Center</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>Account</h3>
          <div className={styles.footerLinks}>
            <Link to="/profile">My Profile</Link>
            <Link to="/my-library">My Library</Link>
            <Link to="/profile">Settings</Link>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Cineranda. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
