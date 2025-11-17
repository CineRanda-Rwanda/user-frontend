# Cineranda Development Guide

This guide will help you complete the remaining components and pages for the Cineranda user frontend.

---

## 🎯 Current Status

### ✅ What's Complete
- Project structure and configuration
- Design system (colors, fonts, animations)
- API integration layer with token management
- Authentication system (login/register)
- Common UI components (Button, Input, Modal, Loader)
- Routing with protected routes
- Type definitions

### ⏳ What Needs to Be Built
1. Layout components (Navbar, Footer)
2. Content components (ContentCard, ContentRow, FeaturedHero)
3. Browse page with content discovery
4. Content details page
5. Payment modal with Flutterwave
6. Video player with Video.js
7. Search page
8. My Library page
9. Profile page

---

## 📋 Step-by-Step Implementation Guide

### Step 1: Create Navbar Component

**File**: `src/components/layout/Navbar.tsx`

**Key Features:**
- Sticky navigation bar
- Logo with link to /browse
- Navigation links: Home, Movies, Series, My Library
- Search icon
- Profile dropdown with user info
- Logout functionality
- Mobile hamburger menu

**Example Structure:**
```tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FiSearch, FiBell, FiUser, FiMenu, FiX } from 'react-icons/fi'
import styles from './Navbar.module.css'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <Link to="/browse" className={styles.logo}>
        <span className={styles.icon}>🎬</span>
        <span className={styles.text}>Cineranda</span>
      </Link>

      {/* Desktop Navigation */}
      <div className={styles.nav}>
        <Link to="/browse">Home</Link>
        <Link to="/browse?type=Movie">Movies</Link>
        <Link to="/browse?type=Series">Series</Link>
        <Link to="/my-library">My Library</Link>
      </div>

      {/* Right Side */}
      <div className={styles.actions}>
        <button onClick={() => navigate('/search')}>
          <FiSearch />
        </button>
        <button>
          <FiBell />
          <span className={styles.badge}>3</span>
        </button>
        {/* Profile dropdown */}
      </div>
    </nav>
  )
}

export default Navbar
```

**CSS** (`Navbar.module.css`):
```css
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  padding: var(--spacing-md) var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--fs-xl);
  font-weight: var(--fw-black);
  color: var(--primary-yellow);
  text-decoration: none;
}

.nav {
  display: flex;
  gap: var(--spacing-lg);
  flex: 1;
}

.nav a {
  color: var(--text-white);
  transition: color var(--transition-base);
}

.nav a:hover {
  color: var(--primary-yellow);
}
```

---

### Step 2: Create ContentCard Component

**File**: `src/components/content/ContentCard.tsx`

**Key Features:**
- Poster image
- Hover effect (scale + overlay)
- Rating display
- Price badge
- Click navigates to content details

```tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Content } from '@/types/content'
import { formatCurrency } from '@/utils/formatters'
import { FiStar, FiPlay } from 'react-icons/fi'
import styles from './ContentCard.module.css'

interface ContentCardProps {
  content: Content
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const navigate = useNavigate()

  return (
    <div 
      className={styles.card}
      onClick={() => navigate(`/content/${content._id}`)}
    >
      <img 
        src={content.posterImage} 
        alt={content.title}
        loading="lazy"
        className={styles.poster}
      />
      
      <div className={styles.overlay}>
        <button className={styles.playButton}>
          <FiPlay />
        </button>
        <div className={styles.info}>
          <h4 className={styles.title}>{content.title}</h4>
          <div className={styles.meta}>
            <span className={styles.rating}>
              <FiStar /> {content.averageRating.toFixed(1)}
            </span>
            <span className={styles.year}>{content.releaseYear}</span>
          </div>
        </div>
      </div>

      {content.price > 0 && (
        <div className={styles.priceBadge}>
          {formatCurrency(content.price)}
        </div>
      )}
    </div>
  )
}

export default ContentCard
```

**CSS**:
```css
.card {
  position: relative;
  aspect-ratio: 2/3;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-base);
}

.card:hover {
  transform: scale(1.05) translateY(-8px);
  z-index: 10;
}

.poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: var(--spacing-md);
}

.card:hover .overlay {
  opacity: 1;
}

.playButton {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-yellow);
  color: var(--bg-black);
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.priceBadge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: var(--accent-red);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
}
```

---

### Step 3: Create Browse Page

**File**: `src/pages/Browse.tsx`

