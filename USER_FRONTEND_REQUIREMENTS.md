# Cineranda User Frontend - Complete Development Specification

## 🎯 Project Overview

**Project Name:** Cineranda User Web Application  
**Type:** Streaming Platform Frontend (User-Facing)  
**Tech Stack:** React + TypeScript + Vite  
**Theme:** Black, Yellow (#FFD700), Red (#E50914)  
**API Base URL:** `https://api.cineranda.com` (or your backend URL)

---

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Design System](#design-system)
3. [Authentication System](#authentication-system)
4. [Page-by-Page Requirements](#page-by-page-requirements)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Payment Integration](#payment-integration)
8. [Video Player Requirements](#video-player-requirements)
9. [Responsive Design](#responsive-design)
10. [Performance Requirements](#performance-requirements)

---

## 1. Project Setup

### Technology Stack

```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "build-tool": "Vite",
  "routing": "react-router-dom v6",
  "http-client": "axios",
  "video-player": "video.js or react-player",
  "icons": "react-icons",
  "styling": "CSS Modules or Styled Components",
  "state-management": "React Context API + useState/useReducer",
  "form-handling": "React Hook Form (optional)",
  "notifications": "react-toastify or custom toast"
}
```

### Project Structure

```
cineranda-web/
├── public/
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── api/
│   │   ├── axios.ts              # Axios instance with interceptors
│   │   ├── auth.ts               # Auth API calls
│   │   ├── content.ts            # Content API calls
│   │   ├── payment.ts            # Payment API calls
│   │   └── user.ts               # User API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── content/
│   │   │   ├── ContentCard.tsx
│   │   │   ├── ContentRow.tsx
│   │   │   ├── FeaturedHero.tsx
│   │   │   └── RatingStars.tsx
│   │   ├── player/
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── PlayerControls.tsx
│   │   │   └── EpisodeSelector.tsx
│   │   └── payment/
│   │       ├── PaymentModal.tsx
│   │       └── PricingCard.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useContent.ts
│   │   └── usePayment.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Browse.tsx
│   │   ├── ContentDetails.tsx
│   │   ├── Watch.tsx
│   │   ├── Search.tsx
│   │   ├── MyLibrary.tsx
│   │   ├── Profile.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   └── NotFound.tsx
│   ├── types/
│   │   ├── content.ts
│   │   ├── user.ts
│   │   └── payment.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── animations.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 2. Design System

### Color Palette

```css
:root {
  /* Primary Colors */
  --primary-yellow: #FFD700;
  --primary-yellow-hover: #FFC700;
  --primary-yellow-light: #FFED4E;
  
  /* Accent Colors */
  --accent-red: #E50914;
  --accent-red-hover: #C40812;
  
  /* Background Colors */
  --bg-black: #000000;
  --bg-dark: #0a0a0a;
  --bg-card: #141414;
  --bg-panel: #1a1a1a;
  
  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #808080;
  
  /* Border & Shadow */
  --border-color: #2d2d2d;
  --shadow-yellow: rgba(255, 215, 0, 0.3);
  --shadow-black: rgba(0, 0, 0, 0.5);
}
```

### Typography

```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Arial, sans-serif;

/* Font Sizes */
--fs-xs: 12px;
--fs-sm: 14px;
--fs-base: 16px;
--fs-lg: 18px;
--fs-xl: 20px;
--fs-2xl: 24px;
--fs-3xl: 32px;
--fs-4xl: 48px;
--fs-hero: 64px;

/* Font Weights */
--fw-normal: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;
--fw-extrabold: 800;
--fw-black: 900;
```

### Spacing System

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Component Styles

#### Buttons

```css
/* Primary Button (Yellow) */
.btn-primary {
  background: var(--primary-yellow);
  color: #000000;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px var(--shadow-yellow);
}

.btn-primary:hover {
  background: var(--primary-yellow-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--shadow-yellow);
}

/* Secondary Button (Red) */
.btn-secondary {
  background: var(--accent-red);
  color: #ffffff;
  /* ... same styles as primary */
}

/* Ghost Button */
.btn-ghost {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}
```

#### Cards

```css
.content-card {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.content-card:hover {
  transform: scale(1.05) translateY(-8px);
  box-shadow: 0 12px 32px var(--shadow-yellow);
}
```

---

## 3. Authentication System

### User Authentication Flow

#### Registration
- **Endpoint:** `POST /api/auth/register`
- **Fields:**
  - Username (unique, 3-20 characters)
  - Email (valid email format)
  - Password (min 8 characters, must include uppercase, lowercase, number)
  - Phone Number (optional, Rwandan format: +250XXXXXXXXX)
  - Terms & Conditions acceptance (checkbox)

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Fields:**
  - Email or Username
  - Password
- **Response:**
  - Access Token (JWT)
  - Refresh Token
  - User object

#### Token Management
```typescript
// Store in localStorage or httpOnly cookie
interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Axios interceptor for auto token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token logic
      const newToken = await refreshAccessToken()
      // Retry original request
    }
  }
)
```

#### Protected Routes
```typescript
// Wrap protected pages with auth check
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" />
  
  return children
}
```

---

## 4. Page-by-Page Requirements

### 4.1 Landing Page / Home (`/`)

**Purpose:** First impression, showcase platform features, drive sign-ups

**Layout:**
```
┌─────────────────────────────────────┐
│         NAVBAR (STICKY)             │
├─────────────────────────────────────┤
│                                     │
│     HERO SECTION (Full Width)      │
│  - Background: Featured content    │
│  - Overlay gradient                │
│  - Headline: "Stream Premium Movies"│
│  - CTA: "Start Watching" (Yellow)  │
│                                     │
├─────────────────────────────────────┤
│   FEATURES SECTION                  │
│  📺 4K Quality | 🎬 Latest Movies   │
│  💳 Flexible Payment | 📱 Any Device│
├─────────────────────────────────────┤
│   CONTENT PREVIEW                   │
│  - Horizontal scroll of cards      │
│  - "Trending Now" section          │
│  - Limited to 10 items             │
├─────────────────────────────────────┤
│   PRICING SECTION                   │
│  - Pay per content model           │
│  - Coin system explanation         │
├─────────────────────────────────────┤
│         FOOTER                      │
└─────────────────────────────────────┘
```

**Key Features:**
- Animated hero background (video or gradient)
- Smooth scroll animations
- Featured content carousel
- "Sign Up" CTA prominently displayed
- Mobile responsive

---

### 4.2 Browse Page (`/browse`)

**Purpose:** Main content discovery page for logged-in users

**Layout:**
```
┌─────────────────────────────────────┐
│    NAVBAR (with search, profile)    │
├─────────────────────────────────────┤
│                                     │
│   FEATURED HERO SECTION             │
│  - Largest/best rated content      │
│  - Title, rating, year, genre      │
│  - "Play Now" + "More Info" btns   │
│  - Auto-rotating (5 items max)     │
│                                     │
├─────────────────────────────────────┤
│   🔥 TRENDING NOW                   │
│  [Card][Card][Card][Card][Card]    │
│  ←────────────────────────────→    │
│         (Horizontal Scroll)         │
├─────────────────────────────────────┤
│   🎬 POPULAR MOVIES                 │
│  [Card][Card][Card][Card][Card]    │
├─────────────────────────────────────┤
│   📺 TOP SERIES                     │
│  [Card][Card][Card][Card][Card]    │
├─────────────────────────────────────┤
│   🆕 NEW RELEASES                   │
│  [Card][Card][Card][Card][Card]    │
├─────────────────────────────────────┤
│   🎭 BY GENRE                       │
│  [Action][Drama][Comedy][Thriller]  │
└─────────────────────────────────────┘
```

**Content Card Design:**
- Aspect ratio: 2:3 (portrait poster)
- Hover effect: Scale up 1.05x, show overlay
- Overlay displays:
  - Title
  - Rating (stars)
  - Year
  - "Play" button (yellow)
  - "Info" icon button
  - Price badge (top-right corner)

**API Calls:**
```typescript
// Fetch published content
GET /api/content?limit=50&isPublished=true

// Filter by type
GET /api/content?contentType=Movie
GET /api/content?contentType=Series

// Sort by rating
GET /api/content?sortBy=averageRating&order=desc
```

**Features:**
- Infinite horizontal scroll per section
- Lazy loading images
- Skeleton loaders while fetching
- Auto-refresh featured hero every 7 seconds
- Genre filter chips

---

### 4.3 Content Details Page (`/content/:id`)

**Purpose:** Detailed view of movie/series with purchase/play options

**Layout:**
```
┌─────────────────────────────────────┐
│            NAVBAR                   │
├─────────────────────────────────────┤
│                                     │
│     HERO BANNER (70vh)              │
│  Background: Banner image + gradient│
│                                     │
│  Left Column (60%):                 │
│    - Content Type Badge             │
│    - Title (64px, bold)             │
│    - Rating ⭐ 4.5 (200 reviews)    │
│    - Year | Duration | Genres       │
│    - Description (3-4 lines)        │
│    - [Watch Now] [Add to List]     │
│    - Price: 2,500 RWF or 50 Coins  │
│                                     │
│  Right Column (40%):                │
│    - Poster image (floating)        │
│                                     │
├─────────────────────────────────────┤
│   CONTENT INFO TABS                 │
│  [Overview] [Episodes] [Cast] [More]│
├─────────────────────────────────────┤
│   OVERVIEW TAB                      │
│  - Full description                 │
│  - Director, Cast list              │
│  - Release date                     │
│  - Language, Subtitles              │
├─────────────────────────────────────┤
│   EPISODES TAB (if Series)          │
│  Season 1 ▼                         │
│  [Ep 1: Title - 45min] [Play] [🔒] │
│  [Ep 2: Title - 42min] [Play] [🔒] │
│  [Ep 3: Title - 48min] [Play] [🔒] │
├─────────────────────────────────────┤
│   SIMILAR CONTENT                   │
│  "More Like This"                   │
│  [Card][Card][Card][Card]           │
└─────────────────────────────────────┘
```

**Key Features:**

1. **Purchase Flow:**
   - If user hasn't purchased: Show "Buy Now" button
   - Click opens payment modal
   - Options: Pay with Flutterwave (Mobile Money/Cards) or Coins
   - After purchase: Button changes to "Watch Now"

2. **Episode List (Series):**
   - Grouped by season
   - Expandable/collapsible seasons
   - Each episode shows:
     - Thumbnail
     - Episode number & title
     - Duration
     - Brief description
     - Lock icon (🔒) if not purchased

3. **Trailer Section:**
   - If trailerUrl exists, show embedded video player
   - Autoplay on mute option
   - Full-screen capability

4. **Rating System:**
   - Display average rating (stars + number)
   - Allow user to rate (1-5 stars)
   - POST to `/api/content/:id/rate`

**API Calls:**
```typescript
// Fetch content details
GET /api/content/:id

// Check if user owns content
GET /api/users/me/library

// Rate content
POST /api/content/:id/rate
Body: { rating: 4.5 }

// Get similar content
GET /api/content?genres=Action,Thriller&limit=10
```

---

### 4.4 Watch Page (`/watch/:id`)

**Purpose:** Full-screen video player for purchased content

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         VIDEO PLAYER                │
│         (Full Screen)               │
│                                     │
│  Controls (on hover):               │
│  [◄◄ 10s] [▶] [10s ►►]             │
│  ━━━━━━●━━━━━━━━ 45:23 / 1:32:45  │
│  [🔊] [CC] [⚙️] [⛶]                │
│                                     │
├─────────────────────────────────────┤
│   EXIT PLAYER / BACK TO DETAILS     │
├─────────────────────────────────────┤
│   EPISODE SELECTOR (if Series)      │
│  ← Prev | Episode 3 | Next →       │
│                                     │
│  Season 1:                          │
│  [E1] [E2] [E3 ACTIVE] [E4] [E5]   │
└─────────────────────────────────────┘
```

**Video Player Requirements:**

1. **Player Library:** Use `video.js` or `react-player`

2. **Features:**
   - Play/Pause
   - Progress bar with seek
   - Volume control
   - Playback speed (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x)
   - Quality selector (if multiple qualities available)
   - Subtitles/Captions (if available)
   - Fullscreen
   - Picture-in-Picture
   - Keyboard shortcuts:
     - Space: Play/Pause
     - Left/Right arrows: Seek ±10s
     - Up/Down arrows: Volume
     - F: Fullscreen
     - M: Mute

3. **Auto-Next Episode:**
   - Show countdown timer (10 seconds)
   - "Playing next episode in 10... 9... 8..."
   - "Cancel" button to stop auto-play

4. **Watch Progress Tracking:**
   - Save watch position every 5 seconds
   - POST to `/api/users/watch-history`
   - Resume from last position on page load

5. **Access Control:**
   - Verify user has purchased content
   - Check token validity
   - Handle expired sessions gracefully

**API Integration:**
```typescript
// Verify purchase before loading video
GET /api/users/me/library
Response: { purchasedContent: [{ contentId, purchaseDate }] }

// Get video URL (may be signed URL from S3)
GET /api/content/:id/stream
Response: { videoUrl: "https://...", expiresAt: "..." }

// Track watch progress
POST /api/users/watch-history
Body: {
  contentId: "...",
  episodeId: "...", // if series
  watchedDuration: 2743, // seconds
  totalDuration: 5400
}

// Get watch progress
GET /api/users/watch-history/:contentId
Response: { lastPosition: 2743, completed: false }
```

---

### 4.5 Search Page (`/search`)

**Purpose:** Allow users to search for content by title, genre, cast, etc.

**Layout:**
```
┌─────────────────────────────────────┐
│            NAVBAR                   │
├─────────────────────────────────────┤
│                                     │
│   ┌─────────────────────────────┐  │
│   │ 🔍 Search for movies, series│  │
│   └─────────────────────────────┘  │
│                                     │
│   Filters:                          │
│   [All] [Movies] [Series]           │
│   Genre: [Action ▼] Year: [2024 ▼] │
│   Sort: [Relevance ▼]               │
│                                     │
├─────────────────────────────────────┤
│   SEARCH RESULTS (Grid)             │
│                                     │
│  [Card] [Card] [Card] [Card]        │
│  [Card] [Card] [Card] [Card]        │
│  [Card] [Card] [Card] [Card]        │
│                                     │
│   Showing 1-24 of 156 results       │
│   [Load More]                       │
└─────────────────────────────────────┘
```

**Search Features:**

1. **Real-time Search:**
   - Debounced input (300ms delay)
   - Show results as user types
   - Loading indicator

2. **Filters:**
   - Content Type: All, Movies, Series
   - Genre: Multi-select
   - Release Year: Range or dropdown
   - Rating: Minimum stars
   - Price: Range slider

3. **Sort Options:**
   - Relevance (default)
   - Rating (high to low)
   - Release Date (newest first)
   - Price (low to high)
   - Title (A-Z)

**API Calls:**
```typescript
// Search query
GET /api/content/search?q=inception&contentType=Movie&genre=Action&minRating=4

// With pagination
GET /api/content/search?q=inception&page=1&limit=24
```

---

### 4.6 My Library Page (`/my-library`)

**Purpose:** Display all content purchased by the user

**Layout:**
```
┌─────────────────────────────────────┐
│            NAVBAR                   │
├─────────────────────────────────────┤
│                                     │
│   MY LIBRARY                        │
│   Your purchased content            │
│                                     │
│   Tabs: [All] [Movies] [Series]    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   CONTENT GRID                      │
│  [Card] [Card] [Card] [Card]        │
│  [Card] [Card] [Card] [Card]        │
│                                     │
│  - Each card shows:                 │
│    • Progress bar (if started)      │
│    • "Resume Watching" badge        │
│    • "Completed" checkmark          │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Show only purchased content
- Display watch progress
- "Continue Watching" section at top
- Filter by content type
- Remove from library option

**API Calls:**
```typescript
// Get user's purchased content
GET /api/users/me/library

// Get watch history
GET /api/users/me/watch-history
```

---

### 4.7 Profile Page (`/profile`)

**Purpose:** User account management

**Layout:**
```
┌─────────────────────────────────────┐
│            NAVBAR                   │
├─────────────────────────────────────┤
│                                     │
│   PROFILE HEADER                    │
│   Avatar | Username                 │
│   Email | Member since 2024         │
│                                     │
├─────────────────────────────────────┤
│   TABS                              │
│  [Account] [Wallet] [History] [Settings]
├─────────────────────────────────────┤
│                                     │
│   ACCOUNT TAB                       │
│   - Edit username                   │
│   - Email (read-only)               │
│   - Phone number                    │
│   - Password change                 │
│   - [Save Changes] button           │
│                                     │
├─────────────────────────────────────┤
│   WALLET TAB                        │
│   Coin Balance: 150 Coins          │
│   [Buy Coins] button                │
│                                     │
│   Transaction History:              │
│   Date | Description | Amount       │
│   ────────────────────────────────  │
│   Nov 15 | Purchased Movie | -50    │
│   Nov 10 | Bought Coins | +100      │
│                                     │
├─────────────────────────────────────┤
│   HISTORY TAB                       │
│   - Watch history                   │
│   - Purchase history                │
│                                     │
├─────────────────────────────────────┤
│   SETTINGS TAB                      │
│   - Language preference             │
│   - Video quality preference        │
│   - Autoplay next episode           │
│   - [Delete Account] (red button)   │
└─────────────────────────────────────┘
```

**API Calls:**
```typescript
// Get user profile
GET /api/users/me

// Update profile
PUT /api/users/me
Body: { username, phoneNumber }

// Change password
POST /api/auth/change-password
Body: { oldPassword, newPassword }

// Get wallet balance
GET /api/users/me/wallet

// Get transactions
GET /api/transactions/me
```

---

## 5. API Integration

### Base Configuration

```typescript
// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'https://api.cineranda.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        
        localStorage.setItem('accessToken', data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
```

### API Modules

#### Content API
```typescript
// src/api/content.ts
import api from './axios'

export const contentAPI = {
  // Get all published content
  getAll: (params?: {
    limit?: number
    page?: number
    contentType?: 'Movie' | 'Series'
    sortBy?: string
    order?: 'asc' | 'desc'
  }) => api.get('/api/content', { params }),
  
  // Get single content
  getById: (id: string) => api.get(`/api/content/${id}`),
  
  // Search content
  search: (query: string, filters?: any) => 
    api.get('/api/content/search', { params: { q: query, ...filters } }),
  
  // Rate content
  rate: (id: string, rating: number) => 
    api.post(`/api/content/${id}/rate`, { rating }),
  
  // Get streaming URL
  getStreamUrl: (id: string) => 
    api.get(`/api/content/${id}/stream`)
}
```

#### Auth API
```typescript
// src/api/auth.ts
export const authAPI = {
  // Register
  register: (data: {
    username: string
    email: string
    password: string
    phoneNumber?: string
  }) => api.post('/api/auth/register', data),
  
  // Login
  login: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login', credentials),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
  
  // Refresh token
  refresh: (refreshToken: string) => 
    api.post('/api/auth/refresh', { refreshToken }),
  
  // Forgot password
  forgotPassword: (email: string) => 
    api.post('/api/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token: string, newPassword: string) => 
    api.post('/api/auth/reset-password', { token, newPassword })
}
```

#### User API
```typescript
// src/api/user.ts
export const userAPI = {
  // Get current user
  getMe: () => api.get('/api/users/me'),
  
  // Update profile
  updateMe: (data: Partial<User>) => api.put('/api/users/me', data),
  
  // Get library (purchased content)
  getLibrary: () => api.get('/api/users/me/library'),
  
  // Get wallet info
  getWallet: () => api.get('/api/users/me/wallet'),
  
  // Get watch history
  getWatchHistory: () => api.get('/api/users/me/watch-history'),
  
  // Update watch progress
  updateWatchProgress: (data: {
    contentId: string
    episodeId?: string
    watchedDuration: number
    totalDuration: number
  }) => api.post('/api/users/watch-history', data)
}
```

#### Payment API
```typescript
// src/api/payment.ts
export const paymentAPI = {
  // Initiate payment
  initiatePayment: (data: {
    contentId: string
    paymentMethod: 'FLUTTERWAVE' | 'COINS'
    email?: string // for Flutterwave
    phoneNumber?: string // for Flutterwave
  }) => api.post('/api/transactions/purchase', data),
  
  // Check payment status
  checkPaymentStatus: (transactionId: string) => 
    api.get(`/api/transactions/${transactionId}/status`),
  
  // Buy coins
  buyCoins: (data: {
    amount: number // in RWF
    phoneNumber: string
  }) => api.post('/api/transactions/buy-coins', data),
  
  // Get transaction history
  getTransactions: () => api.get('/api/transactions/me')
}
```

---

## 6. State Management

### Auth Context

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  _id: string
  username: string
  email: string
  role: string
  coinWallet?: {
    balance: number
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken')
    if (token) {
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [])
  
  const login = async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }
  
  const register = async (registerData: RegisterData) => {
    const { data } = await authAPI.register(registerData)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
  }
  
  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }
  
  const refreshUser = async () => {
    try {
      const { data } = await userAPI.getMe()
      setUser(data.data)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

---

## 7. Payment Integration

### Payment Flow

#### Step 1: User clicks "Buy Now" on content details page

#### Step 2: Payment Modal Opens

```typescript
// PaymentModal Component
const PaymentModal = ({ content, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'FLUTTERWAVE' | 'COINS'>('FLUTTERWAVE')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handlePayment = async () => {
    setLoading(true)
    
    try {
      if (method === 'COINS') {
        // Check if user has enough coins
        const { data: wallet } = await userAPI.getWallet()
        if (wallet.balance < content.priceInCoins) {
          alert('Insufficient coins. Please buy more coins.')
          return
        }
      }
      
      // Initiate payment
      const { data } = await paymentAPI.initiatePayment({
        contentId: content._id,
        paymentMethod: method,
        phoneNumber: method === 'FLUTTERWAVE' ? phoneNumber : undefined,
        email: method === 'FLUTTERWAVE' ? email : undefined
      })
      
      // For Flutterwave: Redirect to payment page
      if (method === 'FLUTTERWAVE') {
        // Flutterwave returns a payment URL
        if (data.paymentUrl) {
          // Open Flutterwave payment modal or redirect
          window.open(data.paymentUrl, '_blank')
          
          // Poll for payment status
          const interval = setInterval(async () => {
            const { data: status } = await paymentAPI.checkPaymentStatus(data.transactionId)
            
            if (status.status === 'COMPLETED') {
              clearInterval(interval)
              toast.success('Payment successful!')
              onSuccess()
              onClose()
            } else if (status.status === 'FAILED') {
              clearInterval(interval)
              toast.error('Payment failed. Please try again.')
              setLoading(false)
            }
          }, 5000) // Check every 5 seconds
          
          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(interval)
            setLoading(false)
          }, 300000)
        }
      } else {
        // Coins payment is instant
        onSuccess()
        onClose()
      }
      
    } catch (error) {
      alert('Payment failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Modal>
      <h2>Purchase: {content.title}</h2>
      
      <div className="payment-methods">
        <button 
          className={method === 'FLUTTERWAVE' ? 'active' : ''}
          onClick={() => setMethod('FLUTTERWAVE')}
        >
          Pay with Flutterwave - {content.priceInRwf} RWF
        </button>
        
        <button 
          className={method === 'COINS' ? 'active' : ''}
          onClick={() => setMethod('COINS')}
        >
          Coins - {content.priceInCoins} Coins
        </button>
      </div>
      
      {method === 'FLUTTERWAVE' && (
        <>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="+250 XXX XXX XXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </>
      )}
      
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Confirm Payment'}
      </button>
    </Modal>
  )
}
```

### Flutterwave Payment Integration

**Payment Flow:**
1. Frontend sends payment request with user details (email, phone)
2. Backend initiates Flutterwave payment via API
3. Backend receives payment URL from Flutterwave
4. Frontend redirects user to Flutterwave hosted payment page
5. User selects payment method (Mobile Money: MTN, Airtel, or Card)
6. User completes payment on Flutterwave's secure page
7. Flutterwave sends webhook to backend on payment completion
8. Backend updates transaction status
9. Frontend polls for status update or receives redirect callback
10. On success: Add content to user's library

**Supported Payment Methods via Flutterwave:**
- Mobile Money (MTN Mobile Money Rwanda)
- Mobile Money (Airtel Money Rwanda)
- Credit/Debit Cards (Visa, Mastercard)
- Bank Transfer

**Flutterwave Integration Steps:**

```typescript
// Backend initiates payment
POST /api/transactions/flutterwave/initiate
Body: {
  contentId: string,
  email: string,
  phoneNumber: string,
  amount: number,
  currency: 'RWF'
}

Response: {
  transactionId: string,
  paymentUrl: string, // Flutterwave hosted payment link
  reference: string
}

// Flutterwave webhook (backend receives this)
POST /api/webhooks/flutterwave
Body: {
  event: 'charge.completed',
  data: {
    status: 'successful',
    tx_ref: 'transaction_reference',
    amount: 2500,
    currency: 'RWF',
    customer: { email, phone }
  }
}
```

---

## 8. Video Player Requirements

### Video.js Implementation

```typescript
// src/components/player/VideoPlayer.tsx
import React, { useRef, useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

interface VideoPlayerProps {
  videoUrl: string
  poster?: string
  startTime?: number
  onProgress?: (currentTime: number, duration: number) => void
  onEnded?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  poster,
  startTime = 0,
  onProgress,
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
      poster: poster,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'remainingTimeDisplay',
          'playbackRateMenuButton',
          'qualitySelector', // if multiple qualities
          'subtitlesButton',
          'pictureInPictureToggle',
          'fullscreenToggle'
        ]
      }
    })
    
    playerRef.current = player
    
    // Set video source
    player.src({
      src: videoUrl,
      type: 'video/mp4' // or detect from URL
    })
    
    // Start from saved position
    if (startTime > 0) {
      player.currentTime(startTime)
    }
    
    // Track progress
    player.on('timeupdate', () => {
      const currentTime = player.currentTime()
      const duration = player.duration()
      onProgress?.(currentTime, duration)
    })
    
    // Handle video end
    player.on('ended', () => {
      onEnded?.()
    })
    
    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
      }
    }
  }, [videoUrl])
  
  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
      />
    </div>
  )
}

