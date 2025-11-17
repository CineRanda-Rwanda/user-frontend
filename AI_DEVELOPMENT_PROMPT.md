# AI Development Prompt: Cineranda User Frontend

You are an expert full-stack developer specializing in React, TypeScript, and modern web applications. Your task is to build the complete user-facing frontend for **Cineranda**, a Netflix-style streaming platform for Rwanda.

## 📋 Your Mission

Build a production-ready, responsive web application that allows users to browse, purchase, and stream movies and TV series. The platform uses **Flutterwave** for payments and features a coin-based wallet system.

## 📎 Required Reading

**CRITICAL:** Before starting, thoroughly read the attached `USER_FRONTEND_REQUIREMENTS.md` file. This 2,000+ line document contains:
- Complete project structure
- Detailed design system (colors, typography, components)
- Every page specification with layouts
- Full API integration guide with code examples
- Payment flow with Flutterwave
- Video player implementation
- TypeScript type definitions
- Performance requirements
- Security considerations

## 🎯 What You Need to Build

### Core Pages (Priority Order)
1. **Authentication** (`/login`, `/register`) - User signup/signin
2. **Browse/Home** (`/browse`) - Main content discovery page with featured hero
3. **Content Details** (`/content/:id`) - Movie/series details with purchase option
4. **Watch Page** (`/watch/:id`) - Full-screen video player
5. **Search** (`/search`) - Content search with filters
6. **My Library** (`/my-library`) - User's purchased content
7. **Profile** (`/profile`) - Account management, wallet, settings

### Key Components
- **Navbar** - Sticky navigation with search, notifications, profile
- **Content Cards** - Hover effects, rating display, price badges
- **Video Player** - Video.js integration with controls, progress tracking
- **Payment Modal** - Flutterwave integration (Mobile Money, Cards)
- **Auth Forms** - Login, register, password reset

## 🎨 Design Requirements

### Theme (Strictly Follow)
```css
Primary: #FFD700 (Gold/Yellow) - Buttons, highlights, active states
Accent: #E50914 (Red) - CTAs, important actions, alerts
Background: #000000 (Black) - Primary background
Text: #ffffff (White) - Primary text
```

### Brand Identity
- **Name:** Cineranda
- **Logo:** 🎬 emoji in yellow gradient circle
- **Style:** Netflix-inspired, modern, premium feel
- **Mood:** Sleek, cinematic, easy to navigate

### UI Principles
- ✅ Dark theme by default (black background)
- ✅ Yellow for primary actions (Play, Buy, etc.)
- ✅ Red for secondary CTAs and alerts
- ✅ Smooth animations (0.3s transitions)
- ✅ Large, readable typography
- ✅ High contrast for accessibility
- ✅ Mobile-first responsive design

## 🔧 Technical Stack (Use These)

```json
{
  "framework": "React 18+ with TypeScript",
  "build": "Vite",
  "routing": "react-router-dom v6",
  "http": "axios",
  "video": "video.js or react-player",
  "icons": "react-icons",
  "styling": "CSS Modules or plain CSS",
  "state": "React Context API",
  "notifications": "react-toastify"
}
```

## 🔌 API Integration

### Base Configuration
```typescript
Base URL: https://api.cineranda.com (or provided URL)
Auth: Bearer token in Authorization header
Token Storage: localStorage (accessToken, refreshToken)
Auto-refresh: Implement token refresh on 401 errors
```

### Key Endpoints (from requirements doc)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/content` - Fetch all published content
- `GET /api/content/:id` - Get single content details
- `GET /api/content/search` - Search content
- `POST /api/transactions/purchase` - Initiate Flutterwave payment
- `GET /api/transactions/:id/status` - Check payment status
- `GET /api/users/me/library` - User's purchased content
- `POST /api/users/watch-history` - Track watch progress

**Important:** All API details, request/response formats, and error handling are in the requirements document.

## 💳 Flutterwave Payment Integration

