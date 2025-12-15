import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SupportPages.module.css'

const formatWhatsappLink = (value?: string) => {
  if (!value) return undefined
  const digits = value.replace(/[^0-9]/g, '')
  if (!digits) return undefined
  return `https://wa.me/${digits}`
}

const Contact: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)
  const email = import.meta.env.VITE_SUPPORT_EMAIL
  const phone = import.meta.env.VITE_SUPPORT_PHONE
  const whatsapp = import.meta.env.VITE_SUPPORT_WHATSAPP

  const contactOptions = [
    {
      label: 'Email',
      value: email,
      href: email ? `mailto:${email}` : undefined
    },
    {
      label: 'Phone',
      value: phone,
      href: phone ? `tel:${phone}` : undefined
    },
    {
      label: 'WhatsApp',
      value: whatsapp,
      href: formatWhatsappLink(whatsapp)
    }
  ].filter((option) => !!option.value)

  const availability = [
    { label: 'Live chat', value: '08:00 – 22:00 CAT, daily' },
    { label: 'Escalations', value: 'Under 2 hours for premium plans' },
    { label: 'Emergency ops', value: '24/7 monitoring' }
  ]

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <p className={styles.sectionLabel}>Contact</p>
        <h1>Talk to a human</h1>
        <p>Our Kigali-based support team answers within hours. Pick the channel that works for you.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Direct lines</span>
          <h2>Get immediate assistance</h2>
          <p>Premium subscribers jump to the front of the queue automatically.</p>
        </div>
        <div className={styles.cardGrid}>
          {contactOptions.length ? (
            contactOptions.map((option) => (
              <article key={option.label} className={`${styles.card} ${styles.contactCard}`}>
                <span className={styles.contactLabel}>{option.label}</span>
                {option.href ? (
                  <a href={option.href} className={styles.contactValue}>
                    {option.value}
                  </a>
                ) : (
                  <span className={styles.contactValue}>{option.value}</span>
                )}
              </article>
            ))
          ) : (
            <p>No contact details configured yet. Update your environment variables to surface them here.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Availability</span>
          <h2>Response time guarantees</h2>
        </div>
        <div className={styles.cardGrid}>
          {availability.map((item) => (
            <article key={item.label} className={styles.card}>
              <span className={styles.contactLabel}>{item.label}</span>
              <p>{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Partnerships</span>
          <h2>Studios & business</h2>
        </div>
        <p>Please send your deck or screener links via email. Our acquisitions team reviews submissions every Friday and replies with next steps if we move forward.</p>
      </section>
    </div>
  )
}

export default Contact
