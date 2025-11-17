# API Integration Updates

## Overview
Updated all API integration files to match the actual backend API structure from the Postman collection.

## Key Changes

### 1. Authentication API (`src/api/auth.ts`)

#### Changes:
- **2-Step Registration**: Registration now requires OTP verification
  - Step 1: `POST /auth/register` - Sends OTP to phone
  - Step 2: `POST /auth/verify-registration` - Verifies OTP and completes registration
- **Login**: Changed from `emailOrUsername` + `password` to `identifier` + `pin`
  - `identifier` can be username or phone number
  - Uses PIN instead of password
- **Profile Management**: Added proper endpoints
  - `GET /auth/profile` - Get current user profile
  - `PATCH /auth/profile` - Update user profile
- **PIN Management**: Changed from password to PIN
  - `POST /auth/change-pin` - Change PIN
  - `POST /auth/forgot-pin` - Request PIN reset
  - `POST /auth/reset-pin` - Reset PIN with code
- **Token Refresh**: Updated to use `POST /auth/refresh-token`

### 2. Content API (`src/api/content.ts`)

#### Changes:
- **Separated Movies and Series**:
  - `GET /content/movies` - Get all published movies
  - `GET /content/series` - Get all published series
  - `GET /content/type/{Movie|Series}` - Get content by type
- **Movie Endpoints**:
  - `GET /content/movies/{id}` - Get movie details
  - `GET /content/movies/search?query=` - Search movies
  - `GET /content/movies/genre/{genreId}` - Filter by genre
  - `GET /content/movies/featured` - Get featured movies
- **Series Endpoints**:
  - `GET /content/series/{id}` - Get series with all seasons/episodes
  - `GET /content/series/{seriesId}/seasons/{seasonNumber}` - Get season details
  - `GET /content/series/{seriesId}/episodes/{episodeId}` - Get episode details
- **Access Control**:
  - `GET /content/{contentId}/access` - Check user access to content
  - Returns: `{ hasAccess, accessType, contentType, unlockedEpisodes }`
- **User Library**:
  - `GET /content/unlocked` - Get user's purchased content (movies + series)

### 3. Type Definitions

#### `src/types/auth.ts`:
- Updated `LoginRequest` to use `identifier` + `pin`
- Updated `RegisterRequest` to use `phoneNumber` + `pin` (no email required)
- Added `CoinWallet` interface with balance and transactions
- Updated `AuthUser` interface with proper backend fields:
  - `coinWallet`: Coin wallet with balance and transactions
  - `balance`: RWF balance
  - `phoneVerified`, `isEmailVerified`: Verification status
  - `loginCount`, `lastActive`: User activity tracking
  - `purchasedContent`, `watchHistory`: User content data

#### `src/types/content.ts`:
- Added `Genre` and `Category` interfaces (full objects, not just strings)
- Added `Subtitles` interface for multi-language subtitles
- Updated `Episode` interface with:
  - `priceInRwf`, `priceInCoins`: Pricing
  - `isFree`: Free episode flag
  - `isUnlocked`: User access status
  - `subtitles`: Multi-language subtitles
- Updated `Season` interface with:
  - `seasonTitle`: Season name
  - `userAccess`: User's access to episodes
- Updated `Content` interface with:
  - `posterImageUrl`, `trailerYoutubeLink`: Media URLs
  - `genres`, `categories`: Full objects (not strings)
  - `priceInRwf`, `priceInCoins`: Pricing
  - Series-specific pricing: `totalSeriesPriceInRwf`, `seriesDiscountPercent`, `discountedSeriesPriceInRwf`
  - User access info: `isPurchased`, `watchProgress`, `userAccess`

#### `src/types/user.ts`:
- Added `CoinWallet` interface
- Updated `User` interface to match `AuthUser` structure
- Separated `coinWallet.balance` (coins) from `balance` (RWF)

### 4. Auth Context (`src/contexts/AuthContext.tsx`)

#### Changes:
- Updated `login()` to handle new response format with `identifier` + `pin`
- Split registration into two methods:
  - `register()` - Step 1: Send OTP
  - `verifyRegistration()` - Step 2: Verify OTP and complete
