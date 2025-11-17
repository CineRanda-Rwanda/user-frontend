# Cineranda API Endpoints - Comprehensive Analysis

## Overview
This document catalogs ALL user-related endpoints discovered from the Postman collection, organized by feature category.

---

## 1. Authentication & User Management

### Registration & Login
- **POST** `/auth/register` - Step 1: Register with username, phoneNumber, pin
- **POST** `/auth/verify-registration` - Step 2: Verify with phoneNumber, verificationCode
- **POST** `/auth/login` - Login with identifier (username/phone), pin
- **POST** `/auth/refresh-token` - Refresh authentication token

### Profile Management
- **GET** `/auth/profile` - Get current user profile (includes wallet, transactions, watchHistory, purchasedContent)
- **PATCH** `/auth/profile` - Update profile (firstName, lastName, preferredLanguage, theme)

### PIN Management
- **POST** `/auth/change-pin` - Change PIN with oldPin, newPin
- **POST** `/auth/forgot-pin` - Request PIN reset with phoneNumber
- **POST** `/auth/reset-pin` - Reset PIN with code, newPin

---

## 2. Content Discovery & Browsing

### Movies
- **GET** `/content/movies` - Get all published movies (paginated)
- **GET** `/content/movies/:id` - Get single movie details with userAccess info
- **GET** `/content/movies/featured` - Get featured movies
- **GET** `/content/movies/genre/:genreId` - Get movies by genre
- **GET** `/content/movies/category/:categoryId` - Get movies by category

### Series
- **GET** `/content/series` - Get all published series (paginated)
- **GET** `/content/series/:id` - Get series details with all seasons/episodes + userAccess
- **GET** `/content/series/featured` - Get featured series

### Search & Filter
- **GET** `/content/search?q={query}` - Search movies/series by title
- **GET** `/content/:contentId/access` - Check user access to specific content

### Content Access (Watch)
- **GET** `/content/:movieId/watch` - Get movie video URL + subtitles (requires purchase)
- **GET** `/content/series/:seriesId/episodes/:episodeId/watch` - Get episode video URL (requires purchase)
- **GET** `/content/unlocked` - Get all content user has purchased

---

## 3. Payment & Wallet System

### Wallet Operations
- **GET** `/payments/wallet/balance` - Get current RWF and coin balances
- **POST** `/payments/wallet/topup` - Top up wallet with Flutterwave
  - Body: `{ amount: number }`
  - Response: `{ paymentLink: string, transactionRef: string }`

### Content Purchases
- **POST** `/payments/content/purchase/wallet` - Purchase movie/series with wallet
  - Body: `{ contentId: string }`
  - Deducts from RWF balance or coin balance
  
- **POST** `/payments/episode/purchase/wallet` - Purchase single episode
  - Body: `{ contentId: string, seasonNumber: number, episodeId: string }`
  
- **POST** `/payments/season/purchase/wallet` - Purchase entire season
  - Body: `{ contentId: string, seasonNumber: number }`

### Webhook
- **POST** `/payments/webhook` - Flutterwave payment confirmation webhook

---

## 4. Watch History Tracking

### Progress Management
- **POST** `/watch-history/update` - Update viewing progress
  - Body: `{ movieId: string, watchedDuration: number }`
  - Auto-creates/updates watch history entry

- **GET** `/watch-history` - Get complete watch history (all watched content)

- **GET** `/watch-history/in-progress` - Get "Continue Watching" list
  - Returns content that's started but not finished (watchedDuration < totalDuration)

---

## 5. Ratings & Reviews

### User Ratings
- **POST** `/ratings` - Submit rating for content
  - Body: `{ movieId: string, rating: number (1-5), review: string }`
  
- **GET** `/ratings/movie/:movieId?page=1&limit=10` - Get all ratings for a movie/series
  - Returns paginated ratings with user info, rating value, review text

- **DELETE** `/ratings/:ratingId` - Delete user's own rating

---

## 6. User Data Structures

