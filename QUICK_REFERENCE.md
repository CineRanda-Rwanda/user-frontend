# 🚀 Quick Reference - Cineranda Development

## 🏃 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API URL

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📁 File Structure Cheat Sheet

```
src/
├── api/           → API calls (use these!)
├── components/    → UI components
├── contexts/      → React Context (AuthContext)
├── pages/         → Page components
├── types/         → TypeScript types
├── utils/         → Helper functions
└── styles/        → Global CSS
```

---

## 🎨 Design System Quick Ref

### Colors
```css
var(--primary-yellow)   /* #FFD700 - Buttons */
var(--accent-red)       /* #E50914 - CTAs */
var(--bg-black)         /* #000000 - Background */
var(--text-white)       /* #FFFFFF - Text */
```

### Spacing
```css
var(--spacing-xs)   /* 4px */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 16px */
var(--spacing-lg)   /* 24px */
var(--spacing-xl)   /* 32px */
```

---

## 🔧 Common Imports

```tsx
// Components
import Button from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import Modal from '@/components/common/Modal'
import Loader from '@/components/common/Loader'

// API
import { contentAPI } from '@/api/content'
import { authAPI } from '@/api/auth'
import { userAPI } from '@/api/user'
import { paymentAPI } from '@/api/payment'

// Hooks
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Utils
import { formatCurrency, formatDate } from '@/utils/formatters'
import { toast } from 'react-toastify'

// Types
import { Content } from '@/types/content'
import { User } from '@/types/user'

// Icons
import { FiPlay, FiStar, FiSearch } from 'react-icons/fi'
```

---

## 📦 API Usage Examples

### Content API
```typescript
// Get all movies
const movies = await contentAPI.getContentByType('Movie', 20)

// Search
const results = await contentAPI.searchContent({ 
  q: 'inception',
  contentType: 'Movie'
})

// Get details
const content = await contentAPI.getContentById(id)

// Get trending
const trending = await contentAPI.getTrendingContent(10)
```

### User API
```typescript
// Get current user
const user = await userAPI.getCurrentUser()

// Get library
const library = await userAPI.getLibrary()

// Update watch progress
await userAPI.updateWatchProgress({
  contentId: 'xxx',
  lastPosition: 120,
  totalDuration: 3600
})
```

### Payment API
```typescript
// Initiate payment
const payment = await paymentAPI.initiatePayment({
  contentId: 'xxx',
  paymentMethod: 'FLUTTERWAVE',
  email: 'user@example.com',
  phoneNumber: '+250123456789'
})

// Check status
const status = await paymentAPI.getPaymentStatus(transactionId)
```

---

## 🎯 Component Templates

### Basic Page Component
```tsx
import React, { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Loader from '@/components/common/Loader'
import styles from './MyPage.module.css'

const MyPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // API call here
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader fullScreen text="Loading..." />
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.content}>
        {/* Page content */}
      </div>
    </div>
  )
}

export default MyPage
```

### Basic Component
```tsx
import React from 'react'
import styles from './MyComponent.module.css'

interface MyComponentProps {
  title: string
  onClick?: () => void
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onClick 
}) => {
  return (
    <div className={styles.component} onClick={onClick}>
      <h3>{title}</h3>
    </div>
  )
}

export default MyComponent
```

---

## 🎨 CSS Module Template

```css
/* MyComponent.module.css */

.component {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.component:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--shadow-black);
}

.title {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-white);
  margin-bottom: var(--spacing-md);
}

/* Responsive */
@media (max-width: 640px) {
  .component {
    padding: var(--spacing-md);
  }
  
  .title {
    font-size: var(--fs-xl);
  }
}
```

---