- Updated token handling to work with both response formats:
  - `data.token` or `data.data.token`
  - `data.user` or `data.data.user`

### 5. Login Page (`src/pages/Auth/Login.tsx`)

#### Changes:
- Changed form fields from `emailOrUsername` + `password` to `identifier` + `pin`
- Updated field labels and placeholders
- Updated validation for identifier and PIN

### 6. Register Page (`src/pages/Auth/Register.tsx`)

#### Changes:
- Implemented 2-step registration flow:
  - **Step 1**: Enter username, phoneNumber, PIN, confirmPIN
  - **Step 2**: Enter verification code sent to phone
- Changed form fields from email+password to phoneNumber+PIN
- Added verification code input screen
- Added back button to return to registration form

### 7. Axios Configuration (`src/api/axios.ts`)

#### Changes:
- Updated base URL to `http://localhost:5000/api/v1`
- Updated token refresh endpoint to `/auth/refresh-token`
- Fixed token extraction from response (handles both `data.token` and `data.data.token`)

## Response Format Changes

### Authentication Responses
```typescript
// Login/Verify Registration Response
{
  status: "success",
  token: "jwt_token",
  refreshToken: "refresh_token",
  data: {
    user: { ...user_data }
  }
}

// Registration Step 1 Response
{
  status: "success",
  message: "Verification code sent",
  data: {
    phoneNumber: "+250...",
    username: "...",
    verificationRequired: true
  }
}
```

### Content Responses
```typescript
// Movies List Response
{
  status: "success",
  results: 10,
  pagination: {
    total: 50,
    page: 1,
    pages: 5
  },
  data: {
    movies: [ ...movies ]
  }
}

// Movie Details Response
{
  status: "success",
  data: {
    movie: { ...movie_data },
    isPurchased: false,
    watchProgress: null
  }
}

// Series Details Response
{
  status: "success",
  data: {
    series: {
      ...series_data,
      seasons: [
        {
          seasonNumber: 1,
          seasonTitle: "Season 1",
          episodes: [
            {
              episodeNumber: 1,
              title: "...",
              isUnlocked: false,
              priceInRwf: 500,
              priceInCoins: 10
            }
          ]
        }
      ],
      totalSeriesPriceInRwf: 5000,
      seriesDiscountPercent: 20,
      discountedSeriesPriceInRwf: 4000
    }
  }
}

// Access Check Response
{
  status: "success",
  data: {
    hasAccess: true,
    accessType: "full",
    contentType: "Movie"
  }
}

// Unlocked Content Response
{
  status: "success",
  results: {
    movies: 5,
    series: 3
  },
  data: {
    movies: [ ...movies ],
    series: [ ...series ]
  }
}
```

## Next Steps

1. **Test Authentication Flow**:
   - Test registration with OTP verification
   - Test login with username/phone + PIN
   - Test token refresh

2. **Implement Browse Page**:
   - Use `getPublishedMovies()` and `getPublishedSeries()`
   - Use `getFeaturedMovies()` for hero section
   - Use `searchMovies()` for search functionality

3. **Implement Content Details Page**:
   - Use `getMovieById()` or `getSeriesById()`
   - Display `isPurchased` and `watchProgress` status
   - Handle series with seasons/episodes

4. **Implement Watch Page**:
   - Use `checkAccess()` before playing
   - Display locked/unlocked episodes for series
   - Show pricing info for locked content

5. **Implement My Library Page**:
   - Use `getUnlockedContent()` to show purchased movies and series

6. **Add Payment Integration**:
   - Implement Flutterwave payment flow
   - Handle coin purchases and content purchases

## Testing Checklist

- [ ] User can register with phone number and verify OTP
- [ ] User can login with username or phone + PIN
- [ ] Token refresh works correctly on 401 errors
- [ ] Movies list loads with pagination
- [ ] Series list loads with seasons/episodes
- [ ] Content details show purchase status
- [ ] Access check works before video playback
- [ ] Unlocked content shows in library
- [ ] Search works correctly
- [ ] Genre filtering works
