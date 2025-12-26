// User types
export interface WalletTransaction {
  amount: number
  type: string
  description: string
  createdAt: string
  _id: string
}

export interface Wallet {
  balance: number
  bonusBalance: number
  totalBalance?: number
  transactions: WalletTransaction[]
  _id: string
}

export interface User {
  _id: string
  username?: string
  email?: string
  phoneNumber?: string | null
  authProvider?: 'email' | 'phone' | 'google' | string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  role: 'user' | 'admin'
  location: string
  isActive: boolean
  isEmailVerified: boolean
  phoneVerified: boolean
  loginCount: number
  wallet: Wallet
  balance: number // RWF balance (legacy?)
  isTwoFactorEnabled: boolean
  pendingVerification: boolean
  preferredLanguage?: 'english' | 'french' | 'kinyarwanda'
  theme?: 'light' | 'dark'
  watchHistory: WatchHistory[]
  purchasedContent: string[]
  purchasedEpisodes: string[]
  purchasedSeasons: string[]
  transactions: any[]
  lastActive?: string
  createdAt: string
  updatedAt: string
}

export interface WatchHistory {
  contentId: string
  episodeId?: string
  lastPosition: number
  totalDuration: number
  completed: boolean
  lastWatchedAt: string
}

export interface UserLibrary {
  contentId: string
  content?: any
  purchaseDate: string
  purchasePrice: number
  paymentMethod: string
  watchProgress?: {
    lastPosition: number
    totalDuration: number
    completed: boolean
  }
}

export interface UpdateUserProfile {
  username?: string
  phoneNumber?: string
  firstName?: string
  lastName?: string
  preferredLanguage?: 'english' | 'french' | 'kinyarwanda'
  theme?: 'light' | 'dark'
}

export interface ChangePassword {
  oldPassword: string
  newPassword: string
}
