# Feature Gap Analysis & Implementation Roadmap

## Executive Summary
This document analyzes the gap between available API endpoints in the Cineranda backend and the features currently implemented in the frontend. Many powerful features are available via API but not exposed in the user interface.

## Current State Assessment

### ✅ **What's Working**
- Basic authentication (login, register, profile)
- Simple home page with featured content and content rows
- Basic content browsing (movies, series)
- Continue watching functionality
- User profile with premium multi-tab design (Account, Wallet, Activity, Settings)
- Basic wallet component
- Watch history tracking
- UI Component Library (Button, Modal, Input, Skeleton, etc.)

### ⚠️ **What's Incomplete**
- Search functionality (placeholder only)
- Movies and Series sections (basic rows only, no dedicated pages)
- Advanced filtering and sorting
- Genre and category navigation
- Wallet top-up feature
- Transaction history viewing
- Content purchase flows
- Payment integration UI

---

## API Endpoints Analysis

### 📺 **Public Content Endpoints** (Available but Underutilized)

#### **Available in API:**
1. **GET /content/movies** - Get published movies with pagination
2. **GET /content/movies/search?query=** - Search movies by title
3. **GET /content/movies/genre/:genreId** - Filter movies by genre
4. **GET /content/movies/category/:categoryId** - Filter by category
5. **GET /content/movies/featured** - Get featured movies
6. **GET /content/movies/:id** - Get movie details
7. **GET /content/series** - Get published series with pagination
8. **GET /content/series/:id** - Get series with all seasons/episodes
9. **GET /content/series/:seriesId/seasons/:seasonNumber** - Get season details
10. **GET /content/series/:seriesId/episodes/:episodeId** - Get episode details

#### **Currently Implemented in Frontend:**
- ✅ `getPublishedMovies()` - Used in Browse page
- ✅ `getPublishedSeries()` - Used in Browse page
- ✅ `getFeaturedMovies()` - Used in Browse page
- ✅ `getMovieById()` - Used in Watch page
- ✅ `getSeriesById()` - Used in Watch page
- ⚠️ `searchMovies()` - API service exists but NO UI implementation
- ⚠️ `getMoviesByGenre()` - API service exists but NOT USED anywhere
- ❌ `getMoviesByCategory()` - API endpoint available but NO frontend implementation
- ❌ Advanced filters, sorting, pagination - NOT IMPLEMENTED

#### **Missing Features:**
- 🔴 **No search page** - Just a placeholder div with TODO comment
- 🔴 **No genre navigation** - Can't browse by genre
- 🔴 **No category browsing** - Can't filter by categories
- 🔴 **No dedicated Movies page** - Just a simple content row
- 🔴 **No dedicated Series page** - Just a simple content row
- 🔴 **No sorting options** - Can't sort by newest, rating, popularity, etc.
- 🔴 **No advanced filters** - Can't filter by release year, price, etc.

---

### 💰 **Payment & Wallet Endpoints** (API Ready, UI Missing)

#### **Available in API:**
1. **POST /payments/wallet/topup** - Top up wallet via Flutterwave
   - Mobile Money (MTN, Airtel)
   - Card payments
   - Returns payment link
2. **GET /payments/wallet/balance** - Get RWF balance
3. **POST /payments/content/purchase/wallet** - Purchase movie/series
4. **POST /payments/episode/purchase/wallet** - Purchase single episode
5. **POST /payments/season/purchase/wallet** - Purchase entire season
6. **GET /content/:id/access** - Check if user has access to content
7. **User Profile** includes:
   - `coinWallet.balance` - Coin balance
   - `coinWallet.transactions[]` - Transaction history
   - `purchasedContent[]` - List of purchased content

#### **Currently Implemented in Frontend:**
- ✅ `getWalletBalance()` - Gets both RWF and coin balance
- ✅ `topUpWallet()` - API service exists
- ✅ `getCoinTransactions()` - API service exists
- ✅ Basic wallet component in Profile page (shows balance only)
- ✅ Purchase API services exist (`purchaseContentWithWallet`, `purchaseEpisodeWithWallet`, `purchaseSeasonWithWallet`)
- ❌ **NO wallet top-up UI flow**
- ❌ **NO transaction history page/view**
- ❌ **NO content purchase modal/confirmation UI**
- ❌ **NO payment integration in content pages**

#### **Missing Features:**
- 🔴 **No top-up feature** - Can't add money to wallet
- 🔴 **No transaction history** - Can't see past transactions
- 🔴 **No purchase UI** - No way to buy content from UI
- 🔴 **No payment flow** - No confirmation dialogs, no payment status
- 🔴 **No content pricing display** - Prices not shown on content cards
- 🔴 **No "locked content" indicator** - Users don't know what needs purchase

---

## Implementation Priority Roadmap

### 🔥 **Phase 1: Critical Features (High Priority)**

#### **1.1 Enhanced Search Page**
**Status:** 🔴 Currently just a placeholder  
**Priority:** CRITICAL  
**Estimated Effort:** 2-3 days