## 🔐 Auth Hook Usage

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please login</div>
  }

  return (
    <div>
      <p>Welcome, {user?.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

---

## 🚨 Error Handling Pattern

```tsx
const handleAction = async () => {
  try {
    setLoading(true)
    const { data } = await api.someCall()
    setData(data)
    toast.success('Success!')
  } catch (error: any) {
    const message = error.response?.data?.message || 'An error occurred'
    toast.error(message)
    console.error(error)
  } finally {
    setLoading(false)
  }
}
```

---

## 📱 Responsive Grid Pattern

```css
.grid {
  display: grid;
  gap: var(--spacing-lg);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* Mobile: 2 columns */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

/* Tablet: 3-4 columns */
@media (min-width: 641px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: 5-6 columns */
@media (min-width: 1025px) {
  .grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

---

## 🎬 Video.js Setup

```tsx
import React, { useRef, useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const VideoPlayer: React.FC<{ src: string }> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const player = videojs(videoRef.current, {
      controls: true,
      sources: [{ src, type: 'video/mp4' }]
    })

    playerRef.current = player

    return () => {
      player.dispose()
    }
  }, [src])

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js" />
    </div>
  )
}
```

---

## 🔍 Search with Debounce

```tsx
import { useState, useEffect } from 'react'
import { debounce } from '@/utils/formatters'
import { contentAPI } from '@/api/content'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.length > 0) {
      debouncedSearch(query)
    } else {
      setResults([])
    }
  }, [query])

  const debouncedSearch = debounce(async (q: string) => {
    try {
      const { data } = await contentAPI.searchContent({ q })
      setResults(data)
    } catch (error) {
      console.error(error)
    }
  }, 300)

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

---

## 💳 Payment Flow

```tsx
const [isPaymentOpen, setIsPaymentOpen] = useState(false)

const handlePurchase = () => {
  setIsPaymentOpen(true)
}

const handlePaymentSuccess = () => {
  // Refresh user's library
  refreshLibrary()
  toast.success('Purchase successful!')
}

<PaymentModal
  isOpen={isPaymentOpen}
  onClose={() => setIsPaymentOpen(false)}
  content={content}
  onSuccess={handlePaymentSuccess}
/>
```

---

## 🎨 Button Examples

```tsx
<Button variant="primary" size="large" fullWidth>
  Primary Button
</Button>

<Button variant="secondary" loading={loading}>
  Secondary Button
</Button>

<Button variant="ghost" icon={<FiPlay />}>
  Ghost Button
</Button>

<Button variant="outline" onClick={handleClick}>
  Outline Button
</Button>
```

---

## 📝 Form Validation Example

```tsx
import { validateLoginForm } from '@/utils/validators'

const [errors, setErrors] = useState<any>({})

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  const validation = validateLoginForm(formData)
  if (!validation.isValid) {
    setErrors(validation.errors)
    return
  }
  
  // Proceed with login
}

<Input
  name="email"
  value={formData.email}
  onChange={handleChange}
  error={errors.email}
/>
```

---

## 🎯 Key Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Type checking
npx tsc --noEmit    # Check TypeScript errors

# Formatting
npm run lint        # Lint code
```

---

## 📚 Where to Find Things

| Need | File |
|------|------|
| Design colors | `src/styles/global.css` |
| API endpoints | `src/api/*.ts` |
| Type definitions | `src/types/*.ts` |
| Validators | `src/utils/validators.ts` |
| Formatters | `src/utils/formatters.ts` |
| Constants | `src/utils/constants.ts` |
| Auth logic | `src/contexts/AuthContext.tsx` |

---

## 🐛 Common Issues

### Issue: Can't import components
**Solution**: Check path alias `@/` is working. Configured in `vite.config.ts`

### Issue: TypeScript errors on CSS modules
**Solution**: Already fixed with `src/types/modules.d.ts`

### Issue: API calls failing
**Solution**: Check `.env` has correct `VITE_API_BASE_URL`

### Issue: Token not persisting
**Solution**: Check localStorage in DevTools → Application tab

---

## ✅ Before Committing

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console errors
- [ ] Code formatted properly
- [ ] Responsive on mobile
- [ ] Loading states added
- [ ] Error handling in place

---

## 🎉 You Got This!

Everything you need is set up. Just follow the patterns, use the examples, and reference the docs. Happy coding! 🚀