export default VideoPlayer
```

### Keyboard Shortcuts

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!playerRef.current) return
    
    const player = playerRef.current
    
    switch (e.key) {
      case ' ': // Space - Play/Pause
        e.preventDefault()
        if (player.paused()) {
          player.play()
        } else {
          player.pause()
        }
        break
        
      case 'ArrowLeft': // Seek backward 10s
        e.preventDefault()
        player.currentTime(Math.max(0, player.currentTime() - 10))
        break
        
      case 'ArrowRight': // Seek forward 10s
        e.preventDefault()
        player.currentTime(Math.min(player.duration(), player.currentTime() + 10))
        break
        
      case 'ArrowUp': // Volume up
        e.preventDefault()
        player.volume(Math.min(1, player.volume() + 0.1))
        break
        
      case 'ArrowDown': // Volume down
        e.preventDefault()
        player.volume(Math.max(0, player.volume() - 0.1))
        break
        
      case 'f': // Fullscreen
      case 'F':
        e.preventDefault()
        if (player.isFullscreen()) {
          player.exitFullscreen()
        } else {
          player.requestFullscreen()
        }
        break
        
      case 'm': // Mute
      case 'M':
        e.preventDefault()
        player.muted(!player.muted())
        break
    }
  }
  
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

### Watch Progress Tracking

```typescript
// Save progress every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (playerRef.current && !playerRef.current.paused()) {
      const currentTime = playerRef.current.currentTime()
      const duration = playerRef.current.duration()
      
      userAPI.updateWatchProgress({
        contentId: content._id,
        episodeId: currentEpisode?._id,
        watchedDuration: Math.floor(currentTime),
        totalDuration: Math.floor(duration)
      })
    }
  }, 5000)
  
  return () => clearInterval(interval)
}, [content._id, currentEpisode])
```

---

## 9. Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  .navbar { padding: 16px 20px; }
  .hero-title { font-size: 32px; }
  .content-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .content-grid { grid-template-columns: repeat(3, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .content-grid { grid-template-columns: repeat(5, 1fr); }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .content-grid { grid-template-columns: repeat(6, 1fr); }
}
```

