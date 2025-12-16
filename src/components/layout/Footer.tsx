import React from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'
import styles from './Footer.module.css'

const socialLinks = [
  {
    label: 'Facebook',
    icon: <FiFacebook />,
    href: import.meta.env.VITE_SOCIAL_FACEBOOK_URL || 'https://facebook.com'
  },
  {
    label: 'Twitter',
    icon: <FiTwitter />,
    href: import.meta.env.VITE_SOCIAL_TWITTER_URL || 'https://twitter.com'
  },
  {
    label: 'Instagram',
    icon: <FiInstagram />,
    href: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL || 'https://instagram.com'
  },
  {
    label: 'YouTube',
    icon: <FiYoutube />,
    href: import.meta.env.VITE_SOCIAL_YOUTUBE_URL || 'https://youtube.com'
  }
].filter((link) => !!link.href)

const supportLinks = [
  { label: 'Help Center', to: '/help' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Terms of Service', to: '/terms' }
]

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>CinéRanda</h3>
          <p style={{ color: 'var(--text-gray)', marginTop: 'var(--spacing-sm)' }}>
            Your premier destination for streaming movies and TV series in Rwanda.
          </p>
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
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
            {supportLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
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
        <p>&copy; {new Date().getFullYear()} CinéRanda. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