```tsx
import React, { useEffect, useState } from 'react'
import { contentAPI } from '@/api/content'
import { Content } from '@/types/content'
import Navbar from '@/components/layout/Navbar'
import FeaturedHero from '@/components/content/FeaturedHero'
import ContentRow from '@/components/content/ContentRow'
import Loader from '@/components/common/Loader'
import { toast } from 'react-toastify'
import styles from './Browse.module.css'

const Browse: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<Content[]>([])
  const [trending, setTrending] = useState<Content[]>([])
  const [newReleases, setNewReleases] = useState<Content[]>([])
  const [movies, setMovies] = useState<Content[]>([])
  const [series, setSeries] = useState<Content[]>([])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const [featuredRes, trendingRes, newRes, moviesRes, seriesRes] = await Promise.all([
        contentAPI.getAllContent({ sortBy: 'averageRating', order: 'desc', limit: 5 }),
        contentAPI.getTrendingContent(15),
        contentAPI.getNewReleases(15),
        contentAPI.getContentByType('Movie', 20),
        contentAPI.getContentByType('Series', 20)
      ])

      setFeatured(featuredRes.data)
      setTrending(trendingRes.data)
      setNewReleases(newRes.data)
      setMovies(moviesRes.data)
      setSeries(seriesRes.data)
    } catch (error) {
      toast.error('Failed to load content')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader fullScreen text="Loading content..." />
  }

  return (
    <div className={styles.browse}>
      <Navbar />
      
      <FeaturedHero content={featured} />

      <div className={styles.content}>
        <ContentRow title="🔥 Trending Now" items={trending} />
        <ContentRow title="🆕 New Releases" items={newReleases} />
        <ContentRow title="🎬 Popular Movies" items={movies} />
        <ContentRow title="📺 Top Series" items={series} />
      </div>
    </div>
  )
}

export default Browse
```

---

### Step 4: Create Payment Modal

**File**: `src/components/payment/PaymentModal.tsx`

**Key Features:**
- Two tabs: Flutterwave and Coins
- Email and phone input for Flutterwave
- Payment status polling
- Success/failure handling

```tsx
import React, { useState } from 'react'
import { paymentAPI } from '@/api/payment'
import { userAPI } from '@/api/user'
import Modal from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import Button from '@/components/common/Button'
import { validatePaymentForm } from '@/utils/validators'
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'react-toastify'
import styles from './PaymentModal.module.css'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  content: any
  onSuccess: () => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  content,
  onSuccess
}) => {
  const [method, setMethod] = useState<'FLUTTERWAVE' | 'COINS'>('FLUTTERWAVE')
  const [formData, setFormData] = useState({ email: '', phoneNumber: '' })
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [wallet, setWallet] = useState<any>(null)

  useEffect(() => {
    if (method === 'COINS') {
      loadWallet()
    }
  }, [method])

  const loadWallet = async () => {
    try {
      const { data } = await userAPI.getWallet()
      setWallet(data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleFlutterwavePayment = async () => {
    const validation = validatePaymentForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      const { data } = await paymentAPI.initiatePayment({
        contentId: content._id,
        paymentMethod: 'FLUTTERWAVE',
        email: formData.email,
        phoneNumber: formData.phoneNumber
      })

      // Open Flutterwave payment URL
      window.open(data.paymentUrl, '_blank')

      // Start polling for payment status
      pollPaymentStatus(data.transactionId)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed')
      setLoading(false)
    }
  }

  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 60 // 5 minutes (5s interval)
    let attempts = 0

    const interval = setInterval(async () => {
      attempts++

      try {
        const { data } = await paymentAPI.getPaymentStatus(transactionId)

        if (data.status === 'COMPLETED') {
          clearInterval(interval)
          setLoading(false)
          toast.success('Payment successful!')
          onSuccess()
          onClose()
        } else if (data.status === 'FAILED') {
          clearInterval(interval)
          setLoading(false)
          toast.error('Payment failed')
        }
      } catch (error) {
        console.error(error)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setLoading(false)
        toast.error('Payment verification timeout')
      }
    }, 5000) // Poll every 5 seconds
  }

  const handleCoinPayment = async () => {
    if (!wallet || wallet.balance < content.coinPrice) {
      toast.error('Insufficient coin balance')
      return
    }

    setLoading(true)
    try {
      await paymentAPI.initiatePayment({
        contentId: content._id,
        paymentMethod: 'COINS'
      })

      toast.success('Purchase successful!')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Purchase Content" size="large">
      <div className={styles.tabs}>
        <button
          className={method === 'FLUTTERWAVE' ? styles.active : ''}
          onClick={() => setMethod('FLUTTERWAVE')}
        >
          Flutterwave
        </button>
        <button
          className={method === 'COINS' ? styles.active : ''}
          onClick={() => setMethod('COINS')}
        >
          Coins
        </button>
      </div>

      {method === 'FLUTTERWAVE' ? (
        <div className={styles.form}>
          <p className={styles.price}>
            Price: {formatCurrency(content.price)}
          </p>

          <Input
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />

          <Input
            type="tel"
            label="Phone Number"
            placeholder="+250XXXXXXXXX"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            error={errors.phoneNumber}
            required
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleFlutterwavePayment}
            loading={loading}
          >
            Pay Now
          </Button>
        </div>
      ) : (
        <div className={styles.form}>
          <div className={styles.balance}>
            <p>Your Balance:</p>
            <h3>{wallet?.balance || 0} Coins</h3>
          </div>

          <p className={styles.price}>
            Price: {content.coinPrice} Coins
          </p>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCoinPayment}
            loading={loading}
            disabled={!wallet || wallet.balance < content.coinPrice}
          >
            Confirm Purchase
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default PaymentModal
```