### Flow
1. User clicks "Buy Now" on content
2. Show payment modal with two options:
   - **Flutterwave** (Mobile Money/Cards) - Email + Phone required
   - **Coins** (User's wallet balance)
3. For Flutterwave:
   - Call backend: `POST /api/transactions/purchase`
   - Backend returns `paymentUrl` from Flutterwave
   - Open payment URL in new window/modal
   - Poll `GET /api/transactions/:id/status` every 5 seconds
   - On success: Update UI, add to library
4. For Coins:
   - Instant deduction from wallet
   - Immediate access granted

### Payment Modal Fields
```typescript
// Flutterwave payment
{
  email: string (required)
  phoneNumber: string (required, format: +250XXXXXXXXX)
  contentId: string
  paymentMethod: 'FLUTTERWAVE'
}

// Coin payment
{
  contentId: string
  paymentMethod: 'COINS'
}
```

## 🎬 Video Player Requirements

### Must-Have Features
- ✅ Play/Pause
- ✅ Progress bar with seek
- ✅ Volume control
- ✅ Playback speed (0.5x to 2x)
- ✅ Fullscreen toggle
- ✅ Keyboard shortcuts (Space, Arrow keys, F, M)
- ✅ Auto-save watch position (every 5 seconds)
- ✅ Resume from last position
- ✅ Auto-play next episode (for series, 10s countdown)

### Episode Selector (for Series)
- Display all seasons and episodes
- Lock icon (🔒) for unpurchased episodes
- Thumbnail, title, duration for each episode
- Highlight currently playing episode

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px (2 columns grid)
- Tablet: 641px - 1024px (3-4 columns)
- Desktop: 1025px+ (5-6 columns)

### Mobile Optimizations
- Hamburger menu for navigation
- Larger touch targets (min 44px)
- Simplified filters
- Optimized images

## 🚀 Performance Requirements

- First Contentful Paint < 1.5s
- Lazy load images (use `loading="lazy"`)
- Code splitting for routes
- Debounce search input (300ms)
- Cache API responses (5 minutes)
- Optimize video player bundle

## 🔒 Security Checklist

- ✅ Sanitize all user inputs (use DOMPurify)
- ✅ Verify content ownership before playing video
- ✅ Handle token expiration gracefully
- ✅ Use HTTPS for all API calls
- ✅ Never expose API keys in frontend
- ✅ Validate forms client-side

## 📊 Required Features

### Authentication
- [x] User registration (username, email, password)
- [x] Login with email/username
- [x] Logout
- [x] Token refresh
- [x] Protected routes (redirect to login if not authenticated)

### Content Browsing
- [x] Featured hero section (auto-rotating)
- [x] Horizontal scrolling content rows
- [x] Content cards with hover effects
- [x] Filter by type (Movie/Series)
- [x] Genre tags
- [x] Rating display (stars)

### Content Details
- [x] Full-screen hero banner
- [x] Title, description, metadata
- [x] Rating system
- [x] Cast & director info
- [x] Season/episode list (for series)
- [x] "Watch Now" button (if owned)
- [x] "Buy Now" button (if not owned)
- [x] Trailer player (if available)

### Video Player
- [x] Verify user owns content before loading
- [x] Full playback controls
- [x] Progress tracking (save every 5s)
- [x] Resume from last position
- [x] Episode selector (for series)
- [x] Auto-next episode with countdown

### Payment
- [x] Payment modal with method selection
- [x] Flutterwave integration
- [x] Coin wallet integration
- [x] Payment status polling
- [x] Success/failure notifications

### User Profile
- [x] Edit account info
- [x] Change password
- [x] View wallet balance
- [x] Buy coins (via Flutterwave)
- [x] Transaction history
- [x] Watch history

### Search
- [x] Real-time search (debounced)
- [x] Filter by type, genre, year, rating
- [x] Sort options
- [x] Pagination or infinite scroll

### My Library
- [x] Display purchased content
- [x] Show watch progress
- [x] "Continue Watching" section
- [x] Filter by type

## 🎨 Component Examples (Reference)

### Content Card (Hover Effect)
```typescript
// On hover: scale(1.05), show overlay with Play button
// Display: Title, Rating, Year, Price badge
// Click: Navigate to content details
```

### Navbar
```typescript
// Sticky top navigation
// Left: Logo + Nav links (Home, Movies, Series, My Library)
// Right: Search, Notifications, Profile
// Mobile: Hamburger menu
```

### Payment Modal
```typescript
// Tabs: Flutterwave | Coins
// Flutterwave: Email + Phone inputs, "Pay Now" button
// Coins: Show balance, "Confirm Purchase" button
// Loading state during payment
// Success/Error toasts
```

## 📝 Coding Standards

### TypeScript
- Use strict mode
- Define interfaces for all data types
- Avoid `any` type
- Use proper typing for API responses

### React Best Practices
- Functional components only
- Use hooks (useState, useEffect, useContext, etc.)
- Custom hooks for reusable logic (useAuth, useContent)
- Proper cleanup in useEffect
- Memoize expensive computations

### Error Handling
```typescript
// Always wrap API calls in try-catch
try {
  const { data } = await api.get('/content')
  setContent(data)
} catch (error) {
  console.error(error)
  toast.error('Failed to load content')
  setError(error.message)
}
```

### Naming Conventions
- Components: PascalCase (ContentCard.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts)
- API functions: camelCase (getContent, purchaseContent)
- CSS classes: kebab-case (content-card, hero-section)

## 🧪 Testing (Optional but Recommended)

- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical flows (login, purchase, watch)

## 📦 Deliverables

### Required Files/Folders
```
cineranda-web/
├── src/
│   ├── pages/ (all 7 pages)
│   ├── components/ (navbar, cards, modals, etc.)
│   ├── api/ (axios config, API modules)
│   ├── contexts/ (Auth, User)
│   ├── hooks/ (custom hooks)
│   ├── types/ (TypeScript definitions)
│   ├── styles/ (global CSS)
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### README Requirements
- Project setup instructions
- Environment variables needed
- How to run locally
- Build for production
- API documentation link

## 🎯 Success Criteria

Your implementation will be successful when:

1. ✅ All 7 core pages are functional
2. ✅ User can register, login, browse content
3. ✅ Payment flow works (Flutterwave integration)
4. ✅ Video player works with progress tracking
5. ✅ Search and filters work
6. ✅ Responsive on mobile, tablet, desktop
7. ✅ Fast load times (< 3s)
8. ✅ No console errors
9. ✅ Clean, maintainable code
10. ✅ Follows design system (black/yellow/red theme)

## 🚦 Getting Started

1. **Read the requirements doc thoroughly** (30-45 minutes)
2. **Set up project** with Vite + React + TypeScript
3. **Install dependencies** (react-router-dom, axios, video.js, react-icons, react-toastify)
4. **Create folder structure** as specified
5. **Implement auth first** (login/register pages + AuthContext)
6. **Build navbar** (needed on every page)
7. **Implement browse page** (home feed with content cards)
8. **Add content details page**
9. **Integrate payment modal**
10. **Build video player**
11. **Complete remaining pages** (search, library, profile)
12. **Polish UI** (animations, responsive design)
13. **Test thoroughly** (all flows, all devices)

## 💡 Important Notes

- **The requirements document is your bible** - All details are there
- **Design system is strict** - Yellow (#FFD700) for primary, Red (#E50914) for CTAs
- **Flutterwave handles all payments** - No direct Mobile Money integration
- **Video player is critical** - Spend time getting it right
- **Mobile users are important** - Test on small screens
- **Performance matters** - Optimize images and code
- **Security is non-negotiable** - Validate, sanitize, protect routes

## 🆘 If You Get Stuck

1. Re-read the relevant section in requirements doc
2. Check code examples in the requirements doc
3. Look at TypeScript type definitions provided
4. Test API endpoints with Postman/Insomnia first
5. Console.log liberally during development
6. Ask specific questions with context

## 🎬 Final Words

You're building a premium streaming platform. Think Netflix quality. Users should feel like they're using a professional, polished product. Every animation should be smooth, every interaction should feel intuitive, every page should load fast.

The requirements document has everything you need. Follow it closely, write clean code, and you'll build something amazing.

**Now go build Cineranda! 🚀**

---

## Attachment Required

📎 **USER_FRONTEND_REQUIREMENTS.md** - The complete technical specification (2,060 lines)

This file contains:
- ✅ Complete project structure
- ✅ Design system specifications
- ✅ All API endpoints and integration
- ✅ Payment flow with Flutterwave
- ✅ Video player implementation
- ✅ TypeScript type definitions
- ✅ Performance requirements
- ✅ Security considerations
- ✅ Code examples for every feature

**Attach this file to your conversation and refer to it constantly throughout development.**
