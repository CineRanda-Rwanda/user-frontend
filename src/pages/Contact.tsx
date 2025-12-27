import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiChevronRight, FiMail, FiMessageCircle, FiPhone } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
          label: t('support.contact.channels.email'),
          value: email as string | undefined,
          href: email ? `mailto:${email}` : undefined,
          icon: FiMail
        },
        {
          label: t('support.contact.channels.phone'),
          value: phone as string | undefined,
          href: phone ? `tel:${phone}` : undefined,
          icon: FiPhone
        },
        {
          label: t('support.contact.channels.whatsapp'),
          value: whatsapp as string | undefined,
          href: formatWhatsappLink(whatsapp as string | undefined),
          icon: FiMessageCircle
        }
      ].filter((option) => !!option.value),
    [email, phone, t, whatsapp]
  )

  const availability = [
    { label: t('support.contact.availability.response.label'), value: t('support.contact.availability.response.value') },
    { label: t('support.contact.availability.bestTime.label'), value: t('support.contact.availability.bestTime.value') },
    { label: t('support.contact.availability.include.label'), value: t('support.contact.availability.include.value') }
  ]

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = t('support.contact.validation.nameRequired')
    if (!form.email.trim()) next.email = t('support.contact.validation.emailRequired')
    if (!form.subject.trim()) next.subject = t('support.contact.validation.subjectRequired')
    if (!form.message.trim() || form.message.trim().length < 10) next.message = t('support.contact.validation.messageMin')
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
    toast.success(t('support.contact.toasts.openingEmail'))
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
  }

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
            <Link to="/terms" className={styles.inlineNavLink}>
              {t('support.common.terms')} <FiChevronRight aria-hidden="true" />
            </Link>
          </nav>
        </div>

        <p className={styles.sectionLabel}>{t('support.contact.hero.label')}</p>
        <h1>{t('support.contact.hero.title')}</h1>
        <p>{t('support.contact.hero.subtitle')}</p>

        <div className={styles.heroActions}>
          <Button variant="outline" onClick={() => navigate('/faq')}>
            {t('support.contact.hero.actions.checkFaq')}
          </Button>
          <Button variant="primary" onClick={() => {
            const el = document.getElementById('contact-form')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}>
            {t('support.contact.hero.actions.writeMessage')}
          </Button>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>{t('support.contact.direct.eyebrow')}</span>
          <h2>{t('support.contact.direct.title')}</h2>
          <p>{t('support.contact.direct.subtitle')}</p>
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
            <p>{t('support.contact.direct.notConfigured')}</p>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>{t('support.contact.availability.eyebrow')}</span>
          <h2>{t('support.contact.availability.title')}</h2>
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
          <span>{t('support.contact.form.eyebrow')}</span>
          <h2>{t('support.contact.form.title')}</h2>
          <p>{t('support.contact.form.subtitle')}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <Input
              label={t('support.contact.form.fields.name')}
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label={t('support.contact.form.fields.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
            />
          </div>
          <Input
            label={t('support.contact.form.fields.subject')}
            name="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            error={errors.subject}
            required
          />
          <Textarea
            label={t('support.contact.form.fields.message')}
            name="message"
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            error={errors.message}
            required
          />
          <div className={styles.formActions}>
            <Button variant="primary" type="submit">
              {t('support.contact.form.actions.openDraft')}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default Contact
