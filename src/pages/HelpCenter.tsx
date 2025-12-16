import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './SupportPages.module.css'

const quickActions = [
  {
    title: 'Account & Billing',
    description: 'Reset your PIN, manage wallets, and secure your membership in minutes.',
    to: '/profile'
  },
  {
    title: 'Watch Anywhere',
    description: 'Fix playback issues, manage devices, and download episodes offline.',
    to: '/help#streaming'
  },
  {
    title: 'Request Content',
    description: 'Suggest new movies or series and follow release updates.',
    to: '/contact'
  }
]

const tutorialSteps = [
  'Create an account or sign in, then personalize your profile and wallet.',
  'Browse spotlight rows or use search filters to find the perfect title.',
  'Tap “Watch” to stream instantly, or hit the download icon for offline viewing.',
  'Rate what you watch to improve recommendations and unlock tailored alerts.'
]

const tutorialVideoUrl = import.meta.env.VITE_TUTORIAL_VIDEO_URL || 'https://www.youtube.com/embed/dQw4w9WgXcQ'

const HelpCenter: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(-1)

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <p className={styles.sectionLabel}>Support</p>
        <h1>Help Center</h1>
        <p>Clear, human answers for everything from streaming quality to wallet top-ups.</p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Popular Topics</span>
          <h2>Start with the essentials</h2>
          <p>Curated guides our members reach for most often.</p>
        </div>
        <div className={styles.cardGrid}>
          {quickActions.map((action) => (
            <article key={action.title} className={styles.card}>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <Link to={action.to}>Open guide ↗</Link>
            </article>
          ))}
        </div>
      </section>

      <section id="tutorial" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Walkthrough</span>
          <h2>How to use CinéRanda</h2>
          <p>Follow the step-by-step text guide or play the video tutorial—whichever fits your pace.</p>
        </div>
        <div className={styles.tutorialWrap}>
          <div className={styles.videoFrame}>
            <iframe
              src={tutorialVideoUrl}
              title="CinéRanda onboarding tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div>
            <ol className={styles.stepList}>
              {tutorialSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="streaming" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Streaming</span>
          <h2>Playback best practices</h2>
        </div>
        <p>
          For buttery HD, connect to a 5 Mbps line (25 Mbps for 4K). Toggle quality from the player if bandwidth dips, or download episodes while on Wi-Fi for guaranteed smooth playback later.
        </p>
      </section>

      <section id="content" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Requests</span>
          <h2>Get your favorites added</h2>
        </div>
        <p>
          We add new titles weekly. Tap “Notify me” on upcoming releases or send a curated list via the <Link to="/contact">Contact page</Link>. Our programming team reviews submissions every Friday.
        </p>
      </section>
    </div>
  )
}

export default HelpCenter
