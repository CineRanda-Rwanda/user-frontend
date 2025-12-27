import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight, FiHelpCircle, FiLock, FiPlayCircle, FiShield, FiSmartphone } from 'react-icons/fi'
import { Trans, useTranslation } from 'react-i18next'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

const HelpCenter: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  const tutorialVideoUrl = (import.meta as any).env?.VITE_TUTORIAL_VIDEO_URL as string | undefined

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
            <Link to="/faq" className={styles.inlineNavLink}>
              {t('support.common.faq')} <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/contact" className={styles.inlineNavLink}>
              {t('support.common.contact')} <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/terms" className={styles.inlineNavLink}>
              {t('support.common.terms')} <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>{t('support.helpCenter.hero.label')}</p>
        <h1>{t('support.helpCenter.hero.title')}</h1>
        <p>{t('support.helpCenter.hero.subtitle')}</p>

        <div className={styles.heroActions}>
          <Button variant="primary" onClick={() => navigate('/faq')}>
            {t('support.helpCenter.hero.actions.browseFaq')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            {t('support.helpCenter.hero.actions.contactSupport')}
          </Button>
        </div>
      </header>

      <div className={styles.twoColumn}>
        <aside className={styles.sideNav} aria-label="Help Center navigation">
          <div className={styles.sideNavCard}>
            <p className={styles.sideNavTitle}>{t('support.common.onThisPage')}</p>
            <a className={styles.sideNavLink} href="#getting-started">
              {t('support.helpCenter.nav.gettingStarted')}
            </a>
            <a className={styles.sideNavLink} href="#account-security">
              {t('support.helpCenter.nav.accountSecurity')}
            </a>
            <a className={styles.sideNavLink} href="#billing">
              {t('support.helpCenter.nav.billing')}
            </a>
            <a className={styles.sideNavLink} href="#playback">
              {t('support.helpCenter.nav.playback')}
            </a>
            <a className={styles.sideNavLink} href="#devices">
              {t('support.helpCenter.nav.devices')}
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section id="getting-started" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.helpCenter.sections.gettingStarted.eyebrow')}</span>
              <h2>{t('support.helpCenter.sections.gettingStarted.title')}</h2>
              <p>{t('support.helpCenter.sections.gettingStarted.subtitle')}</p>
            </div>

            <div className={styles.tutorialWrap}>
              <div>
                <ol className={styles.stepList}>
                  <li>{t('support.helpCenter.sections.gettingStarted.steps.1')}</li>
                  <li>{t('support.helpCenter.sections.gettingStarted.steps.2')}</li>
                  <li>{t('support.helpCenter.sections.gettingStarted.steps.3')}</li>
                  <li>{t('support.helpCenter.sections.gettingStarted.steps.4')}</li>
                </ol>
              </div>

              <div>
                <h3>{t('support.helpCenter.sections.gettingStarted.tutorialTitle')}</h3>
                <p className={styles.richText}>
                  {t('support.helpCenter.sections.gettingStarted.tutorialSubtitle')}
                </p>

                {tutorialVideoUrl ? (
                  <div className={styles.videoFrame}>
                    <iframe
                      src={tutorialVideoUrl}
                      title="Randa Plus tutorial"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className={styles.callout}>
                    <p>
                      <Trans i18nKey="support.helpCenter.sections.gettingStarted.tutorialMissing" components={[<strong key="strong" />]} />
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="account-security" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.helpCenter.sections.accountSecurity.eyebrow')}</span>
              <h2>{t('support.helpCenter.sections.accountSecurity.title')}</h2>
              <p>{t('support.helpCenter.sections.accountSecurity.subtitle')}</p>
            </div>

            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiLock aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.accountSecurity.cards.passwords.title')}</h3>
                  <p>{t('support.helpCenter.sections.accountSecurity.cards.passwords.body')}</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiShield aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.accountSecurity.cards.google.title')}</h3>
                  <p>{t('support.helpCenter.sections.accountSecurity.cards.google.body')}</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiHelpCircle aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.accountSecurity.cards.cantSignIn.title')}</h3>
                  <p>{t('support.helpCenter.sections.accountSecurity.cards.cantSignIn.body')}</p>
                </div>
              </article>
            </div>
          </section>

          <section id="billing" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.helpCenter.sections.billing.eyebrow')}</span>
              <h2>{t('support.helpCenter.sections.billing.title')}</h2>
              <p>{t('support.helpCenter.sections.billing.subtitle')}</p>
            </div>
            <ul className={styles.bulletList}>
              <li>{t('support.helpCenter.sections.billing.bullets.1')}</li>
              <li>{t('support.helpCenter.sections.billing.bullets.2')}</li>
              <li>{t('support.helpCenter.sections.billing.bullets.3')}</li>
            </ul>
          </section>

          <section id="playback" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.helpCenter.sections.playback.eyebrow')}</span>
              <h2>{t('support.helpCenter.sections.playback.title')}</h2>
              <p>{t('support.helpCenter.sections.playback.subtitle')}</p>
            </div>
            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiPlayCircle aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.playback.cards.buffering.title')}</h3>
                  <p>{t('support.helpCenter.sections.playback.cards.buffering.body')}</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiPlayCircle aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.playback.cards.audio.title')}</h3>
                  <p>{t('support.helpCenter.sections.playback.cards.audio.body')}</p>
                </div>
              </article>
            </div>
          </section>

          <section id="devices" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>{t('support.helpCenter.sections.devices.eyebrow')}</span>
              <h2>{t('support.helpCenter.sections.devices.title')}</h2>
              <p>{t('support.helpCenter.sections.devices.subtitle')}</p>
            </div>
            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiSmartphone aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.devices.cards.mobile.title')}</h3>
                  <p>{t('support.helpCenter.sections.devices.cards.mobile.body')}</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiSmartphone aria-hidden="true" />
                <div>
                  <h3>{t('support.helpCenter.sections.devices.cards.stuck.title')}</h3>
                  <p>
                    <Trans
                      i18nKey="support.helpCenter.sections.devices.cards.stuck.body"
                      components={[<Link key="contact" to="/contact" />]}
                    />
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.callout} aria-label="Need more help">
            <h2>{t('support.helpCenter.callout.title')}</h2>
            <p>{t('support.helpCenter.callout.body')}</p>
            <div className={styles.calloutActions}>
              <Button variant="secondary" onClick={() => navigate('/faq')}>
                {t('support.helpCenter.callout.actions.openFaq')}
              </Button>
              <Button variant="primary" onClick={() => navigate('/contact')}>
                {t('support.helpCenter.callout.actions.contactSupport')}
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default HelpCenter
