# Cineranda Frontend - Quality Implementation Plan

## Current Status Assessment

### ✅ What's Working Well
1. Authentication flow (2-step registration, login)
2. Basic content browsing structure
3. API integration foundation
4. Routing structure

### ❌ What Needs Complete Overhaul
1. **Browse Page** - Continue watching section missing, poor content organization
2. **ContentDetails Page** - Rushed implementation, missing key features
3. **MyLibrary Page** - Basic implementation, needs watch progress display
4. **Profile Page** - Missing wallet integration, poor layout
5. **Watch Page** - Not implemented at all
6. **Search Functionality** - Not implemented
7. **Series Episode Selection** - Not implemented
8. **Mobile Responsiveness** - Not considered

## Detailed Implementation Roadmap

### Phase 1: Core Content Viewing Experience (Priority 1)

#### 1.1 Browse Page Enhancement
**Current Issues:**
- No "Continue Watching" section
- No genre-based browsing
- Poor mobile layout
- Missing category filtering

**Required Features:**
- Hero banner with featured content (autoplay carousel)
- Continue Watching section (from watch history API)
- Genre rows (Action, Drama, Comedy, etc.)
- "My List" quick access
- Search bar in header
- Responsive grid system

**API Endpoints to Use:**
- GET `/watch-history/in-progress` - Continue watching
- GET `/content/movies/featured` - Featured content
- GET `/content/movies/genre/:genreId` - By genre
- GET `/content/movies/category/:categoryId` - By category

#### 1.2 ContentDetails Page - Complete Redesign
**Current Issues:**
- Basic layout, not Netflix-quality
- Missing episode selector for series
- Poor purchase flow UX
- No related content
- Missing trailer preview

**Required Features:**
- **Hero Section:**
  - Full-width backdrop image with gradient
  - Play button (if owned) OR Purchase button
  - Add to My List button
  - Info button
  - Title, year, rating, duration, genres

- **Content Section:**
  - Tabs: Episodes (for series) | More Like This | Details
  - Episodes tab: Season selector, episode list with thumbnails
  - More Like This: Similar content recommendations
  - Details: Cast, description, ratings & reviews

- **Purchase Flow:**
  - Clear pricing display (RWF + Coins)
  - Payment method selector (RWF wallet / Coins)
  - Balance check before purchase
  - Purchase confirmation modal
  - Insufficient balance warning with "Top Up" CTA

- **For Series:**
  - Season dropdown selector
  - Episode grid with:
    - Episode number & title
    - Thumbnail image
    - Duration
    - Description
    - Lock icon if not purchased
    - Progress bar if started
    - Purchase button per episode
  - "Buy Season" button
  - "Buy Full Series" button (with discount display)

**API Endpoints to Use:**
- GET `/content/movies/:id` OR `/content/series/:id`
- GET `/content/:contentId/access` - Check purchase status
- GET `/ratings/movie/:movieId` - Get reviews
- POST `/payments/content/purchase/wallet` - Purchase
- POST `/payments/episode/purchase/wallet` - Purchase episode
- POST `/payments/season/purchase/wallet` - Purchase season

### Phase 2: Watch Experience (Priority 1)

#### 2.1 Watch Page - Full Implementation
**Current Status:** Not implemented

**Required Features:**
- **Video Player:**
  - Video.js integration (already in package.json)
  - Custom controls overlay
  - Play/Pause
  - Volume control
  - Progress bar with thumbnails
  - Fullscreen toggle
  - Quality selector (if multiple qualities available)
  - Speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
  - Subtitles toggle (EN, FR, Kinyarwanda)
  - 10s forward/backward buttons
  - Auto-hide controls on inactivity

- **Pre-playback:**
  - Access verification (check if user owns content)
  - Redirect to purchase if not owned
  - Loading state while fetching video URL
  - Thumbnail preview before play

- **During Playback:**
  - Auto-save progress every 10 seconds
  - Resume from last position if returning
  - Next episode button (for series) in last 30 seconds
  - Episode selector sidebar (for series)

- **Post-playback:**
  - "Rate this content" modal
  - "Watch Next" recommendations
  - Auto-play next episode countdown (series)

