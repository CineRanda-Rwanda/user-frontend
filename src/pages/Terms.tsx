import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import { Trans, useTranslation } from 'react-i18next'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

const LAST_UPDATED = 'December 26, 2025'

const Terms: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopRow}>
          <button type="button" className={styles.backButton} onClick={handleBack}>
            {t('support.common.back')}
          </button>
          <nav className={styles.inlineNav} aria-label="Support links">
            <Link to="/" className={styles.inlineNavLink}>
              {t('support.common.home')} <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/help" className={styles.inlineNavLink}>
              {t('support.common.helpCenter')} <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/faq" className={styles.inlineNavLink}>
              {t('support.common.faq')} <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/contact" className={styles.inlineNavLink}>
              {t('support.common.contact')} <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>{t('support.terms.hero.label')}</p>
        <h1>{t('support.terms.hero.title')}</h1>
        <p>{t('support.terms.hero.subtitle', { date: LAST_UPDATED })}</p>

        <div className={styles.heroActions}>
          <Button
            variant="outline"
            onClick={() => {
              const el = document.getElementById('terms')
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            {t('support.terms.hero.actions.readTerms')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            {t('support.terms.hero.actions.contactLegal')}
          </Button>
        </div>
      </header>

      <div className={styles.twoColumn}>
        <aside className={styles.sideNav} aria-label="Terms navigation">
          <div className={styles.sideNavCard}>
            <p className={styles.sideNavTitle}>{t('support.common.onThisPage')}</p>
            <a className={styles.sideNavLink} href="#terms">
              {t('support.terms.nav.overview')}
            </a>
            <a className={styles.sideNavLink} href="#accounts">
              {t('support.terms.nav.accounts')}
            </a>
            <a className={styles.sideNavLink} href="#payments">
              {t('support.terms.nav.payments')}
            </a>
            <a className={styles.sideNavLink} href="#content">
              {t('support.terms.nav.content')}
            </a>
            <a className={styles.sideNavLink} href="#acceptable-use">
              {t('support.terms.nav.acceptableUse')}
            </a>
            <a className={styles.sideNavLink} href="#disclaimers">
              {t('support.terms.nav.disclaimers')}
            </a>
            <a className={styles.sideNavLink} href="#changes">
              {t('support.terms.nav.changes')}
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section id="terms" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.overview.eyebrow')}</span>
              <h2>{t('support.terms.sections.overview.title')}</h2>
              <p>{t('support.terms.sections.overview.subtitle')}</p>
            </div>
            <div className={styles.richText}>
              <p>{t('support.terms.sections.overview.body')}</p>
            </div>
          </section>

          <section id="accounts" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.accounts.eyebrow')}</span>
              <h2>{t('support.terms.sections.accounts.title')}</h2>
              <p>{t('support.terms.sections.accounts.subtitle')}</p>
            </div>
            <ul className={styles.bulletList}>
              <li>{t('support.terms.sections.accounts.bullets.1')}</li>
              <li>{t('support.terms.sections.accounts.bullets.2')}</li>
              <li>{t('support.terms.sections.accounts.bullets.3')}</li>
            </ul>
          </section>

          <section id="payments" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.payments.eyebrow')}</span>
              <h2>{t('support.terms.sections.payments.title')}</h2>
              <p>{t('support.terms.sections.payments.subtitle')}</p>
            </div>
            <div className={styles.richText}>
              <p>{t('support.terms.sections.payments.body1')}</p>
              <p>
                <Trans
                  i18nKey="support.terms.sections.payments.body2"
                  components={[<Link key="contact" to="/contact" />]}
                />
              </p>
            </div>
          </section>

          <section id="content" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.content.eyebrow')}</span>
              <h2>{t('support.terms.sections.content.title')}</h2>
              <p>{t('support.terms.sections.content.subtitle')}</p>
            </div>
            <ul className={styles.bulletList}>
              <li>{t('support.terms.sections.content.bullets.1')}</li>
              <li>{t('support.terms.sections.content.bullets.2')}</li>
              <li>{t('support.terms.sections.content.bullets.3')}</li>
            </ul>
          </section>

          <section id="acceptable-use" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.acceptableUse.eyebrow')}</span>
              <h2>{t('support.terms.sections.acceptableUse.title')}</h2>
              <p>{t('support.terms.sections.acceptableUse.subtitle')}</p>
            </div>
            <ul className={styles.bulletList}>
              <li>{t('support.terms.sections.acceptableUse.bullets.1')}</li>
              <li>{t('support.terms.sections.acceptableUse.bullets.2')}</li>
              <li>{t('support.terms.sections.acceptableUse.bullets.3')}</li>
            </ul>
          </section>

          <section id="disclaimers" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.disclaimers.eyebrow')}</span>
              <h2>{t('support.terms.sections.disclaimers.title')}</h2>
              <p>{t('support.terms.sections.disclaimers.subtitle')}</p>
            </div>
            <div className={styles.richText}>
              <p>{t('support.terms.sections.disclaimers.body')}</p>
            </div>
          </section>

          <section id="changes" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.terms.sections.changes.eyebrow')}</span>
              <h2>{t('support.terms.sections.changes.title')}</h2>
              <p>{t('support.terms.sections.changes.subtitle')}</p>
            </div>
            <div className={styles.richText}>
              <p>{t('support.terms.sections.changes.body1')}</p>
              <p>
                <Trans i18nKey="support.terms.sections.changes.body2" components={[<Link key="contact" to="/contact" />]} />
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Terms
