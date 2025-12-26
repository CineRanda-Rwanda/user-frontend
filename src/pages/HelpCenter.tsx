import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight, FiHelpCircle, FiLock, FiPlayCircle, FiShield, FiSmartphone } from 'react-icons/fi'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

const HelpCenter: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  const tutorialVideoUrl = (import.meta as any).env?.VITE_TUTORIAL_VIDEO_URL as string | undefined

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroTopRow}>
          <button type="button" className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
          <nav className={styles.inlineNav} aria-label="Support links">
            <Link to="/" className={styles.inlineNavLink}>
              Home <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/faq" className={styles.inlineNavLink}>
              FAQ <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/contact" className={styles.inlineNavLink}>
              Contact <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/terms" className={styles.inlineNavLink}>
              Terms <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>Support</p>
        <h1>Help Center</h1>
        <p>
          Find quick answers, step-by-step guides, and the fastest way to reach support.
        </p>

        <div className={styles.heroActions}>
          <Button variant="primary" onClick={() => navigate('/faq')}>
            Browse FAQ
          </Button>
          <Button variant="outline" onClick={() => navigate('/contact')}>
            Contact support
          </Button>
        </div>
      </header>

      <div className={styles.twoColumn}>
        <aside className={styles.sideNav} aria-label="Help Center navigation">
          <div className={styles.sideNavCard}>
            <p className={styles.sideNavTitle}>On this page</p>
            <a className={styles.sideNavLink} href="#getting-started">
              Getting started
            </a>
            <a className={styles.sideNavLink} href="#account-security">
              Account & security
            </a>
            <a className={styles.sideNavLink} href="#billing">
              Billing & purchases
            </a>
            <a className={styles.sideNavLink} href="#playback">
              Playback & quality
            </a>
            <a className={styles.sideNavLink} href="#devices">
              Devices & access
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section id="getting-started" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Getting started</span>
              <h2>Start streaming in minutes</h2>
              <p>Simple steps that work on every device.</p>
            </div>

            <div className={styles.tutorialWrap}>
              <div>
                <ol className={styles.stepList}>
                  <li>
                    Create an account (email or phone), then confirm any required verification.
                  </li>
                  <li>
                    Use Search to find a title, or browse Movies and Series.
                  </li>
                  <li>
                    Open a title and press Watch. If a purchase is required, you’ll see the price before confirming.
                  </li>
                  <li>
                    Rate what you watch to improve recommendations and notifications.
                  </li>
                </ol>
              </div>

              <div>
                <h3>How to use Randa Plus</h3>
                <p className={styles.richText}>
                  Watch the quick walkthrough to learn how to search, unlock, and start watching.
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
                      Tutorial video is not configured. Set <strong>VITE_TUTORIAL_VIDEO_URL</strong> in your environment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id="account-security" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Account & security</span>
              <h2>Keep your account protected</h2>
              <p>Tips for safer sign-in and account recovery.</p>
            </div>

            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiLock aria-hidden="true" />
                <div>
                  <h3>Passwords & PINs</h3>
                  <p>
                    Email accounts use a password. Phone accounts use a PIN for quick access.
                    Manage security from your Profile settings.
                  </p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiShield aria-hidden="true" />
                <div>
                  <h3>Sign in with Google</h3>
                  <p>
                    Google accounts don’t have an app password by default. Use Google to manage your sign-in security.
                  </p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiHelpCircle aria-hidden="true" />
                <div>
                  <h3>Can’t sign in?</h3>
                  <p>
                    Try reset options first (password or PIN), then contact support with the email/phone you used.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section id="billing" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Billing & purchases</span>
              <h2>Payments, receipts, and refunds</h2>
              <p>What you’ll see at checkout and where to get help if something fails.</p>
            </div>
            <ul className={styles.bulletList}>
              <li>Before confirming, we show the price and what you’re unlocking.</li>
              <li>If a transaction completes but access doesn’t unlock, contact support with the payment reference.</li>
              <li>Refund eligibility depends on the issue and timing. Use Contact support for a review.</li>
            </ul>
          </section>

          <section id="playback" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Playback</span>
              <h2>Smoother streaming</h2>
              <p>Fix buffering, audio sync, and quality drops quickly.</p>
            </div>
            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiPlayCircle aria-hidden="true" />
                <div>
                  <h3>Buffering or freezes</h3>
                  <p>Restart the player, switch to Wi‑Fi, then reduce quality if bandwidth is limited.</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiPlayCircle aria-hidden="true" />
                <div>
                  <h3>No audio / wrong language</h3>
                  <p>Check device volume, then re-open the title. If available, pick audio/subtitles inside the player.</p>
                </div>
              </article>
            </div>
          </section>

          <section id="devices" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Devices</span>
              <h2>Watch on the go</h2>
              <p>Use your membership across supported devices.</p>
            </div>
            <div className={styles.featureList}>
              <article className={styles.featureItem}>
                <FiSmartphone aria-hidden="true" />
                <div>
                  <h3>Mobile & desktop</h3>
                  <p>Use the same account to sign in across devices. If you hit limits, sign out from old sessions.</p>
                </div>
              </article>
              <article className={styles.featureItem}>
                <FiSmartphone aria-hidden="true" />
                <div>
                  <h3>Still stuck?</h3>
                  <p>
                    Visit <Link to="/contact">Contact</Link> and include device model, browser/app version, and a short description.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section className={styles.callout} aria-label="Need more help">
            <h2>Need help right now?</h2>
            <p>Start with the FAQ for quick fixes, or message support with your account email/phone.</p>
            <div className={styles.calloutActions}>
              <Button variant="secondary" onClick={() => navigate('/faq')}>
                Open FAQ
              </Button>
              <Button variant="primary" onClick={() => navigate('/contact')}>
                Contact support
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default HelpCenter