**Requirements:**
- Search input with debounce (300ms)
- Real-time search results as user types
- Advanced filters panel:
  - Content type (Movies, Series, Both)
  - Genre multi-select
  - Category multi-select
  - Release year range slider
  - Price filter (Free, Paid, Price range)
- Sort options dropdown:
  - Newest first
  - Oldest first
  - Most viewed
  - Highest rated
  - A-Z, Z-A
- Results grid with lazy loading/pagination
- Empty state for no results
- Search history (optional)

**API Endpoints Used:**
- `GET /content/movies/search?query=`
- `GET /content/movies/genre/:genreId`
- `GET /content/movies/category/:categoryId`

**Files to Create/Modify:**
- `src/pages/Search.tsx` (complete rewrite)
- `src/components/search/SearchBar.tsx` (new)
- `src/components/search/FilterPanel.tsx` (new)
- `src/components/search/SortDropdown.tsx` (new)
- `src/api/content.ts` (add category filtering methods)

---

#### **1.2 Dedicated Movies Section**
**Status:** 🟡 Basic content row only  
**Priority:** HIGH  
**Estimated Effort:** 2 days

**Requirements:**
- Dedicated `/movies` route
- Hero section with random featured movie
- Genre navigation tabs/pills
- Category filters sidebar
- Sort options (newest, popular, A-Z)
- Movie grid with pagination
- Filter persistence in URL params
- Responsive grid layout (1-6 columns based on screen)

**API Endpoints Used:**
- `GET /content/movies?page=&limit=`
- `GET /content/movies/genre/:genreId`
- `GET /content/movies/category/:categoryId`
- `GET /content/movies/featured`

**Files to Create:**
- `src/pages/Movies.tsx` (new)
- `src/components/movies/MovieGrid.tsx` (new)
- `src/components/movies/GenreNav.tsx` (new)
- `src/components/movies/FilterSidebar.tsx` (new)

---

#### **1.3 Dedicated Series Section**
**Status:** 🟡 Basic content row only  
**Priority:** HIGH  
**Estimated Effort:** 2 days

**Requirements:**
- Dedicated `/series` route
- Similar to Movies page but for series
- Show season count on cards
- Episode count badges
- Series-specific filters

**API Endpoints Used:**
- `GET /content/series?page=&limit=`
- Similar to Movies section

**Files to Create:**
- `src/pages/Series.tsx` (new)
- `src/components/series/SeriesGrid.tsx` (new)
- `src/components/series/GenreNav.tsx` (reuse/adapt from movies)

---

### 💎 **Phase 2: Payment & Wallet Features (High Priority)**

#### **2.1 Wallet Top-Up Flow**
**Status:** 🔴 API exists but NO UI  
**Priority:** HIGH  
**Estimated Effort:** 2 days

**Requirements:**
- Top-up button in Profile > Wallet tab
- Top-up modal with:
  - Amount input (with presets: 1000, 5000, 10000, 20000 RWF)
  - Payment method selection (Flutterwave)
  - Terms and conditions checkbox
  - "Proceed to Payment" button
- Redirect to Flutterwave payment link
- Payment status tracking (pending, success, failed)
- Success notification and balance update
- Transaction added to history

**API Endpoints Used:**
- `POST /payments/wallet/topup` - Returns Flutterwave payment link
- `GET /payments/wallet/balance` - Refresh balance after payment

**Files to Create/Modify:**
- `src/components/wallet/TopUpModal.tsx` (new)
- `src/pages/Profile.tsx` (add top-up button in Wallet tab)
- `src/api/wallet.ts` (already has `topUpWallet()`)

---

#### **2.2 Transaction History View**
**Status:** 🔴 API exists but NO UI  
**Priority:** MEDIUM  
**Estimated Effort:** 1 day

**Requirements:**
- Transaction list in Profile > Wallet tab
- Show all transactions with:
  - Type (top-up, purchase, refund, bonus, adjustment)
  - Amount (+/-) with color coding
  - Description
  - Date/time
  - Status icon
- Filter by type
- Date range filter
- Pagination
- Export to CSV (optional)

**API Endpoints Used:**
- `GET /auth/profile` - Contains `coinWallet.transactions[]`

**Files to Create:**
- `src/components/wallet/TransactionHistory.tsx` (new)
- `src/components/wallet/TransactionItem.tsx` (new)

---

#### **2.3 Content Purchase/Unlock UI**
**Status:** 🔴 API exists but NO UI  
**Priority:** HIGH  
**Estimated Effort:** 2-3 days

**Requirements:**
- **Content Card Updates:**
  - Show price badge (RWF or coins or "Free")
  - Show "locked" indicator for unpurchased content
  - Show "Play" button for purchased content
- **Purchase Modal:**
  - Content poster and title
  - Price display (RWF and coin options)
  - Wallet balance display
  - Insufficient balance warning
  - "Purchase with RWF" button
  - "Purchase with Coins" button
  - Terms and conditions
- **Post-Purchase:**
  - Success animation
  - Updated balance
  - Content now playable
  - Transaction added to history

