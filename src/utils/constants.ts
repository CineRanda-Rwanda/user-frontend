// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.cineranda.com'

// Payment Provider
export const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_PROVIDER || 'FLUTTERWAVE'
export const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY

// CDN URL
export const CDN_URL = import.meta.env.VITE_CDN_URL || 'https://cdn.cineranda.com'

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme'
} as const

// Content Types
export const CONTENT_TYPES = {
  MOVIE: 'Movie',
  SERIES: 'Series'
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  FLUTTERWAVE: 'FLUTTERWAVE',
  COINS: 'COINS'
} as const

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
} as const

// Genres
export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western'
] as const

// Video Quality Options
export const VIDEO_QUALITY = {
  AUTO: 'auto',
  '480p': '480p',
  '720p': '720p',
  '1080p': '1080p',
  '4K': '4k'
} as const

// Playback Speed Options
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const

// Pagination
export const DEFAULT_PAGE_SIZE = 24
export const DEFAULT_LIMIT = 50

// Debounce Delays
export const SEARCH_DEBOUNCE_DELAY = 300
export const PROGRESS_SAVE_INTERVAL = 5000 // 5 seconds

// Auto-next Episode Countdown
export const AUTO_NEXT_COUNTDOWN = 10 // seconds

// Token Refresh Buffer
export const TOKEN_REFRESH_BUFFER = 300000 // 5 minutes in milliseconds

// Image Placeholder
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect width="400" height="600" fill="%23141414"/%3E%3Ctext x="50%25" y="50%25" fill="%23666" font-family="Arial" font-size="24" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1440
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SEARCH: '/search',
  CONTENT_DETAILS: '/content/:id',
  WATCH: '/watch/:id',
  MY_LIBRARY: '/my-library',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password'
} as const
