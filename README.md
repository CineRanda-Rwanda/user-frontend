# 🎬 Cineranda User Frontend

> A Netflix-style streaming platform for Rwanda - User-facing web application

Built with **React 18 + TypeScript + Vite** featuring a sleek black, yellow, and red theme.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Status](#-development-status)
- [Environment Variables](#-environment-variables)
- [API Integration](#-api-integration)
- [Components Guide](#-components-guide)
- [Pages to Complete](#-pages-to-complete)
- [Design System](#-design-system)
- [Contributing](#-contributing)

---

## ✨ Features

- ✅ User authentication (Login/Register)
- ✅ Protected routes with JWT token management
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark theme with Yellow/Red accents
- ⏳ Browse content (Movies & TV Series)
- ⏳ Search with filters
- ⏳ Content purchase (Flutterwave + Coins)
- ⏳ Video player with progress tracking
- ⏳ User library and watch history
- ⏳ Profile management

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router v6 | Routing |
| Axios | HTTP Client |
| Video.js | Video Player |
| React Icons | Icon Library |
| React Toastify | Notifications |
| CSS Modules | Styling |

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend documentation)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your values:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_PAYMENT_PROVIDER=FLUTTERWAVE
   VITE_FLUTTERWAVE_PUBLIC_KEY=your_public_key
   VITE_CDN_URL=https://your-cdn.com
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   
   App will open at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
src/
├── api/                    # API integration layer
│   ├── axios.ts           # ✅ Axios instance with interceptors
│   ├── auth.ts            # ✅ Authentication API calls
│   ├── content.ts         # ✅ Content API calls
│   ├── user.ts            # ✅ User API calls
│   └── payment.ts         # ✅ Payment API calls
│
├── components/
│   ├── common/            # Reusable UI components
│   │   ├── Button.tsx     # ✅ Button component
│   │   ├── Input.tsx      # ✅ Input/Textarea/Select
│   │   ├── Modal.tsx      # ✅ Modal component
│   │   └── Loader.tsx     # ✅ Loading spinner
│   │
│   ├── layout/            # Layout components (TODO)
│   │   ├── Navbar.tsx     # ⏳ Navigation bar
│   │   ├── Footer.tsx     # ⏳ Footer
│   │   └── Layout.tsx     # ⏳ Page wrapper
│   │
│   ├── content/           # Content-specific components (TODO)
│   │   ├── ContentCard.tsx        # ⏳ Movie/series card
│   │   ├── ContentRow.tsx         # ⏳ Horizontal scroll row
│   │   ├── FeaturedHero.tsx       # ⏳ Hero banner
│   │   └── RatingStars.tsx        # ⏳ Star rating
│   │
│   ├── player/            # Video player components (TODO)
│   │   ├── VideoPlayer.tsx        # ⏳ Main player
│   │   ├── PlayerControls.tsx     # ⏳ Custom controls
│   │   └── EpisodeSelector.tsx    # ⏳ Episode list
│   │
│   └── payment/           # Payment components (TODO)
│       ├── PaymentModal.tsx       # ⏳ Payment modal
│       └── PricingCard.tsx        # ⏳ Pricing display
│
├── contexts/              # React Context
│   └── AuthContext.tsx    # ✅ Authentication context
│
├── hooks/                 # Custom hooks (TODO)
│   ├── useAuth.ts         # ✅ Auth hook (in AuthContext)
│   ├── useContent.ts      # ⏳ Content fetching hook
│   └── usePayment.ts      # ⏳ Payment hook
│
├── pages/                 # Page components
│   ├── Auth/
│   │   ├── Login.tsx      # ✅ Login page
│   │   └── Register.tsx   # ✅ Register page
│   ├── Browse.tsx         # ⏳ Main browse page
│   ├── ContentDetails.tsx # ⏳ Content details
│   ├── Watch.tsx          # ⏳ Video player page
│   ├── Search.tsx         # ⏳ Search page
│   ├── MyLibrary.tsx      # ⏳ User's library
│   ├── Profile.tsx        # ⏳ User profile
│   └── NotFound.tsx       # ✅ 404 page
│
├── types/                 # TypeScript types
│   ├── auth.ts            # ✅ Auth types
│   ├── user.ts            # ✅ User types
│   ├── content.ts         # ✅ Content types
│   └── payment.ts         # ✅ Payment types
│
├── utils/                 # Utility functions
│   ├── formatters.ts      # ✅ Format currency, dates, etc.
│   ├── validators.ts      # ✅ Form validation
│   └── constants.ts       # ✅ App constants
│
├── styles/                # Global styles
│   ├── global.css         # ✅ Global styles
│   └── animations.css     # ✅ Animation keyframes
│
├── App.tsx                # ✅ Main app component
└── main.tsx               # ✅ Entry point
```

**Legend:**
- ✅ Completed
- ⏳ To be implemented

---

## 📊 Development Status

### ✅ Completed (Core Foundation)

- [x] Project setup (Vite + React + TypeScript)
- [x] Design system (colors, typography, animations)
- [x] API integration layer with interceptors
- [x] Authentication system (Login/Register)
- [x] Protected routes
- [x] Common UI components (Button, Input, Modal, Loader)
- [x] TypeScript type definitions
- [x] Utility functions
- [x] Token management

### ⏳ To Be Implemented

#### High Priority
1. **Layout Components**
   - Navbar with search, notifications, profile dropdown
   - Footer with links
   - Layout wrapper

2. **Browse Page**
   - Featured hero section (auto-rotating)
   - Horizontal content rows (Trending, New, By Genre)
   - Content cards with hover effects
   - Integration with content API

3. **Content Details Page**
   - Hero banner with backdrop
   - Content information (title, rating, description)
   - Purchase button (triggers payment modal)
   - Episode list for series
   - Similar content section

4. **Payment Modal**
   - Flutterwave payment integration
   - Coin payment option
   - Payment status polling
   - Success/failure handling

5. **Video Player**
   - Video.js integration
   - Custom controls
   - Progress tracking (save every 5s)
   - Resume from last position
   - Episode selector for series
   - Keyboard shortcuts

#### Medium Priority
6. **Search Page**
   - Search input with debounce
   - Filters (type, genre, year, rating)
   - Results grid
   - Pagination

7. **My Library Page**
   - Purchased content grid
   - Watch progress indicators
   - Continue watching section

8. **Profile Page**
   - Account info editing
   - Password change
   - Wallet balance display
   - Transaction history
   - Settings

#### Low Priority
9. **Polish & Optimization**
   - Loading skeletons
   - Error boundaries
   - Image lazy loading
   - Code splitting optimization
   - SEO metadata

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Payment Provider
VITE_PAYMENT_PROVIDER=FLUTTERWAVE
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx

# CDN for media files
VITE_CDN_URL=https://cdn.cineranda.com
```

---

## 🔌 API Integration

### Base URL
All API calls go through the configured `VITE_API_BASE_URL`.

### Authentication
Tokens are stored in `localStorage`:
- `accessToken`: JWT for API authentication
- `refreshToken`: Token for refreshing access token

The axios interceptor automatically:
- Adds `Authorization: Bearer {token}` header
- Refreshes token on 401 errors
- Redirects to login if refresh fails

### Example API Usage

```typescript
import { contentAPI } from '@/api/content'

// Fetch all movies
const movies = await contentAPI.getContentByType('Movie', 20)

// Search content
const results = await contentAPI.searchContent({ q: 'inception' })

// Get content details
const content = await contentAPI.getContentById('content-id-here')
```

---

## 🎨 Design System

### Colors

```css
/* Primary */
--primary-yellow: #FFD700    /* Buttons, highlights */
--accent-red: #E50914        /* CTAs, important actions */

/* Background */
--bg-black: #000000          /* Main background */
--bg-card: #141414           /* Card backgrounds */

/* Text */
--text-white: #FFFFFF        /* Primary text */
--text-gray: #B3B3B3         /* Secondary text */
```

### Typography

- **Font Family**: Inter, system fonts
- **Headings**: Bold, line-height 1.2
- **Body**: Regular, line-height 1.6

### Spacing

Use CSS variables for consistent spacing:
```css
var(--spacing-xs)   /* 4px */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 16px */
var(--spacing-lg)   /* 24px */
var(--spacing-xl)   /* 32px */
var(--spacing-2xl)  /* 48px */
var(--spacing-3xl)  /* 64px */
```

### Animations

All animations use `var(--transition-base)` (0.3s ease) for consistency.

---

## 🧩 Components Guide

### Button Component

```tsx
import Button from '@/components/common/Button'

<Button variant="primary" size="large" fullWidth onClick={handleClick}>
  Click Me
</Button>

// Variants: primary (yellow), secondary (red), ghost, outline
// Sizes: small, medium, large
// Props: loading, fullWidth, icon
```

### Input Component

```tsx
import { Input } from '@/components/common/Input'

<Input
  type="email"
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Modal Component

```tsx
import Modal from '@/components/common/Modal'

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="large"
>
  Modal content here
</Modal>
```

### Loader Component

```tsx
import Loader from '@/components/common/Loader'

<Loader size="large" text="Loading..." />
<Loader fullScreen text="Please wait..." />
```

---

## 📄 Pages to Complete

### 1. Browse Page (`src/pages/Browse.tsx`)

**Requirements:**
- Featured hero section (auto-rotate every 7s)
- Horizontal scrolling rows:
  - Trending Now
  - New Releases
  - Popular Movies
  - Top Series
  - By Genre sections
- Lazy load images
- Skeleton loaders

**API Calls:**
```typescript
contentAPI.getAllContent({ isPublished: true, limit: 50 })
contentAPI.getTrendingContent(10)
contentAPI.getNewReleases(10)
contentAPI.getContentByType('Movie', 20)
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 320-430

---

### 2. Content Details Page (`src/pages/ContentDetails.tsx`)

**Requirements:**
- Hero banner with backdrop image
- Content metadata (title, rating, genres, year, duration)
- Description
- Cast and director
- Purchase button (triggers payment modal)
- Watch Now button (if owned)
- Episode list for series (locked if not purchased)
- Similar content section
- Trailer player (if available)

**API Calls:**
```typescript
contentAPI.getContentById(id)
userAPI.getLibrary() // Check if user owns content
contentAPI.getSimilarContent(id, genres)
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 432-530

---

### 3. Payment Modal Component (`src/components/payment/PaymentModal.tsx`)

**Requirements:**
- Two tabs: Flutterwave | Coins
- Flutterwave tab:
  - Email input
  - Phone number input (+250 format)
  - "Pay Now" button
  - Opens Flutterwave payment URL in new window
  - Polls payment status every 5 seconds
- Coins tab:
  - Display user's coin balance
  - Show content price
  - "Confirm Purchase" button
  - Instant deduction
- Success/failure toasts
- Loading states

**API Calls:**
```typescript
paymentAPI.initiatePayment({
  contentId,
  paymentMethod: 'FLUTTERWAVE',
  email,
  phoneNumber
})
paymentAPI.getPaymentStatus(transactionId)
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 1077-1250

---

### 4. Video Player Component (`src/components/player/VideoPlayer.tsx`)

**Requirements:**
- Use video.js library
- Custom controls:
  - Play/Pause
  - Progress bar with seek
  - Volume control
  - Playback speed (0.5x - 2x)
  - Fullscreen toggle
- Keyboard shortcuts:
  - Space: Play/Pause
  - Arrow Left/Right: Seek ±10s
  - Arrow Up/Down: Volume
  - F: Fullscreen
  - M: Mute
- Progress tracking (save every 5s)
- Resume from last position
- Auto-next episode countdown (10s)
- Episode selector for series

**API Calls:**
```typescript
contentAPI.getStreamUrl(contentId)
userAPI.getWatchProgress(contentId)
userAPI.updateWatchProgress({ contentId, lastPosition, totalDuration })
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 1253-1440

---

### 5. Search Page (`src/pages/Search.tsx`)

**Requirements:**
- Search input (debounced 300ms)
- Filters:
  - Content type (All, Movies, Series)
  - Genre dropdown
  - Year range
  - Rating range
- Sort options:
  - Relevance
  - Rating
  - Release year
  - Title (A-Z)
- Results grid (responsive)
- Pagination or infinite scroll
- Empty state message

**API Calls:**
```typescript
contentAPI.searchContent({
  q: searchQuery,
  contentType,
  genre,
  minRating,
  page,
  limit: 24
})
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 620-680

---

### 6. My Library Page (`src/pages/MyLibrary.tsx`)

**Requirements:**
- "Continue Watching" section at top
- Filter tabs: All | Movies | Series
- Content grid with purchased items
- Show watch progress bar on each card
- "Completed" badge for finished content
- Empty state if no purchases

**API Calls:**
```typescript
userAPI.getLibrary()
userAPI.getWatchHistory()
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 682-730

---

### 7. Profile Page (`src/pages/Profile.tsx`)

**Requirements:**
- 4 tabs:
  1. **Account**: Edit username, phone, change password
  2. **Wallet**: Coin balance, buy coins button, transaction history
  3. **History**: Watch history, purchase history
  4. **Settings**: Preferences, delete account
- Form validation
- Success/error toasts
- Confirmation modals for destructive actions

**API Calls:**
```typescript
userAPI.getCurrentUser()
userAPI.updateProfile({ username, phoneNumber })
userAPI.changePassword({ oldPassword, newPassword })
userAPI.getWallet()
userAPI.getWatchHistory()
paymentAPI.getTransactions()
```

**See:** `USER_FRONTEND_REQUIREMENTS.md` lines 732-820

---

### 8. Navbar Component (`src/components/layout/Navbar.tsx`)

**Requirements:**
- Logo (🎬 emoji + "Cineranda" text)
- Navigation links:
  - Home
  - Movies
  - Series
  - My Library
- Search icon (opens search page)
- Notifications icon with badge
- Profile dropdown:
  - Username
  - Profile
  - Settings
  - Logout
- Sticky positioning
- Mobile: Hamburger menu

**Style:**
```css
background: rgba(0, 0, 0, 0.9)
backdrop-filter: blur(10px)
position: sticky
top: 0
z-index: var(--z-sticky)
```

---

## 🎬 Development Workflow

### Step-by-Step Guide

1. **Start with Layout**
   ```bash
   # Create Navbar, Footer, Layout components
   # These wrap all pages
   ```

2. **Build Browse Page**
   ```bash
   # Create ContentCard component
   # Create ContentRow component
   # Create FeaturedHero component
   # Integrate with content API
   ```

3. **Add Content Details**
   ```bash
   # Create content details page
   # Add rating component
   # Integrate purchase button
   ```

4. **Implement Payment**
   ```bash
   # Create PaymentModal component
   # Integrate Flutterwave
   # Add payment status polling
   ```

5. **Build Video Player**
   ```bash
   # Install video.js: npm install video.js
   # Create VideoPlayer component
   # Add progress tracking
   # Add keyboard shortcuts
   ```

6. **Complete Remaining Pages**
   ```bash
   # Search page
   # My Library page
   # Profile page
   ```

7. **Polish & Test**
   ```bash
   # Add loading states
   # Test responsive design
   # Fix bugs
   # Optimize performance
   ```

---

## 🧪 Testing

```bash
# Run tests (when added)
npm run test

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

---

## 📚 Additional Resources

- **Full Requirements**: `USER_FRONTEND_REQUIREMENTS.md` (2,060 lines)
- **API Documentation**: See backend repository
- **Video.js Docs**: https://videojs.com/
- **React Router v6**: https://reactrouter.com/
- **Flutterwave Integration**: https://developer.flutterwave.com/

---

## 🤝 Contributing

1. Follow the design system strictly (black, yellow, red theme)
2. Use TypeScript for all new code
3. Add proper error handling
4. Test on mobile, tablet, and desktop
5. Keep components small and reusable
6. Document complex logic

---

## 📝 Notes

- **Token Management**: Handled automatically by axios interceptor
- **Error Handling**: All API calls are wrapped in try-catch
- **Responsive Design**: Mobile-first approach
- **Performance**: Code splitting via lazy loading
- **Security**: All inputs are validated and sanitized

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**For detailed specifications, refer to `USER_FRONTEND_REQUIREMENTS.md`**

**Built with ❤️ for Cineranda**