### Mobile Optimizations

- **Touch-friendly buttons:** Minimum 44px × 44px
- **Simplified navigation:** Hamburger menu
- **Reduced animations:** Respect `prefers-reduced-motion`
- **Optimized images:** Use responsive images (srcset)
- **Swipe gestures:** For carousels and sliders

---

## 10. Performance Requirements

### Performance Targets

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Optimization Strategies

1. **Code Splitting:**
```typescript
// Lazy load routes
const Home = lazy(() => import('./pages/Home'))
const Browse = lazy(() => import('./pages/Browse'))
const Watch = lazy(() => import('./pages/Watch'))

<Suspense fallback={<Loader />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/browse" element={<Browse />} />
    <Route path="/watch/:id" element={<Watch />} />
  </Routes>
</Suspense>
```

2. **Image Optimization:**
```typescript
// Use next-gen formats
<picture>
  <source srcSet={`${poster}.webp`} type="image/webp" />
  <source srcSet={`${poster}.jpg`} type="image/jpeg" />
  <img src={`${poster}.jpg`} alt={title} loading="lazy" />
</picture>
```

3. **API Caching:**
```typescript
// Cache frequently accessed data
const cache = new Map()

const getCachedContent = async (id: string) => {
  if (cache.has(id)) {
    return cache.get(id)
  }
  
  const { data } = await contentAPI.getById(id)
  cache.set(id, data)
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(id), 300000)
  
  return data
}
```

