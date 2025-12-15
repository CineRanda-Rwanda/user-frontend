import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SupportPages.module.css'

const faqs = [
  {
    question: 'How many devices can stream at once?',
    answer: 'Two devices can stream concurrently on the base plan. Upgrade in Profile → Settings to unlock four screens.'
  },
  {
    question: 'Can I download episodes?',
    answer: 'Yes. Look for the download icon on supported titles. Downloads last 30 days offline or 48 hours once playback starts.'
  },
  {
    question: 'Which payment methods are accepted?',
    answer: 'We support Rwanda local wallets, bank cards, and Flutterwave. Top up your in-app wallet for instant checkout.'
  },
  {
    question: 'How do refunds work?',
    answer:
      'If streaming fails due to a platform error, open a ticket within 24 hours from the Help Center and we will credit your wallet.'
  }
]

const FAQ: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <p className={styles.sectionLabel}>FAQ</p>
        <h1>Frequently Asked Questions</h1>
        <p>Fast, human answers to keep you streaming confidently.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Knowledge base</span>
          <h2>Most asked, clearly answered</h2>
        </div>
        <ul className={styles.list}>
          {faqs.map((faq) => (
            <li key={faq.question} className={styles.listItem}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default FAQ