- **For Series:**
  - Episode selector sidebar
  - Season navigation
  - Current episode indicator
  - Next/Previous episode buttons

**API Endpoints to Use:**
- GET `/content/:movieId/watch` - Get video URL for movie
- GET `/content/series/:seriesId/episodes/:episodeId/watch` - Get episode video
- GET `/content/:contentId/access` - Verify access
- POST `/watch-history/update` - Save progress
- GET `/watch-history` - Get last position

### Phase 3: User Wallet & Payments (Priority 2)

#### 3.1 Wallet System - Complete Implementation
**Current Status:** Basic wallet component exists

**Required Improvements:**
- **Profile Wallet Tab:**
  - Large balance cards (RWF & Coins) with icons
  - Recent transactions list (last 10)
  - "View All Transactions" button
  - Top-up button prominent
  - Transaction filters (All, Deposits, Purchases, Refunds)

- **Top-Up Modal:**
  - Amount input with quick select buttons (500, 1000, 5000, 10000)
  - Payment method: Mobile Money (MTN/Airtel) / Card
  - Phone number input for mobile money
  - Flutterwave integration
  - Loading state during payment
  - Success/Error handling
  - Receipt display after success

- **Transaction History Page:**
  - Full-page transaction list
  - Date range filter
  - Type filter
  - Search by description
  - Export to PDF/CSV
  - Pagination

**API Endpoints to Use:**
- GET `/payments/wallet/balance`
- POST `/payments/wallet/topup`
- GET `/auth/profile` - Get coin transactions
- GET `/users/:userId/transactions` - Get RWF transactions (if available)

#### 3.2 Purchase Flow - Enhanced UX
**Required Features:**
- **Content Purchase Modal:**
  - Content thumbnail & title
  - Price breakdown (original price, discounts)
  - Payment method selector (RWF/Coins radio buttons)
  - Current balance display
  - Estimated balance after purchase
  - Confirm button
  - Cancel button
  - Loading state
  - Success animation
  - Error handling with retry

- **Insufficient Balance:**
  - Clear error message
  - Required amount vs current balance
  - "Top Up Wallet" button (direct to top-up modal)
  - "Go Back" button

- **Series Purchase Options:**
  - Buy Full Series (with discount percentage badge)
  - Buy Season X
  - Buy Single Episode
  - Clear price comparison
  - Savings calculator

### Phase 4: User Library & History (Priority 2)

#### 4.1 MyLibrary Page - Enhanced
**Current Issues:**
- Basic grid, no organization
- No filters beyond Movie/Series
- Missing watch progress indicators
- No sorting options

**Required Features:**
- **Header:**
  - "My Library" title with count
  - View toggle (Grid / List)
  - Sort dropdown (Recently Added, Title A-Z, Release Year)
  - Filter chips (All, Movies, Series, Not Started, In Progress, Completed)

- **Content Cards:**
  - Large thumbnail
  - Title & year
  - Progress bar (if started)
  - "X% watched" text
  - Resume/Watch button
  - Three-dot menu (Remove from library, Download - future)
  - Badge: "New" (if added in last 7 days)

- **Continue Watching Section:**
  - Separate dedicated section at top
  - Larger cards
  - Time remaining display
  - Resume button prominent
  - "Remove from Continue Watching" option

- **Empty States:**
  - No content: "Your library is empty" with Browse CTA
  - No in-progress: "Start watching something!"
  - No completed: "Finish something you started"

**API Endpoints to Use:**
- GET `/content/unlocked` - Purchased content
- GET `/watch-history/in-progress` - In progress
- GET `/watch-history` - All watch history

#### 4.2 Search Page - Full Implementation
**Current Status:** Not implemented

**Required Features:**
- **Search Interface:**
  - Large search bar
  - Voice search option (future)
  - Search suggestions as you type
  - Recent searches
  - Trending searches

- **Results:**
  - Results count
  - Filter sidebar (Genre, Year, Type, Rating)
  - Sort options
  - Grid of results
  - Load more / Infinite scroll
  - No results state with suggestions

