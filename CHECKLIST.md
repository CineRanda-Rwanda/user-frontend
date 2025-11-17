# 🎬 Cineranda Development Checklist

Use this checklist to track your progress building the remaining features.

---

## ✅ Foundation (COMPLETE)

- [x] Project setup with Vite + React + TypeScript
- [x] Package.json with all dependencies
- [x] TypeScript configuration
- [x] Environment variables setup
- [x] Design system (colors, typography, spacing)
- [x] Global CSS and animations
- [x] Type definitions (Content, User, Payment, Auth)
- [x] API integration layer with interceptors
- [x] Auth API module
- [x] Content API module
- [x] User API module
- [x] Payment API module
- [x] Utility functions (formatters, validators)
- [x] Constants file
- [x] AuthContext with authentication logic
- [x] Button component
- [x] Input/Textarea/Select components
- [x] Modal component
- [x] Loader component
- [x] Login page
- [x] Register page
- [x] 404 Not Found page
- [x] Protected routes
- [x] Public routes
- [x] App routing setup
- [x] Toast notifications
- [x] Comprehensive documentation

---

## 🏗️ Layout Components (TODO)

### Navbar Component
- [ ] Create `src/components/layout/Navbar.tsx`
- [ ] Create `src/components/layout/Navbar.module.css`
- [ ] Add logo with link to /browse
- [ ] Add navigation links (Home, Movies, Series, My Library)
- [ ] Add search icon (links to /search)
- [ ] Add notifications icon with badge
- [ ] Add profile dropdown
  - [ ] Show username
  - [ ] Profile link
  - [ ] Logout button
- [ ] Make sticky on scroll
- [ ] Add mobile hamburger menu
- [ ] Test responsiveness

### Footer Component
- [ ] Create `src/components/layout/Footer.tsx`
- [ ] Create `src/components/layout/Footer.module.css`
- [ ] Add site links
- [ ] Add social media links
- [ ] Add copyright text
- [ ] Test responsiveness

### Layout Wrapper
- [ ] Create `src/components/layout/Layout.tsx`
- [ ] Wrap Navbar and Footer around children
- [ ] Apply to all main pages

---

## 🎬 Content Components (TODO)

### ContentCard Component
- [ ] Create `src/components/content/ContentCard.tsx`
- [ ] Create `src/components/content/ContentCard.module.css`
- [ ] Display poster image
- [ ] Add hover effect (scale + overlay)
- [ ] Show title on hover
- [ ] Show rating with star icon
- [ ] Show release year
- [ ] Add price badge (top-right corner)
- [ ] Navigate to content details on click
- [ ] Add lazy loading for images
- [ ] Test hover animations

### ContentRow Component
- [ ] Create `src/components/content/ContentRow.tsx`
- [ ] Create `src/components/content/ContentRow.module.css`
- [ ] Add section title
- [ ] Create horizontal scroll container
- [ ] Map ContentCard components
- [ ] Add scroll arrows (optional)
- [ ] Test horizontal scrolling
- [ ] Test responsiveness

### FeaturedHero Component
- [ ] Create `src/components/content/FeaturedHero.tsx`
- [ ] Create `src/components/content/FeaturedHero.module.css`
- [ ] Display large backdrop image
- [ ] Add gradient overlay
- [ ] Show title, rating, year, genres
- [ ] Show description (truncated)
- [ ] Add "Play Now" button (if owned)
- [ ] Add "More Info" button
- [ ] Auto-rotate every 7 seconds
- [ ] Add navigation dots
- [ ] Test auto-rotation

### RatingStars Component
- [ ] Create `src/components/content/RatingStars.tsx`
- [ ] Display filled/half/empty stars
- [ ] Show numeric rating
- [ ] Add click interaction (for rating)
- [ ] Test with different ratings

---

## 📄 Browse Page (TODO)

- [ ] Update `src/pages/Browse.tsx`
- [ ] Create `src/pages/Browse.module.css`
- [ ] Add Navbar
- [ ] Add FeaturedHero with top 5 content
- [ ] Add "Trending Now" ContentRow
- [ ] Add "New Releases" ContentRow
- [ ] Add "Popular Movies" ContentRow
- [ ] Add "Top Series" ContentRow
- [ ] Add genre sections (Action, Drama, etc.)
- [ ] Implement loading state with skeletons
- [ ] Handle API errors gracefully
- [ ] Test with empty content
- [ ] Test responsiveness
- [ ] Optimize performance (lazy loading)

---

## 📄 Content Details Page (TODO)