4. **Debounce Search:**
```typescript
const debouncedSearch = debounce((query: string) => {
  searchContent(query)
}, 300)
```

5. **Virtual Scrolling:**
For large lists (100+ items), implement virtual scrolling with `react-window` or `react-virtualized`

---

## 11. TypeScript Types

### Content Types

```typescript
// src/types/content.ts

export interface Content {
  _id: string
  title: string
  contentType: 'Movie' | 'Series'
  description?: string
  posterImageUrl?: string
  bannerImageUrl?: string
  trailerUrl?: string
  videoUrl?: string
  releaseYear?: number
  duration?: number
  genres?: string[]
  cast?: string[]
  director?: string[]
  averageRating?: number
  ratingCount?: number
  priceInRwf?: number
  priceInCoins?: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  seasons?: Season[]
}

export interface Season {
  _id: string
  seasonNumber: number
  episodes: Episode[]
}

export interface Episode {
  _id: string
  episodeNumber: number
  title: string
  description?: string
  duration?: number
  videoUrl?: string
  thumbnailUrl?: string
  releaseDate?: string
}
```

### User Types

```typescript
// src/types/user.ts

export interface User {
  _id: string
  username: string
  email: string
  phoneNumber?: string
  role: 'user' | 'admin'
  isActive: boolean
  coinWallet?: {
    balance: number
  }
  createdAt: string
  updatedAt: string
}

export interface UserLibrary {
  contentId: string
  content?: Content
  purchaseDate: string
  watchProgress?: {
    watchedDuration: number
    totalDuration: number
    lastWatchedAt: string
    completed: boolean
  }
}
```

