import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiChevronRight, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi'
import Button from '@/components/common/Button'
import { Input, Textarea } from '@/components/common/Input'
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

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const contactOptions = useMemo(
    () =>
      [
        {
          label: 'Email',
          value: email as string | undefined,
          href: email ? `mailto:${email}` : undefined,
          icon: FiMail
        },
        {
          label: 'Phone',
          value: phone as string | undefined,
          href: phone ? `tel:${phone}` : undefined,
          icon: FiPhone
        },
        {
          label: 'WhatsApp',
          value: whatsapp as string | undefined,
          href: formatWhatsappLink(whatsapp as string | undefined),
          icon: FiMessageCircle
        }
      ].filter((option) => !!option.value),
    [email, phone, whatsapp]
  )

  const availability = [
    { label: 'Typical response', value: 'Within 24 hours (often faster)' },
    { label: 'Best time to reach us', value: '08:00–20:00 CAT' },
    { label: 'What to include', value: 'Account email/phone, device details, payment reference (if any)' }
  ]

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Please enter your name'
    if (!form.email.trim()) next.email = 'Please enter your email'
    if (!form.subject.trim()) next.subject = 'Please enter a subject'
    if (!form.message.trim() || form.message.trim().length < 10) next.message = 'Please add a bit more detail'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const targetEmail = (email as string | undefined) || 'support@randaplus.com'
    const subject = `[Support] ${form.subject.trim()}`
    const body = [
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      '',
      form.message.trim()
    ].join('\n')

    const mailto = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    toast.success('Opening your email client…')
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
  }

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
            <Link to="/terms" className={styles.inlineNavLink}>
              Terms <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>Support</p>
        <h1>Contact Us</h1>
        <p>
          Tell us what happened and we’ll help you get back to streaming. For purchase issues, include the payment reference.
        </p>

        <div className={styles.heroActions}>
          <Button variant="outline" onClick={() => navigate('/faq')}>
            Check FAQ
          </Button>
          <Button variant="primary" onClick={() => {
            const el = document.getElementById('contact-form')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}>
            Write a message
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Direct channels</span>
          <h2>Reach us your way</h2>
          <p>Use the channel you prefer. If something is missing here, set `VITE_SUPPORT_EMAIL/PHONE/WHATSAPP`.</p>
        </div>
        <div className={styles.cardGrid}>
          {contactOptions.length ? (
            contactOptions.map((option) => (
              <article key={option.label} className={`${styles.card} ${styles.contactCard}`}>
                <span className={styles.contactLabel}>
                  <option.icon aria-hidden="true" /> {option.label}
                </span>
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
            <p>Support channels are not configured yet.</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Availability</span>
          <h2>What to expect</h2>
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

      <section id="contact-form" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Message</span>
          <h2>Send a support request</h2>
          <p>
            This form opens your email client with the details pre-filled. If you prefer, you can email us directly.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <Input
              label="Your name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
            />
          </div>
          <Input
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            error={errors.subject}
            required
          />
          <Textarea
            label="Message"
            name="message"
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            error={errors.message}
            required
          />
          <div className={styles.formActions}>
            <Button variant="primary" type="submit">
              Open email draft
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Contact
