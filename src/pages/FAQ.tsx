import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

type FaqItem = { q: string; a: React.ReactNode }

const faqGroups: Array<{ title: string; description: string; items: FaqItem[] }> = [
  {
    title: 'Account & sign-in',
    description: 'Creating an account, signing in, and keeping access secure.',
    items: [
      {
        q: 'What sign-in methods do you support?',
        a: (
          <>
            You can sign in with email/password, phone/PIN, or Google (if enabled).
          </>
        )
      },
      {
        q: 'I signed in with Google — can I change my password in the app?',
        a: (
          <>
            Google accounts typically don’t have an app password. Manage your Google security in your Google account settings.
          </>
        )
      },
      {
        q: 'I forgot my password or PIN. What should I do?',
        a: (
          <>
            Use the reset flow on the login screen (Forgot Password / Forgot PIN). If you still can’t recover access,
            contact support via <Link to="/contact">Contact</Link>.
          </>
        )
      }
    ]
  },
  {
    title: 'Watching & playback',
    description: 'Streaming quality, buffering, subtitles, and device basics.',
    items: [
      {
        q: 'Why is my video buffering?',
        a: 'Try switching networks (Wi‑Fi vs data), restarting the player, then lowering quality if needed.'
      },
      {
        q: 'Why is there no audio or the audio is out of sync?',
        a: 'Check device volume first. Then pause/play, refresh the page, or reopen the title.'
      },
      {
        q: 'Can I download episodes?',
        a: 'If downloads are supported for a title, you’ll see a download option on the details page.'
      }
    ]
  },
  {
    title: 'Billing, purchases & refunds',
    description: 'Payments, purchase issues, receipts, and support requests.',
    items: [
      {
        q: 'Which payment methods are supported?',
        a: 'Payment options depend on your region and checkout provider. You’ll see the available methods at checkout.'
      },
      {
        q: 'I paid but my content didn’t unlock. What now?',
        a: (
          <>
            Contact support and include the payment reference and the content title. Use <Link to="/contact">Contact</Link>.
          </>
        )
      },
      {
        q: 'Do you offer refunds?',
        a: (
          <>
            Refunds depend on the issue and timing. We’ll review your request and respond with the outcome.
            See <Link to="/terms">Terms</Link> for more.
          </>
        )
      }
    ]
  }
]

const FAQ: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
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
            <Link to="/help" className={styles.inlineNavLink}>
              Help Center <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/contact" className={styles.inlineNavLink}>
              Contact <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>Support</p>
        <h1>Frequently Asked Questions</h1>
        <p>Clear answers to common questions about sign-in, streaming, and purchases.</p>

        <div className={styles.heroActions}>
          <Button variant="outline" onClick={() => navigate('/help')}>
            Visit Help Center
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            Contact support
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Knowledge base</span>
          <h2>Most asked, clearly answered</h2>
          <p>Expand a question to see the full answer.</p>
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
        <h2>Still need help?</h2>
        <p>Send us a message with your account email/phone and any payment reference if applicable.</p>
        <div className={styles.calloutActions}>
          <Button variant="secondary" onClick={() => navigate('/help')}>
            Help Center
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            Contact support
          </Button>
        </div>
      </section>
    </div>
  )
}

export default FAQ