### Payment Types

```typescript
// src/types/payment.ts

export interface Transaction {
  _id: string
  userId: string
  contentId?: string
  transactionType: 'PURCHASE' | 'COIN_BUY' | 'COIN_SPEND'
  paymentMethod: 'FLUTTERWAVE' | 'COINS'
  flutterwaveReference?: string
  amount: number
  currency: 'RWF' | 'COINS'
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  email?: string
  phoneNumber?: string
  createdAt: string
  updatedAt: string
}
```

---

## 12. Additional Features

### 12.1 Notifications System

**Toast Notifications:**
```typescript
import { toast } from 'react-toastify'

// Success
toast.success('Content purchased successfully!')

// Error
toast.error('Payment failed. Please try again.')

// Info
toast.info('Your video will resume from where you left off')

// Custom
toast(<CustomNotification />, {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
})
```

### 12.2 Error Handling

```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    console.error('Error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Oops! Something went wrong</h1>
          <p>We're working to fix this issue.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}
```

### 12.3 Loading States

```typescript
// Skeleton Loader for Content Cards
const ContentCardSkeleton = () => (
  <div className="skeleton-card">
    <div className="skeleton-poster" />
    <div className="skeleton-title" />
    <div className="skeleton-meta" />
  </div>
)

// Loading spinner
const Loader = () => (
  <div className="loader-container">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
)
```

