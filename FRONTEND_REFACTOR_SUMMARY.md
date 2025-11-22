# Frontend Refactor Summary

The frontend has been refactored to align with the `Cineranda API (Complete).postman_collection.json` specification.

## Key Changes

### 1. Type Definitions
- **User**: Updated `Wallet` interface to match the API response (removed `CoinWallet`, added `bonusBalance`).
- **Content**: Updated `Content` interface to include `finalSeriesPrice` and other fields found in the Postman collection.

### 2. API Services (`src/api/`)
- **`content.ts`**:
  - Updated endpoints to use `/content/public/...`.
  - Added `searchContent` using `/content/search`.
  - Replaced `getPublishedMovies` and `getPublishedSeries` with `getContentByType`.
- **`wallet.ts`**:
  - Updated `getWalletBalance` to return the correct structure (`balance`, `bonusBalance`).
  - Updated `topUpWallet` to use the correct endpoint.
- **`payment.ts`**:
  - Updated purchase endpoints to match `/payments/content/purchase/wallet`.
  - Added support for `seasonId` and `episodeId` in purchase requests.

### 3. Pages & Components (`src/pages/`, `src/components/`)
- **`Browse.tsx`**:
  - Updated to use `contentAPI.getFeaturedContent` and `contentAPI.getContentByType`.
- **`Search.tsx`**:
  - Updated to use `contentAPI.searchContent`.
  - Removed calls to non-existent `getGenres` and `getCategories` endpoints.
  - Updated filter logic to work with the available data.
- **`ContentDetails.tsx`**:
  - Updated purchase logic to use the new payment API.
  - Updated wallet balance display to show "Bonus Balance" instead of "Coin Balance".
- **`Wallet.tsx`**:
  - Updated to display "Bonus Balance" and use `getWalletTransactions`.
- **`MyLibrary.tsx`**:
  - Verified compatibility with `/content/unlocked` endpoint.

## Notes
- The API does not provide endpoints to fetch a list of all genres or categories. The search page filters for genres/categories have been disabled (empty lists) to prevent errors.
- The wallet system now emphasizes "Bonus Balance" alongside the main RWF balance.
