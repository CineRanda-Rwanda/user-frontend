import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import Button from '@/components/common/Button'
import styles from './SupportPages.module.css'

const LAST_UPDATED = 'December 26, 2025'

const Terms: React.FC = () => {
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
            <Link to="/faq" className={styles.inlineNavLink}>
              FAQ <FiChevronRight aria-hidden="true" />
            </Link>
            <Link to="/contact" className={styles.inlineNavLink}>
              Contact <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>Legal</p>
        <h1>Terms of Service</h1>
        <p>
          These terms govern your access to and use of the service. Last updated: {LAST_UPDATED}.
        </p>

        <div className={styles.heroActions}>
          <Button
            variant="outline"
            onClick={() => {
              const el = document.getElementById('terms')
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            Read terms
          </Button>
          <Button variant="primary" onClick={() => navigate('/contact')}>
            Contact legal
          </Button>
        </div>
      </header>

      <div className={styles.twoColumn}>
        <aside className={styles.sideNav} aria-label="Terms navigation">
          <div className={styles.sideNavCard}>
            <p className={styles.sideNavTitle}>On this page</p>
            <a className={styles.sideNavLink} href="#terms">
              Overview
            </a>
            <a className={styles.sideNavLink} href="#accounts">
              Accounts
            </a>
            <a className={styles.sideNavLink} href="#payments">
              Payments
            </a>
            <a className={styles.sideNavLink} href="#content">
              Content & licensing
            </a>
            <a className={styles.sideNavLink} href="#acceptable-use">
              Acceptable use
            </a>
            <a className={styles.sideNavLink} href="#disclaimers">
              Disclaimers
            </a>
            <a className={styles.sideNavLink} href="#changes">
              Changes
            </a>
          </div>
        </aside>

        <main className={styles.main}>
          <section id="terms" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Agreement</span>
              <h2>Overview</h2>
              <p>
                By using the service, you agree to these Terms. If you do not agree, do not use the service.
              </p>
            </div>
            <div className={styles.richText}>
              <p>
                These Terms apply to all visitors and users. Additional rules may apply to specific features (for example,
                purchases/unlocks or promotional offers).
              </p>
            </div>
          </section>

          <section id="accounts" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Accounts</span>
              <h2>Registration and security</h2>
              <p>Keep your credentials secure and accurate.</p>
            </div>
            <ul className={styles.bulletList}>
              <li>You are responsible for activity that occurs under your account.</li>
              <li>Provide accurate account information and keep it up to date.</li>
              <li>Do not share your credentials or attempt to access accounts you do not own.</li>
            </ul>
          </section>

          <section id="payments" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Payments</span>
              <h2>Billing, purchases, and refunds</h2>
              <p>How payments work and how to request help.</p>
            </div>
            <div className={styles.richText}>
              <p>
                When you purchase or unlock content, you authorize us (and our payment providers) to charge the selected
                payment method.
              </p>
              <p>
                Refund requests are reviewed case-by-case where allowed by applicable law. For purchase issues, contact us
                via <Link to="/contact">Contact</Link> and include the payment reference.
              </p>
            </div>
          </section>

          <section id="content" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Content</span>
              <h2>Licensing and availability</h2>
              <p>Titles may change over time.</p>
            </div>
            <ul className={styles.bulletList}>
              <li>Content availability can vary by region, licensing terms, and time period.</li>
              <li>Streaming is for personal, non-commercial use unless explicitly authorized in writing.</li>
              <li>We may update, remove, or replace titles and features to improve the service.</li>
            </ul>
          </section>

          <section id="acceptable-use" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Acceptable use</span>
              <h2>What you may not do</h2>
              <p>Rules that protect our members, partners, and infrastructure.</p>
            </div>
            <ul className={styles.bulletList}>
              <li>Do not reverse engineer, scrape, exploit, or interfere with the service.</li>
              <li>Do not share, redistribute, or publicly screen content without permission.</li>
              <li>Do not use the service for unlawful, harmful, or abusive activity.</li>
            </ul>
          </section>

          <section id="disclaimers" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Disclaimers</span>
              <h2>Service “as is”</h2>
              <p>We work hard to keep the service stable, but outages can happen.</p>
            </div>
            <div className={styles.richText}>
              <p>
                The service is provided on an “as is” and “as available” basis. To the fullest extent permitted by law, we
                disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </div>
          </section>

          <section id="changes" className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>Changes</span>
              <h2>Updates to these terms</h2>
              <p>We may update these Terms to reflect product or legal changes.</p>
            </div>
            <div className={styles.richText}>
              <p>
                If we make material changes, we’ll provide notice in the app or by other reasonable means. Continued use of
                the service after updates means you accept the revised Terms.
              </p>
              <p>
                Questions? Visit <Link to="/contact">Contact</Link>.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Terms