- [ ] Update `src/pages/ContentDetails.tsx`
- [ ] Create `src/pages/ContentDetails.module.css`
- [ ] Add Navbar
- [ ] Create hero banner with backdrop
- [ ] Display content metadata (title, rating, year, duration, genres)
- [ ] Show full description
- [ ] Display cast and director
- [ ] Add "Watch Now" button (if user owns content)
- [ ] Add "Buy Now" button (if user doesn't own)
- [ ] Show price (both RWF and coins)
- [ ] Add rating component (5 stars)
- [ ] Add episode list for series
  - [ ] Group by seasons
  - [ ] Show lock icon for unpurchased episodes
  - [ ] Show episode thumbnails, titles, durations
- [ ] Add "Similar Content" section
- [ ] Add trailer player (if available)
- [ ] Check if user owns content on load
- [ ] Integrate PaymentModal
- [ ] Test purchase flow
- [ ] Test responsiveness

---

## 💳 Payment Modal (TODO)

- [ ] Create `src/components/payment/PaymentModal.tsx`
- [ ] Create `src/components/payment/PaymentModal.module.css`
- [ ] Create tab system (Flutterwave | Coins)
- [ ] **Flutterwave Tab:**
  - [ ] Add email input with validation
  - [ ] Add phone number input (+250 format)
  - [ ] Add "Pay Now" button
  - [ ] Call payment API
  - [ ] Open payment URL in new window
  - [ ] Poll payment status every 5 seconds
  - [ ] Show loading state during polling
  - [ ] Handle success (close modal, show toast, refresh library)
  - [ ] Handle failure (show error message)
- [ ] **Coins Tab:**
  - [ ] Display user's coin balance
  - [ ] Show content price in coins
  - [ ] Add "Confirm Purchase" button
  - [ ] Disable if insufficient balance
  - [ ] Call coin payment API
  - [ ] Handle success/failure
- [ ] Test both payment methods
- [ ] Test status polling
- [ ] Test error scenarios

---

## 🎥 Video Player (TODO)

### VideoPlayer Component
- [ ] Create `src/components/player/VideoPlayer.tsx`
- [ ] Create `src/components/player/VideoPlayer.module.css`
- [ ] Install video.js (`npm install video.js`)
- [ ] Initialize video.js player
- [ ] Load video source
- [ ] Add custom controls:
  - [ ] Play/Pause button
  - [ ] Progress bar with seek
  - [ ] Volume control
  - [ ] Playback speed selector (0.5x - 2x)
  - [ ] Fullscreen button
- [ ] Implement keyboard shortcuts:
  - [ ] Space: Play/Pause
  - [ ] Arrow Left: Seek -10s
  - [ ] Arrow Right: Seek +10s
  - [ ] Arrow Up: Volume up
  - [ ] Arrow Down: Volume down
  - [ ] F: Fullscreen
  - [ ] M: Mute/Unmute
- [ ] Load last watch position on mount
- [ ] Save progress every 5 seconds
- [ ] Mark as completed at 90% watched
- [ ] Test all controls
- [ ] Test keyboard shortcuts

### EpisodeSelector Component (for Series)
- [ ] Create `src/components/player/EpisodeSelector.tsx`
- [ ] Display all seasons and episodes
- [ ] Show episode thumbnails
- [ ] Show episode titles and durations
- [ ] Highlight currently playing episode
- [ ] Add lock icon for unpurchased episodes
- [ ] Click to change episode
- [ ] Test switching episodes

### Watch Page
- [ ] Update `src/pages/Watch.tsx`
- [ ] Create `src/pages/Watch.module.css`
- [ ] Verify user owns content before loading
- [ ] Get stream URL from API
- [ ] Display VideoPlayer component
- [ ] Add back button
- [ ] Add EpisodeSelector for series
- [ ] Implement auto-next episode:
  - [ ] Show countdown (10 seconds)
  - [ ] Add "Cancel" button
  - [ ] Auto-play next episode
- [ ] Test video playback
- [ ] Test progress saving
- [ ] Test resume functionality
- [ ] Test auto-next for series

---

## 🔍 Search Page (TODO)

- [ ] Update `src/pages/Search.tsx`
- [ ] Create `src/pages/Search.module.css`
- [ ] Add Navbar
- [ ] Add search input with debounce (300ms)
- [ ] Add filters:
  - [ ] Content type (All, Movies, Series)
  - [ ] Genre dropdown
  - [ ] Year range
  - [ ] Rating range
- [ ] Add sort options:
  - [ ] Relevance
  - [ ] Rating (high to low)
  - [ ] Release year (new to old)
  - [ ] Title (A-Z)
- [ ] Display results in grid
- [ ] Show empty state for no results
- [ ] Add pagination or infinite scroll
- [ ] Test search functionality
- [ ] Test filters
- [ ] Test debouncing
- [ ] Test responsiveness

---

## 📚 My Library Page (TODO)

- [ ] Update `src/pages/MyLibrary.tsx`
- [ ] Create `src/pages/MyLibrary.module.css`
- [ ] Add Navbar
- [ ] Add "Continue Watching" section at top
- [ ] Add filter tabs (All | Movies | Series)
- [ ] Display purchased content in grid
- [ ] Show watch progress bar on each card
- [ ] Show "Completed" badge for finished content
- [ ] Show "Continue" badge for in-progress
- [ ] Click card to resume watching
- [ ] Show empty state if no purchases
- [ ] Test with different watch progress
- [ ] Test filter tabs
- [ ] Test responsiveness

---

## 👤 Profile Page (TODO)

- [ ] Update `src/pages/Profile.tsx`
- [ ] Create `src/pages/Profile.module.css`
- [ ] Add Navbar
- [ ] Create tab system (Account | Wallet | History | Settings)

### Account Tab
- [ ] Display current username (editable)
- [ ] Display email (read-only)
- [ ] Display phone number (editable)
- [ ] Add "Change Password" section:
  - [ ] Old password input
  - [ ] New password input
  - [ ] Confirm password input
  - [ ] Validate passwords match
- [ ] Add "Save Changes" button
- [ ] Show success/error toasts

### Wallet Tab
- [ ] Display coin balance (large, prominent)
- [ ] Add "Buy Coins" button
  - [ ] Opens payment modal for coin purchase
- [ ] Display transaction history table:
  - [ ] Date
  - [ ] Description
  - [ ] Amount (+/-)
  - [ ] Type (Purchase, Refund, Coin Purchase)
- [ ] Add pagination for transactions

### History Tab
- [ ] Display watch history:
  - [ ] Content poster
  - [ ] Title
  - [ ] Last watched date
  - [ ] Progress bar
  - [ ] "Continue Watching" button
- [ ] Display purchase history:
  - [ ] Date
  - [ ] Content title
  - [ ] Amount paid
  - [ ] Payment method

### Settings Tab
- [ ] Add language preference (future)
- [ ] Add video quality preference dropdown
- [ ] Add autoplay next episode toggle
- [ ] Add email notifications toggle
- [ ] Add "Delete Account" button (red, confirm modal)

- [ ] Test all tabs
- [ ] Test form submissions
- [ ] Test responsiveness

---

## 🎨 Polish & Optimization (TODO)

### Loading States
- [ ] Add skeleton loaders for content cards
- [ ] Add skeleton for content details
- [ ] Add loading spinner for search
- [ ] Add progress bar for page transitions

### Error Handling
- [ ] Create ErrorBoundary component
- [ ] Add error states for API failures
- [ ] Add retry buttons on errors
- [ ] Add 404 for invalid content IDs

### Performance
- [ ] Optimize images (WebP format)
- [ ] Add lazy loading for images
- [ ] Code split routes
- [ ] Optimize bundle size
- [ ] Add service worker (optional)

### Accessibility
- [ ] Add aria labels
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Ensure color contrast
- [ ] Add focus indicators

### SEO
- [ ] Add meta tags to pages
- [ ] Add Open Graph tags
- [ ] Create sitemap
- [ ] Add robots.txt

---

## 🧪 Testing (TODO)

### Manual Testing
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test logout
- [ ] Test browse page
- [ ] Test content details
- [ ] Test purchase flow (Flutterwave)
- [ ] Test purchase flow (Coins)
- [ ] Test video playback
- [ ] Test progress tracking
- [ ] Test search
- [ ] Test library
- [ ] Test profile editing
- [ ] Test password change
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Error Scenarios
- [ ] Test with network disconnected
- [ ] Test with invalid API responses
- [ ] Test with expired token
- [ ] Test with insufficient coins
- [ ] Test with missing content

---

## 📦 Deployment (TODO)

- [ ] Build for production (`npm run build`)
- [ ] Test production build locally
- [ ] Set up hosting (Vercel, Netlify, etc.)
- [ ] Configure environment variables on host
- [ ] Set up custom domain
- [ ] Configure HTTPS
- [ ] Test deployed app
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Google Analytics)

---

## 📊 Progress Summary

**Total Tasks:** ~150+
**Completed:** ~30 (Foundation)
**Remaining:** ~120

**Completion:** ~20%

---

## 🎯 Recommended Order

1. ✅ Navbar (needed for all pages)
2. ✅ ContentCard (needed for browse)
3. ✅ ContentRow (needed for browse)
4. ✅ FeaturedHero (needed for browse)
5. ✅ Browse Page (most important page)
6. ✅ Content Details Page
7. ✅ PaymentModal (needed for purchases)
8. ✅ VideoPlayer (core feature)
9. ✅ Watch Page
10. ✅ Search Page
11. ✅ My Library Page
12. ✅ Profile Page
13. ✅ Polish & Optimization

---

## 💡 Tips

- ✅ Mark items as you complete them
- Focus on one component at a time
- Test each component before moving to next
- Reference DEVELOPMENT_GUIDE.md for code examples
- Use QUICK_REFERENCE.md for common patterns
- Don't skip error handling
- Keep commits small and focused

---

**Update this file as you progress! 🚀**