**API Endpoints to Use:**
- GET `/content/search?q={query}`
- GET `/content/movies/genre/:genreId`
- GET `/content/movies/category/:categoryId`

### Phase 5: Social Features (Priority 3)

#### 5.1 Ratings & Reviews System
**Required Features:**
- **Rate Content Modal:**
  - 5-star rating selector (large, interactive)
  - Review textarea
  - Character count (500 max)
  - Spoiler warning checkbox
  - Submit button
  - Success feedback

- **Reviews Display:**
  - Sort by (Most Recent, Highest Rated, Lowest Rated)
  - User avatar & username
  - Star rating
  - Review text
  - Date posted
  - Helpful buttons (Like/Dislike)
  - Report button
  - Edit/Delete (own reviews only)

**API Endpoints to Use:**
- POST `/ratings` - Submit rating
- GET `/ratings/movie/:movieId` - Get ratings
- DELETE `/ratings/:ratingId` - Delete rating

### Phase 6: Profile & Settings (Priority 3)

#### 6.1 Profile Page - Complete Redesign
**Current Issues:**
- Basic tab layout
- Missing key information
- Poor visual design

**Required Features:**
- **Profile Header:**
  - User avatar (default with initials)
  - Username & join date
  - Membership status
  - Edit profile button

- **Account Tab:**
  - Personal info (editable)
  - Email, phone, name
  - Location
  - Account stats (logins, last active, total watch time)

- **Wallet Tab:** (Enhanced)
  - Balance cards
  - Transaction history
  - Top-up button

- **Viewing Activity Tab:**
  - Watch history list
  - Total watch time
  - Favorite genres
  - Recently watched
  - Clear history button

- **Settings Tab:**
  - Language preference
  - Theme (Dark/Light)
  - Notifications preferences
  - Auto-play next episode toggle
  - Video quality preference
  - Subtitle language default
  - Change PIN button
  - Delete account button (with confirmation)

**API Endpoints to Use:**
- GET `/auth/profile`
- PATCH `/auth/profile`
- POST `/auth/change-pin`
- GET `/watch-history`

## Design System Requirements

### Colors
```css
--primary-yellow: #F5C518
--primary-red: #E50914
--background-black: #141414
--background-dark: #1F1F1F
--background-gray: #2F2F2F
--text-white: #FFFFFF
--text-gray: #B3B3B3
--success-green: #46D369
--error-red: #E50914
```

### Typography
- Headings: Inter, Bold
- Body: Inter, Regular
- Buttons: Inter, Semi-Bold

### Spacing
- Section padding: 60px (desktop), 24px (mobile)
- Card gap: 16px
- Element margin: 8px, 16px, 24px, 32px

### Components to Build
1. VideoPlayer (custom controls)
2. ContentCard (enhanced)
3. Modal (purchase, rating, confirmation)
4. EpisodeCard (for series)
5. ReviewCard
6. TransactionItem
7. ProgressBar (custom)
8. Button (primary, secondary, ghost)
9. Input (text, search)
10. Select/Dropdown
11. Toast notifications (enhanced)
12. Loading states (skeleton screens)
13. Empty states
14. Error states

## Mobile Responsiveness
- Breakpoints: 320px, 768px, 1024px, 1440px
- Touch-friendly buttons (min 44px)
- Swipeable carousels
- Bottom navigation for mobile
- Hamburger menu
- Full-screen modals on mobile

## Performance Optimizations
- Image lazy loading
- Infinite scroll for long lists
- Debounced search
- Cached API responses
- Optimistic UI updates
- Code splitting by route
- Video preloading

## Testing Checklist
- [ ] All API integrations working
- [ ] Purchase flow (RWF & Coins)
- [ ] Watch page playback
- [ ] Progress tracking
- [ ] Resume watching
- [ ] Episode navigation
- [ ] Search functionality
- [ ] Filters working
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Form validation
- [ ] Authentication flow
- [ ] Token refresh

## Timeline Estimate
- Phase 1: 3 days
- Phase 2: 2 days
- Phase 3: 2 days
- Phase 4: 2 days
- Phase 5: 1 day
- Phase 6: 1 day
- Testing & Polish: 1 day

**Total: ~12 days of focused work**
