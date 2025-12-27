import React from 'react'
import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
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

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>{t('footer.aboutTitle')}</h3>
          <p style={{ color: 'var(--text-gray)', marginTop: 'var(--spacing-sm)' }}>
            {t('footer.aboutText')}
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
          <h3>{t('footer.quickLinks')}</h3>
          <div className={styles.footerLinks}>
            <Link to="/browse">{t('footer.links.browse')}</Link>
            <Link to="/browse?type=Movie">{t('footer.links.movies')}</Link>
            <Link to="/browse?type=Series">{t('footer.links.series')}</Link>
            <Link to="/my-library">{t('footer.links.myLibrary')}</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>{t('footer.support')}</h3>
          <div className={styles.footerLinks}>
            <Link to="/help">{t('footer.links.help')}</Link>
            <Link to="/faq">{t('footer.links.faq')}</Link>
            <Link to="/contact">{t('footer.links.contact')}</Link>
            <Link to="/terms">{t('footer.links.terms')}</Link>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3>{t('footer.account')}</h3>
          <div className={styles.footerLinks}>
            <Link to="/profile">{t('footer.links.profile')}</Link>
            <Link to="/my-library">{t('footer.links.myLibrary')}</Link>
            <Link to="/profile">{t('footer.links.settings')}</Link>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {t('footer.copyright', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}

export default Footer
