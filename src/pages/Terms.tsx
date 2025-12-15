import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SupportPages.module.css'

const sections = [
  {
    title: '1. Membership',
    body:
      'Your subscription renews automatically each billing cycle until cancelled. Manage billing at any time from Profile → Settings; your access continues until the cycle closes.'
  },
  {
    title: '2. Usage Rights',
    body:
      'Streams are licensed for personal viewing only. Recording, public screenings, or redistribution without written consent are strictly prohibited.'
  },
  {
    title: '3. Payments & Refunds',
    body:
      'Charges are non-refundable except where required by law or if uptime drops below 95%. Wallet refunds post within 24 hours; card refunds can take 5–7 business days.'
  },
  {
    title: '4. Privacy',
    body:
      'We collect the minimum data required to power recommendations and payments. Export or delete your data anytime from Settings → Privacy.'
  }
]

const Terms: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <p className={styles.sectionLabel}>Legal</p>
        <h1>Terms of Service</h1>
        <p>Clear, professional terms that spell out what you can expect from Cineranda.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Agreement</span>
          <h2>Key clauses at a glance</h2>
        </div>
        <ol className={styles.policyList}>
          {sections.map((section) => (
            <li key={section.title}>
              <strong>{section.title}</strong>
              <p>{section.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <p>
          By continuing to use Cineranda you confirm that you agree to these terms. For legal questions please reach out via the{' '}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
    </div>
  )
}

export default Terms