### User Object (from API responses)
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "role": "user" | "admin",
  "location": "international" | "rwanda",
  "isActive": boolean,
  "loginCount": number,
  "lastActive": "ISO date string",
  
  "coinWallet": {
    "balance": number,
    "_id": "string",
    "transactions": [
      {
        "amount": number,
        "type": "welcome-bonus" | "admin-adjustment" | "purchase" | "refund",
        "description": "string",
        "createdAt": "ISO date string",
        "_id": "string"
      }
    ]
  },
  
  "balance": number,  // RWF balance
  "transactions": [],  // RWF transactions (separate from coin transactions)
  
  "watchHistory": [
    // Watch history items
  ],
  
  "purchasedContent": [
    // IDs of purchased movies/series/episodes
  ],
  
  "firstName": "string",
  "lastName": "string",
  "preferredLanguage": "english" | "kinyarwanda" | "french",
  "theme": "dark" | "light",
  
  "createdAt": "ISO date string",
  "updatedAt": "ISO date string"
}
```

### Content Access Response
```json
{
  "hasAccess": boolean,
  "accessType": "free" | "full" | "partial",
  "contentType": "Movie" | "Series",
  "unlockedEpisodes": number,
  "totalEpisodes": number,
  "freeEpisodes": number,
  "purchasedEpisodeIds": ["string"],
  "totalSeasons": number
}
```

### Watch Video Response
```json
{
  "contentId": "string",
  "title": "string",
  "description": "string",
  "contentType": "Movie" | "Series",
  "videoUrl": "string (S3 URL)",
  "subtitles": {
    "en": "string (S3 URL)",
    // other languages
  },
  "duration": number,  // in minutes
  "posterImageUrl": "string"
}
```

### Payment Response
```json
{
  "status": "success",
  "message": "Content purchased successfully",
  "data": {
    "remainingBalance": number,  // Updated wallet balance
    "purchase": {
      "contentId": "string",
      "paidAmount": number,
      "paymentMethod": "rwf" | "coins",
      "purchaseDate": "ISO date string"
    }
  }
}
```

---

## 7. Missing Features (Not Yet Implemented in Frontend)

### Critical Missing Features:
1. **Wallet Display** - No UI showing RWF/coin balances anywhere
2. **Transaction History** - No page/component to view wallet transactions
3. **Wallet Top-Up** - No UI to add funds (Flutterwave integration missing)
4. **Content Purchase Flow** - No purchase button/modal on ContentDetails page
5. **Watch History** - No "Continue Watching" section on Browse/Home page
6. **Watch Progress Tracking** - Video player doesn't update watch history
7. **MyLibrary Page** - Empty placeholder, should use `/content/unlocked`
8. **Rating System** - No UI to submit ratings/reviews
9. **Profile Wallet Info** - Profile page doesn't show wallet balances
10. **Payment Modals** - No UI for purchase confirmation, insufficient balance warnings

### Partially Implemented:
- **ContentDetails Page** - Exists but missing: purchase button, pricing display, isPurchased status, watch progress
- **Watch Page** - Exists but missing: access verification, progress tracking, subtitle support
- **Profile Page** - Exists but missing: wallet info, transaction history, user stats

---

## 8. Implementation Priority

### Phase 1 - Wallet & Payments (Highest Priority)
1. Create `wallet.ts` API file with balance/topup methods
2. Create `payment.ts` enhancements for purchase flows
3. Add Wallet display component (shows RWF + coin balances)
4. Build wallet top-up modal (Flutterwave)
5. Build purchase confirmation modal

### Phase 2 - Content Access
1. Update ContentDetails page with:
   - Pricing display (RWF + coins)
   - Purchase button
   - isPurchased status check
   - Watch Now button (if purchased)
2. Implement MyLibrary page using `/content/unlocked`
3. Update Watch page with access verification

### Phase 3 - Watch History
1. Create `watchHistory.ts` API file
2. Add "Continue Watching" section to Browse page
3. Implement watch progress tracking in video player
4. Add watch history to Profile page

### Phase 4 - Ratings & Reviews
1. Create `ratings.ts` API file
2. Add rating submission UI to ContentDetails
3. Display existing ratings/reviews
4. Add delete rating option for own ratings

### Phase 5 - User Experience
1. Update Profile page with complete user info
2. Add transaction history view
3. Implement theme switching
4. Add language preference switching
5. Display user stats (login count, join date, etc.)

---

## 9. API Base URL
```
Base URL: http://localhost:5000/api/v1
Authorization: Bearer {token}
```

## 10. Error Handling Patterns

### Insufficient Balance
```json
{
  "status": "fail",
  "message": "Insufficient balance. You need 200 RWF but have 0 RWF.",
  "error": { "statusCode": 400 }
}
```

### Already Purchased
```json
{
  "status": "fail",
  "message": "You have already purchased this content",
  "error": { "statusCode": 400 }
}
```

### Unauthorized Access
```json
{
  "status": "fail",
  "message": "You must purchase this content to watch",
  "error": { "statusCode": 403 }
}
```

---

## Summary

**Total User Endpoints Discovered: 30+**

**Currently Implemented in Frontend: ~40%**
- ✅ Authentication (login, register, profile)
- ✅ Content browsing (movies, series, search)
- ⚠️ Content details (partial - missing purchase flow)
- ❌ Wallet management (0%)
- ❌ Payment system (0%)
- ❌ Watch history (0%)
- ❌ Ratings (0%)
- ❌ Transaction history (0%)

**Missing User Features: 60%**
- All wallet/payment functionality
- Watch history tracking
- Rating/review system
- Complete ContentDetails implementation
- MyLibrary page
- Profile wallet display
- Transaction history