### 12.4 SEO Optimization

```typescript
// Use react-helmet or react-helmet-async
import { Helmet } from 'react-helmet-async'

const ContentDetails = ({ content }) => (
  <>
    <Helmet>
      <title>{content.title} - Cineranda</title>
      <meta name="description" content={content.description} />
      <meta property="og:title" content={content.title} />
      <meta property="og:description" content={content.description} />
      <meta property="og:image" content={content.posterImageUrl} />
      <meta property="og:type" content="video.movie" />
    </Helmet>
    
    {/* Page content */}
  </>
)
```

---

## 13. Testing Requirements

### Unit Tests

```typescript
// Example test for ContentCard component
import { render, screen, fireEvent } from '@testing-library/react'
import ContentCard from './ContentCard'

describe('ContentCard', () => {
  const mockContent = {
    _id: '1',
    title: 'Test Movie',
    posterImageUrl: 'https://...',
    averageRating: 4.5,
    priceInRwf: 2500
  }
  
  it('renders content title', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText('Test Movie')).toBeInTheDocument()
  })
  
  it('calls onPlay when play button is clicked', () => {
    const onPlay = jest.fn()
    render(<ContentCard content={mockContent} onPlay={onPlay} />)
    
    const playButton = screen.getByText('Play')
    fireEvent.click(playButton)
    
    expect(onPlay).toHaveBeenCalledWith(mockContent)
  })
})
```

