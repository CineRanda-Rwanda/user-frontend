import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import { Trans, useTranslation } from 'react-i18next'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

const FAQ: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)

  const faqGroups: Array<{ title: string; description: string; items: Array<{ q: string; a: React.ReactNode }> }> = [
    {
      title: t('support.faq.groups.account.title'),
      description: t('support.faq.groups.account.description'),
      items: [
        {
          q: t('support.faq.groups.account.items.methods.q'),
          a: t('support.faq.groups.account.items.methods.a')
        },
        {
          q: t('support.faq.groups.account.items.googlePassword.q'),
          a: t('support.faq.groups.account.items.googlePassword.a')
        },
        {
          q: t('support.faq.groups.account.items.forgot.q'),
          a: (
            <Trans
              i18nKey="support.faq.groups.account.items.forgot.a"
              components={[<Link key="contact" to="/contact" />]}
            />
          )
        }
      ]
    },
    {
      title: t('support.faq.groups.playback.title'),
      description: t('support.faq.groups.playback.description'),
      items: [
        {
          q: t('support.faq.groups.playback.items.buffering.q'),
          a: t('support.faq.groups.playback.items.buffering.a')
        },
        {
          q: t('support.faq.groups.playback.items.audio.q'),
          a: t('support.faq.groups.playback.items.audio.a')
        },
        {
          q: t('support.faq.groups.playback.items.downloads.q'),
          a: t('support.faq.groups.playback.items.downloads.a')
        }
      ]
    },
    {
      title: t('support.faq.groups.billing.title'),
      description: t('support.faq.groups.billing.description'),
      items: [
        {
          q: t('support.faq.groups.billing.items.paymentMethods.q'),
          a: t('support.faq.groups.billing.items.paymentMethods.a')
        },
        {
          q: t('support.faq.groups.billing.items.notUnlocked.q'),
          a: (
            <Trans
              i18nKey="support.faq.groups.billing.items.notUnlocked.a"
              components={[<Link key="contact" to="/contact" />]}
            />
          )
        },
        {
          q: t('support.faq.groups.billing.items.refunds.q'),
          a: (
            <Trans
              i18nKey="support.faq.groups.billing.items.refunds.a"
              components={[<Link key="terms" to="/terms" />]}
            />
          )
        }
      ]
    }
  ]

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
            <Link to="/contact" className={styles.inlineNavLink}>
              {t('support.common.contact')} <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>{t('support.faq.hero.label')}</p>
        <h1>{t('support.faq.hero.title')}</h1>
        <p>{t('support.faq.hero.subtitle')}</p>

        <div className={styles.heroActions}>
          <Button variant="outline" onClick={() => navigate('/help')}>
            {t('support.faq.hero.actions.visitHelpCenter')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            {t('support.faq.hero.actions.contactSupport')}
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>{t('support.faq.section.eyebrow')}</span>
          <h2>{t('support.faq.section.title')}</h2>
          <p>{t('support.faq.section.subtitle')}</p>
        </div>

        <div className={styles.faqGrid}>
          {faqGroups.map((group) => (
            <article key={group.title} className={styles.faqCard}>
              <h3 className={styles.faqTitle}>{group.title}</h3>
              <p className={styles.faqDescription}>{group.description}</p>
              <div className={styles.faqList}>
                {group.items.map((item) => (
                  <details key={item.q} className={styles.faqItem}>
                    <summary className={styles.faqSummary}>{item.q}</summary>
                    <div className={styles.faqAnswer}>{item.a}</div>
                  </details>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.callout} aria-label="Still need help">
        <h2>{t('support.faq.callout.title')}</h2>
        <p>{t('support.faq.callout.body')}</p>
        <div className={styles.calloutActions}>
          <Button variant="secondary" onClick={() => navigate('/help')}>
            {t('support.faq.callout.actions.helpCenter')}
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            {t('support.faq.callout.actions.contactSupport')}
          </Button>
        </div>
      </section>
    </div>
  )
}

export default FAQ
