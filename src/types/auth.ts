// Auth types
export interface LoginRequest {
  identifier: string // Can be username or phone number
  pin: string
}

export interface RegisterRequest {
  username: string
  phoneNumber: string
  pin: string
}

export interface CoinWallet {
  balance: number
  _id: string
  transactions: Array<{
    amount: number
    type: string
    description: string
    createdAt: string
    _id: string
  }>
}

export interface AuthUser {
  _id: string
  username: string
  phoneNumber: string
  email?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  role: 'user' | 'admin'
  location: string
  isActive: boolean
  isEmailVerified: boolean
  phoneVerified: boolean
  loginCount: number
  coinWallet: CoinWallet
  balance: number // RWF balance
  isTwoFactorEnabled: boolean
  pendingVerification: boolean
  preferredLanguage?: 'english' | 'french' | 'kinyarwanda'
  theme?: 'light' | 'dark'
  watchHistory: any[]
  purchasedContent: string[]
  transactions: any[]
  lastActive?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  status: string
  token: string
  refreshToken?: string
  user?: AuthUser
  data?: {
    user: AuthUser
  }
  message?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}