### Integration Tests

Test critical user flows:
- User registration and login
- Content purchase flow
- Video playback
- Search functionality

### E2E Tests (Optional)

Use Cypress or Playwright for end-to-end testing.

---

## 14. Deployment

### Environment Variables

```env
# .env.production
VITE_API_BASE_URL=https://api.cineranda.com
VITE_PAYMENT_PROVIDER=FLUTTERWAVE
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
VITE_CDN_URL=https://cdn.cineranda.com
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          player: ['video.js'],
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Build optimized for production
- [ ] HTTPS enabled
- [ ] CDN configured for static assets
- [ ] Error monitoring setup (Sentry, LogRocket)
- [ ] Analytics integrated (Google Analytics, Mixpanel)
- [ ] Performance monitoring (Lighthouse CI)
- [ ] SEO metadata complete
- [ ] Social media cards working
- [ ] Favicon and app icons added

---

## 15. Accessibility (a11y)

### WCAG 2.1 AA Compliance

```typescript
// Accessible button
<button
  aria-label="Play movie"
  onClick={handlePlay}
  disabled={loading}
  aria-disabled={loading}
>
  <PlayIcon aria-hidden="true" />
  <span>Play</span>
</button>

// Accessible form
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</form>

// Skip navigation link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:
- Tab navigation works properly
- Focus indicators visible
- No keyboard traps
- Logical tab order