**API Endpoints Used:**
- `GET /content/:id/access` - Check if purchased
- `POST /payments/content/purchase/wallet` - Purchase content
- `GET /payments/wallet/balance` - Check/update balance

**Files to Create/Modify:**
- `src/components/content/PurchaseModal.tsx` (new)
- `src/components/content/ContentCard.tsx` (modify - add price, lock icon)
- `src/components/content/PriceBadge.tsx` (new)
- `src/pages/Watch.tsx` (modify - check access before playing)

---

### 🎨 **Phase 3: UX & Design Enhancements (Medium Priority)**

#### **3.1 Enhanced Home/Browse Page**
**Status:** 🟡 Basic implementation  
**Priority:** MEDIUM  
**Estimated Effort:** 2 days

**Improvements:**
- Better featured hero section:
  - Auto-rotating carousel (5-6 featured items)
  - Larger images with gradient overlay
  - "Play" and "Add to List" buttons
  - Auto-play trailer on hover (optional)
- Genre-based content rows:
  - "Action Movies", "Drama Series", "Comedy", etc.
  - Horizontal scrolling with scroll indicators
  - "See All" links to dedicated genre pages
- Trending/Popular sections
- Personalized recommendations (based on watch history)
- Better loading states with skeletons

---

#### **3.2 Genre & Category Navigation**
**Status:** 🔴 Not implemented  
**Priority:** MEDIUM  
**Estimated Effort:** 1-2 days

**Requirements:**
- Genre dropdown in navbar
- Genre pages: `/genre/:genreId` with filtered content
- Category pages: `/category/:categoryId`
- Breadcrumb navigation
- Genre/category descriptions

**API Endpoints Used:**
- Need to add genre/category list endpoints to API service
- Use existing filtering endpoints

---

#### **3.3 Design Quality Review**
**Status:** 🟡 Inconsistent  
**Priority:** MEDIUM  
**Estimated Effort:** 2-3 days

**Areas to Review:**
- Consistent color palette and theming
- Typography hierarchy (headings, body, captions)
- Spacing and padding consistency
- Smooth transitions and animations
- Loading states and skeletons
- Error states and empty states
- Responsive design (mobile, tablet, desktop)
- Accessibility (ARIA labels, keyboard navigation)
- Match Profile page quality across all pages

---

## API Service Updates Needed

### **src/api/content.ts** - Add Missing Methods

```typescript
// Add these methods to contentAPI:

// Get movies by category
getMoviesByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
  api.get(`/content/movies/category/${categoryId}`, { params: { page, limit } }),

// Get series by genre
getSeriesByGenre: (genreId: string, page: number = 1, limit: number = 10) =>
  api.get(`/content/series/genre/${genreId}`, { params: { page, limit } }),

// Get series by category
getSeriesByCategory: (categoryId: string, page: number = 1, limit: number = 10) =>
  api.get(`/content/series/category/${categoryId}`, { params: { page, limit } }),

// Advanced search with filters and sorting
advancedSearch: (params: {
  query?: string;
  type?: 'Movie' | 'Series';
  genreIds?: string[];
  categoryIds?: string[];
  minYear?: number;
  maxYear?: number;
  sortBy?: 'newest' | 'oldest' | 'views' | 'rating' | 'title';
  page?: number;
  limit?: number;
}) => api.get('/content/search', { params }),

// Get all genres
getGenres: () => api.get('/genres'),

// Get all categories
getCategories: () => api.get('/categories'),
```

---

## Component Architecture

### **New Component Structure**

```
src/
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── SortDropdown.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchFilters.tsx
│   ├── movies/
│   │   ├── MovieGrid.tsx
│   │   ├── MovieCard.tsx (enhance existing)
│   │   ├── GenreNav.tsx
│   │   └── FilterSidebar.tsx
│   ├── series/
│   │   ├── SeriesGrid.tsx
│   │   ├── SeriesCard.tsx (enhance existing)
│   │   └── GenreNav.tsx
│   ├── wallet/
│   │   ├── TopUpModal.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── TransactionItem.tsx
│   │   └── BalanceCard.tsx
│   ├── content/
│   │   ├── PurchaseModal.tsx
│   │   ├── PriceBadge.tsx
│   │   ├── ContentCard.tsx (enhance)
│   │   └── LockIcon.tsx
│   └── common/
│       ├── Pagination.tsx
│       ├── FilterChips.tsx
│       ├── SortMenu.tsx
│       └── EmptyState.tsx
```

---

## Testing Checklist

### **Per Feature Testing:**
- [ ] Component renders without errors
- [ ] API calls work correctly
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Empty states show correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Accessibility (screen readers)

---

## Conclusion

The backend API is feature-rich and ready for production. The frontend needs significant work to expose these features to users. The roadmap above prioritizes user-facing features that will have the most impact:

1. **Search** - Users need to find content
2. **Movies/Series sections** - Better browsing experience
3. **Payment features** - Enable monetization
4. **UX polish** - Professional look and feel

**Total Estimated Timeline:** 3-4 weeks for full implementation

**Recommended Approach:** Implement Phase 1 and Phase 2 in parallel, then polish with Phase 3.