---

### Step 5: Create Video Player

**File**: `src/components/player/VideoPlayer.tsx`

**Install video.js first:**
```bash
npm install video.js @types/video.js
```

```tsx
import React, { useRef, useEffect } from 'react'
import videojs from 'video.js'
import { userAPI } from '@/api/user'
import { throttle } from '@/utils/formatters'
import 'video.js/dist/video-js.css'
import styles from './VideoPlayer.module.css'

interface VideoPlayerProps {
  videoUrl: string
  contentId: string
  episodeId?: string
  onEnded?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  contentId,
  episodeId,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!videoRef.current) return

    // Initialize player
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      sources: [{
        src: videoUrl,
        type: 'video/mp4'
      }]
    })

    playerRef.current = player

    // Load last watch position
    loadWatchProgress()

    // Save progress every 5 seconds
    const saveProgress = throttle(() => {
      const currentTime = player.currentTime()
      const duration = player.duration()
      
      if (currentTime > 0 && duration > 0) {
        userAPI.updateWatchProgress({
          contentId,
          episodeId,
          lastPosition: Math.floor(currentTime),
          totalDuration: Math.floor(duration),
          completed: currentTime / duration > 0.9
        }).catch(console.error)
      }
    }, 5000)

    player.on('timeupdate', saveProgress)

    // Handle video end
    player.on('ended', () => {
      onEnded?.()
    })

    return () => {
      if (player) {
        player.dispose()
      }
    }
  }, [videoUrl, contentId, episodeId])

  const loadWatchProgress = async () => {
    try {
      const { data } = await userAPI.getWatchProgress(contentId)
      if (data && data.lastPosition > 0 && playerRef.current) {
        playerRef.current.currentTime(data.lastPosition)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!playerRef.current) return

      const player = playerRef.current

      switch (e.key) {
        case ' ':
          e.preventDefault()
          player.paused() ? player.play() : player.pause()
          break
        case 'ArrowLeft':
          player.currentTime(player.currentTime() - 10)
          break
        case 'ArrowRight':
          player.currentTime(player.currentTime() + 10)
          break
        case 'ArrowUp':
          player.volume(Math.min(player.volume() + 0.1, 1))
          break
        case 'ArrowDown':
          player.volume(Math.max(player.volume() - 0.1, 0))
          break
        case 'f':
        case 'F':
          player.requestFullscreen()
          break
        case 'm':
        case 'M':
          player.muted(!player.muted())
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className={styles.playerContainer}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
        />
      </div>
    </div>
  )
}

export default VideoPlayer
```

---

## 📚 Additional Implementation Tips

### Search Page Tips
- Use `debounce` utility for search input
- Store search params in URL query string
- Use `react-icons` for filter icons
- Implement skeleton loaders for results

### My Library Tips
- Group content by watch status (Continue Watching, Completed, Not Started)
- Show progress bar on each card
- Allow filtering by content type

### Profile Page Tips
- Use tabs for different sections
- Add confirmation modal for password change
- Display transaction history in a table
- Add "Buy Coins" button that opens payment modal

---

## 🎨 Styling Tips

1. **Use CSS Modules** for component-specific styles
2. **Use CSS Variables** from `global.css` for consistency
3. **Mobile First**: Design for mobile, then add larger breakpoints
4. **Hover Effects**: Add smooth transitions (0.3s ease)
5. **Loading States**: Show spinners or skeletons
6. **Error States**: Display user-friendly messages

---

## 🐛 Common Issues & Solutions

### Issue: API calls failing
**Solution**: Check that backend is running and VITE_API_BASE_URL is correct in `.env`

### Issue: Images not loading
**Solution**: Ensure image URLs are valid. Use placeholder for broken images.

### Issue: TypeScript errors
**Solution**: Run `npm install` to install all dependencies and their types.

### Issue: Routing not working
**Solution**: Ensure BrowserRouter wraps the App component in `main.tsx`

---

## 📦 Required npm Packages

Already in package.json:
- react, react-dom
- react-router-dom
- axios
- video.js
- react-icons
- react-toastify
- dompurify

Install with:
```bash
npm install
```

---

## ✅ Testing Checklist

Before considering the project complete:

- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Can browse content
- [ ] Can search and filter content
- [ ] Can view content details
- [ ] Can purchase content (test mode)
- [ ] Can watch video
- [ ] Video progress saves
- [ ] Can view library
- [ ] Can edit profile
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎬 Final Notes

- **Follow the design system** in `USER_FRONTEND_REQUIREMENTS.md`
- **Test on multiple screen sizes**
- **Handle errors gracefully**
- **Add loading states everywhere**
- **Keep code clean and commented**

Good luck building Cineranda! 🚀