---

## 16. Security Considerations

### XSS Prevention

```typescript
// Always sanitize user input
import DOMPurify from 'dompurify'

const SafeDescription = ({ html }) => {
  const clean = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### CSRF Protection

Include CSRF token in all mutating requests (handled by backend).

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' https://cdn.cineranda.com; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: https:; 
           media-src https://cdn.cineranda.com;">
```

### Video DRM (Optional)

For premium content, consider implementing DRM using:
- Widevine (Chrome, Firefox)
- FairPlay (Safari)
- PlayReady (Edge)

---

## 17. Analytics & Tracking

### Track User Events

```typescript
// Track page views
useEffect(() => {
  analytics.track('Page Viewed', {
    page: window.location.pathname,
    title: document.title
  })
}, [location])

// Track content interactions
const trackContentView = (content: Content) => {
  analytics.track('Content Viewed', {
    contentId: content._id,
    contentType: content.contentType,
    title: content.title
  })
}

const trackPurchase = (content: Content, amount: number, method: string) => {
  analytics.track('Content Purchased', {
    contentId: content._id,
    title: content.title,
    amount,
    method,
    currency: 'RWF'
  })
}

const trackVideoPlay = (content: Content) => {
  analytics.track('Video Played', {
    contentId: content._id,
    title: content.title
  })
}
```

---

## 18. Internationalization (i18n) - Future Enhancement

### Setup for multiple languages

```typescript
// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'nav.home': 'Home',
          'nav.movies': 'Movies',
          'nav.series': 'Series',
          'button.play': 'Play Now',
          'button.info': 'More Info'
        }
      },
      rw: {
        translation: {
          'nav.home': 'Ahabanza',
          'nav.movies': 'Amafilime',
          'nav.series': 'Ibiganiro',
          'button.play': 'Kina Nonaha',
          'button.info': 'Amakuru Menshi'
        }
      },
      fr: {
        translation: {
          'nav.home': 'Accueil',
          'nav.movies': 'Films',
          'nav.series': 'Séries',
          'button.play': 'Jouer Maintenant',
          'button.info': 'Plus d\'Info'
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
```

---

## 19. Final Checklist

### Must-Have Features (MVP)

- [x] User authentication (register, login, logout)
- [x] Browse content (movies & series)
- [x] Content details page
- [x] Search functionality
- [x] Video player with basic controls
- [x] Purchase flow (Flutterwave + Coins)
- [x] User library (purchased content)
- [x] Watch progress tracking
- [x] User profile & settings
- [x] Responsive design (mobile, tablet, desktop)

### Nice-to-Have Features (Post-MVP)

- [ ] Watchlist / Favorites
- [ ] Social sharing
- [ ] User reviews & comments
- [ ] Download for offline viewing
- [ ] Parental controls
- [ ] Multiple user profiles
- [ ] Recommendations engine
- [ ] Push notifications
- [ ] Chromecast / AirPlay support
- [ ] Subtitles management

---

## 20. Documentation

Create the following documentation files:

1. **README.md** - Project overview, setup instructions
2. **API_DOCS.md** - API endpoints and usage
3. **CONTRIBUTING.md** - How to contribute to the project
4. **CHANGELOG.md** - Version history and changes
5. **DEPLOYMENT.md** - Deployment process and configuration

---

## Summary

This is a comprehensive specification for building the Cineranda user-facing frontend. The platform should provide a Netflix-like experience with Flutterwave payment integration (supporting Mobile Money, Cards, and Bank Transfer) and a coin-based system.

**Key Technologies:**
- React + TypeScript + Vite
- Video.js for playback
- Axios for API calls
- Context API for state management
- Flutterwave payment integration

**Core User Flows:**
1. Browse → View Details → Purchase → Watch
2. Register → Login → Browse → Purchase → Watch
3. Search → Find Content → Purchase → Watch
4. Profile → Buy Coins → Purchase with Coins → Watch

**Design Philosophy:**
- Black background with yellow/gold accents
- Red for CTAs and important actions
- Clean, modern, Netflix-inspired UI
- Fast, responsive, accessible

This specification should be sufficient for any developer (human or AI) to build the complete user frontend for Cineranda.
