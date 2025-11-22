// Content types
export interface Genre {
  _id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  description: string
  isActive: boolean
  isFeature: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Subtitles {
  en?: string
  fr?: string
  kin?: string
  _id?: string
}

export interface Episode {
  _id: string
  episodeNumber: number
  title: string
  description: string
  duration: number
  videoUrl: string
  trailerYoutubeLink?: string
  priceInRwf: number
  priceInCoins: number
  isFree: boolean
  subtitles?: Subtitles
  releaseDate: string
  createdAt: string
  updatedAt: string
  isUnlocked?: boolean
}

export interface Season {
  seasonNumber: number
  seasonTitle: string
  episodes: Episode[]
  _id: string
  userAccess?: {
    isPurchased: boolean
    unlockedEpisodes: string[]
  }
}

export interface Content {
  _id: string
  title: string
  description: string
  contentType: 'Movie' | 'Series'
  posterImageUrl: string
  trailerYoutubeLink?: string
  movieFileUrl?: string // For movies
  releaseYear: number
  duration?: number // in minutes, for movies
  genres: Genre[]
  categories: Category[]
  cast?: string[]
  director?: string
  countryOfOrigin?: string
  language?: string
  ageRating?: string
  rating?: number
  averageRating?: number
  ratingCount?: number
  viewCount?: number
  isFeatured: boolean
  isPublished: boolean
  priceInRwf: number
  priceInCoins: number
  isFree?: boolean
  subtitles?: Subtitles
  
  // For series
  seasons?: Season[]
  totalSeriesPriceInRwf?: number
  totalSeriesPriceInCoins?: number
  seriesDiscountPercent?: number
  discountedSeriesPriceInRwf?: number
  discountedSeriesPriceInCoins?: number
  totalEpisodes?: number
  finalSeriesPrice?: {
    price: number
    discount: number
    originalPrice: number
    currency: string
  }
  
  // User access info
  isPurchased?: boolean
  hasUnlockedEpisodes?: boolean
  userAccess?: {
    isPurchased: boolean
    unlockedEpisodes: string[]
  }
  watchProgress?: {
    progress: number
    duration: number
    lastWatched: string
  } | null
  
  createdAt: string
  updatedAt: string
}

export interface ContentFilters {
  contentType?: 'Movie' | 'Series'
  genres?: string[]
  minRating?: number
  maxRating?: number
  releaseYear?: number
  sortBy?: 'releaseYear' | 'averageRating' | 'title' | 'createdAt'
  order?: 'asc' | 'desc'
  limit?: number
  page?: number
}

export interface SearchParams {
  q: string
  contentType?: 'Movie' | 'Series'
  genre?: string
  minRating?: number
  page?: number
  limit?: number
}
